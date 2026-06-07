import logging
from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string

logger = logging.getLogger(__name__)


def send_superadmin_approval_email(institution, admin_user, superadmin_emails):
    """Notify all super admins that a new institution is awaiting approval."""
    if not superadmin_emails:
        return

    frontend_url = getattr(settings, 'FRONTEND_BASE_URL', 'http://localhost:5173')
    dashboard_url = f"{frontend_url}/superadmin"

    try:
        html_message = render_to_string('users/approval_notification.html', {
            'institution_name': institution.institution_name,
            'institution_type': institution.institution_type,
            'country': institution.country or '—',
            'admin_name': admin_user.full_name,
            'admin_email': admin_user.email,
            'dashboard_url': dashboard_url,
        })
        send_mail(
            subject=f"[ThinkBack] New Institution Registration: {institution.institution_name}",
            message=(
                f"A new institution has registered and is awaiting your approval.\n\n"
                f"Institution: {institution.institution_name}\n"
                f"Type: {institution.institution_type}\n"
                f"Admin: {admin_user.full_name} ({admin_user.email})\n\n"
                f"Visit the dashboard to approve or reject:\n{dashboard_url}"
            ),
            from_email=getattr(settings, 'EMAIL_FROM', 'noreply@thinkback.com'),
            recipient_list=superadmin_emails,
            html_message=html_message,
            fail_silently=False,
        )
    except Exception as exc:
        logger.exception("Failed to send superadmin approval notification: %s", exc)


def send_institution_approved_email(admin_user):
    """Tell the institution admin their account has been approved."""
    frontend_url = getattr(settings, 'FRONTEND_BASE_URL', 'http://localhost:5173')
    login_url = f"{frontend_url}/login"

    try:
        html_message = render_to_string('users/institution_approved.html', {
            'full_name': admin_user.full_name,
            'login_url': login_url,
        })
        send_mail(
            subject="[ThinkBack] Your Institution Has Been Approved!",
            message=(
                f"Hi {admin_user.full_name},\n\n"
                f"Great news! Your institution registration on ThinkBack has been approved.\n"
                f"You can now log in and start setting up your workspace:\n{login_url}\n\n"
                f"Welcome to ThinkBack!"
            ),
            from_email=getattr(settings, 'EMAIL_FROM', 'noreply@thinkback.com'),
            recipient_list=[admin_user.email],
            html_message=html_message,
            fail_silently=False,
        )
    except Exception as exc:
        logger.exception("Failed to send institution approved email: %s", exc)


def send_institution_rejected_email(admin_user, institution_name):
    """Tell the institution admin their registration was rejected."""
    try:
        html_message = render_to_string('users/institution_rejected.html', {
            'full_name': admin_user.full_name,
            'institution_name': institution_name,
        })
        send_mail(
            subject="[ThinkBack] Institution Registration Update",
            message=(
                f"Hi {admin_user.full_name},\n\n"
                f"Unfortunately, the registration for {institution_name} on ThinkBack "
                f"could not be approved at this time.\n\n"
                f"Please contact support if you believe this was a mistake."
            ),
            from_email=getattr(settings, 'EMAIL_FROM', 'noreply@thinkback.com'),
            recipient_list=[admin_user.email],
            html_message=html_message,
            fail_silently=False,
        )
    except Exception as exc:
        logger.exception("Failed to send institution rejected email: %s", exc)
