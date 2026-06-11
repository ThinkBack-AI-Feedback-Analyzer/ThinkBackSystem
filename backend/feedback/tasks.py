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

    answers = (
        FormAnswer.objects
        .filter(response__form=form, question__question_type='open_ended')
        .exclude(answer='')
        .select_related('response__token__student')
        .prefetch_related('response__token__student__courses')
    )

    # Record how many responses are being processed
    response_count = answers.values('response').distinct().count()
    if job:
        job.response_count = response_count
        job.save(update_fields=['response_count'])

    course_texts = defaultdict(list)
    for ans in answers:
        student = ans.response.token.student
        courses = list(student.courses.all())
        if courses:
            for course in courses:
                course_texts[f"{course.code} — {course.title}"].append(ans.answer)
        else:
            course_texts['General (No Course)'].append(ans.answer)

    if not course_texts:
        AnalysisResult.objects.update_or_create(
            form=form,
            course_name='General (No Course)',
            defaults={'results': []},
        )
        if job:
            job.status       = 'completed'
            job.completed_at = timezone.now()
            job.save(update_fields=['status', 'completed_at'])
        return

    ai_url = getattr(settings, 'AI_SERVICE_URL', 'http://127.0.0.1:8001')
    any_success = False

    for course_name, texts in course_texts.items():
        try:
            resp = requests.post(
                f'{ai_url}/analyze',
                json={'course_name': course_name, 'texts': texts},
                timeout=120,
            )
            if resp.status_code == 200:
                AnalysisResult.objects.update_or_create(
                    form=form,
                    course_name=course_name,
                    defaults={'results': resp.json().get('results', [])},
                )
                any_success = True
        except Exception:
            pass

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
