import requests
from collections import defaultdict

from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone


@shared_task
def close_expired_forms():
    from .models import FeedbackForm
    now = timezone.now()
    count = FeedbackForm.objects.filter(
        status='published',
        close_date__lte=now,
    ).update(status='closed')
    return f'Closed {count} expired form(s).'


@shared_task
def send_feedback_email(token_id):
    from .models import FormToken
    try:
        ft = FormToken.objects.select_related('form', 'form__institution', 'student', 'course').get(id=token_id)
    except FormToken.DoesNotExist:
        return

    link         = f"{settings.FRONTEND_BASE_URL}/feedback/respond?token={ft.token}"
    institution  = ft.form.institution.institution_name
    course_line  = f"Course:      {ft.course.code}: {ft.course.title}\n" if ft.course else ""
    course_subj  = f" ({ft.course.code})" if ft.course else ""

    send_mail(
        subject=f"Feedback Request: {ft.form.title}{course_subj}",
        message=(
            f"Dear {ft.student.full_name},\n\n"
            f"{institution} has invited you to complete the following feedback form:\n\n"
            f"Form:        {ft.form.title}\n"
            f"{course_line}"
            f"Type:        {ft.form.form_type}\n\n"
            f"Please click the link below to respond:\n{link}\n\n"
            f"This link is unique to you and can only be used once.\n"
            f"{'Your responses will be kept anonymous.' if ft.form.is_anonymous else 'Your name will be recorded with your response.'}\n\n"
            f"Thank you,\n{institution} via ThinkBack"
        ),
        from_email=settings.EMAIL_FROM,
        recipient_list=[ft.student.email],
        fail_silently=False,
    )
    ft.sent_at = timezone.now()
    ft.save(update_fields=['sent_at'])


