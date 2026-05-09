from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.utils import timezone


@shared_task
def send_feedback_email(token_id):
    from .models import FormToken
    try:
        ft = FormToken.objects.select_related('form', 'student').get(id=token_id)
    except FormToken.DoesNotExist:
        return

    link = f"{settings.FRONTEND_BASE_URL}/feedback/respond?token={ft.token}"

    send_mail(
        subject=f"Feedback Request: {ft.form.title}",
        message=(
            f"Dear {ft.student.full_name},\n\n"
            f"You have been invited to fill out the feedback form: {ft.form.title}\n\n"
            f"Click the link below to respond:\n{link}\n\n"
            f"This link is unique to you and can only be used once.\n\n"
            f"Thank you,\nThinkBack Team"
        ),
        from_email=settings.EMAIL_FROM,
        recipient_list=[ft.student.email],
        fail_silently=False,
    )
    ft.sent_at = timezone.now()
    ft.save(update_fields=['sent_at'])