@shared_task
def run_ai_analysis(form_id, job_id=None):
    from .models import FeedbackForm, FormAnswer, AnalysisResult, AnalysisJob

    # ── Resolve job record ────────────────────────────────────────────────────
    job = None
    if job_id:
        try:
            job = AnalysisJob.objects.get(id=job_id)
        except AnalysisJob.DoesNotExist:
            pass

    def _fail(msg):
        if job:
            job.status        = 'failed'
            job.error_message = msg
            job.completed_at  = timezone.now()
            job.save(update_fields=['status', 'error_message', 'completed_at'])

    # ── Mark as running ───────────────────────────────────────────────────────
    if job:
        job.status     = 'running'
        job.started_at = timezone.now()
        job.save(update_fields=['status', 'started_at'])

    try:
        form = FeedbackForm.objects.get(id=form_id)
    except FeedbackForm.DoesNotExist:
        _fail('Form not found.')
        return

    # Question types whose answers carry natural-language sentiment.
    # Numeric 'rating' answers are excluded — a bare "4" gives the BERT
    # topic / ABSA sentiment models no aspect or polarity signal.
    NLP_QUESTION_TYPES = ['open_ended', 'yes_no', 'multiple_choice']

    answers = (
        FormAnswer.objects
        .filter(response__form=form, question__question_type__in=NLP_QUESTION_TYPES)
        .exclude(answer='')
        .select_related('question', 'response__token__student')
        .prefetch_related('response__token__student__courses')
    )

    # Record how many responses are being processed (text + rating answers)
    response_count = (
        FormAnswer.objects
        .filter(response__form=form,
                question__question_type__in=NLP_QUESTION_TYPES + ['rating'])
        .exclude(answer='')
        .values('response').distinct().count()
    )
    if job:
        job.response_count = response_count
        job.save(update_fields=['response_count'])

    course_texts = defaultdict(list)
    for ans in answers:
        student = ans.response.token.student

        # Combine question + answer so short/closed answers ("Yes", an option
        # label) carry the topic and polarity context the models need. Matches
        # the trained input format: "How are the assignments - Too many assignments"
        question_text = ans.question.text.strip()
        answer_text   = ans.answer.strip()
        text          = f"{question_text} - {answer_text}" if question_text else answer_text

        courses = list(student.courses.all())
        if courses:
            for course in courses:
                course_texts[f"{course.code} — {course.title}"].append(text)
        else:
            course_texts['General (No Course)'].append(text)

    # ── Collect rating answers for numeric aggregation ────────────────────────
    # Ratings are quantitative — they skip the NLP models and are averaged.
    rating_answers = (
        FormAnswer.objects
        .filter(response__form=form, question__question_type='rating')
        .exclude(answer='')
        .select_related('question', 'response__token__student')
        .prefetch_related('response__token__student__courses')
    )

    # {course_name: {question_text: [float, ...]}}
    course_ratings = defaultdict(lambda: defaultdict(list))
    rating_scales  = {}  # question_text -> max value on its scale
    for ans in rating_answers:
        try:
            value = float(ans.answer)
        except (TypeError, ValueError):
            continue

        qtext = ans.question.text.strip()
        options = ans.question.options or []
        try:
            rating_scales[qtext] = max(float(o) for o in options) if options else 5.0
        except (TypeError, ValueError):
            rating_scales[qtext] = 5.0

        student = ans.response.token.student
        courses = list(student.courses.all())
        if courses:
            for course in courses:
                course_ratings[f"{course.code} — {course.title}"][qtext].append(value)
        else:
            course_ratings['General (No Course)'][qtext].append(value)

    def build_rating_stats(question_map):
        stats = []
        for qtext, values in question_map.items():
            if not values:
                continue
            n         = len(values)
            avg       = sum(values) / n
            max_scale = rating_scales.get(qtext, 5.0) or 5.0
            distribution = {}
            for v in values:
                key = str(int(v)) if float(v).is_integer() else str(v)
                distribution[key] = distribution.get(key, 0) + 1
            stats.append({
                'question':     qtext,
                'average':      round(avg, 2),
                'max':          max_scale,
                'satisfaction': round((avg / max_scale) * 100) if max_scale else 0,
                'count':        n,
                'distribution': distribution,
            })
        # Worst-rated first, so problems surface at the top
        stats.sort(key=lambda s: s['satisfaction'])
        return stats

    # ── Nothing to analyse at all ─────────────────────────────────────────────
    if not course_texts and not course_ratings:
        AnalysisResult.objects.update_or_create(
            form=form,
            course_name='General (No Course)',
            defaults={'results': [], 'rating_results': []},
        )
        if job:
            job.status       = 'completed'
            job.completed_at = timezone.now()
            job.save(update_fields=['status', 'completed_at'])
        return

    ai_url      = getattr(settings, 'AI_SERVICE_URL', 'http://127.0.0.1:8001')
    any_success = False

    # Process every course that has text and/or ratings
    for course_name in set(course_texts) | set(course_ratings):
        texts        = course_texts.get(course_name, [])
        nlp_results  = []
        nlp_ok       = True   # stays True when there's no text to send

        if texts:
            nlp_ok = False
            try:
                resp = requests.post(
                    f'{ai_url}/analyze',
                    json={'course_name': course_name, 'texts': texts},
                    timeout=120,
                )
                if resp.status_code == 200:
                    nlp_results = resp.json().get('results', [])
                    nlp_ok      = True
                    any_success = True
            except Exception:
                pass

        rating_stats = build_rating_stats(course_ratings.get(course_name, {}))
        if rating_stats:
            any_success = True

        # Preserve a prior NLP result if this run's AI call failed
        result_obj, _ = AnalysisResult.objects.get_or_create(
            form=form,
            course_name=course_name,
            defaults={'results': [], 'rating_results': []},
        )
        if nlp_ok:
            result_obj.results = nlp_results
        result_obj.rating_results = rating_stats
        result_obj.save()

    # ── Mark job complete or failed ───────────────────────────────────────────
    if job:
        if any_success:
            job.status       = 'completed'
            job.error_message = ''
        else:
            job.status        = 'failed'
            job.error_message = 'AI service unreachable or returned no results.'
        job.completed_at = timezone.now()
        job.save(update_fields=['status', 'error_message', 'completed_at'])
