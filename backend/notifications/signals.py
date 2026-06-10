from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver


def _bulk_notify(recipients, notification_type, title, message, data=None):
    from .models import Notification
    objs = [
        Notification(
            recipient=user,
            notification_type=notification_type,
            title=title,
            message=message,
            data=data or {},
        )
        for user in recipients
    ]
    if objs:
        Notification.objects.bulk_create(objs)


# ── AnalysisJob ───────────────────────────────────────────────────────────────

@receiver(post_save, sender='feedback.AnalysisJob')
def on_analysis_job_save(sender, instance, created, **kwargs):
    if created or instance.status not in ('completed', 'failed'):
        return

    from .models import Notification
    already = Notification.objects.filter(
        data__job_id=instance.id,
        notification_type__in=('analysis_complete', 'analysis_failed'),
    ).exists()
    if already:
        return

    from users.models import User
    recipients = list(User.objects.filter(
        institution=instance.form.institution,
        is_active=True,
    ))
    form_title = instance.form.title

    if instance.status == 'completed':
        _bulk_notify(
            recipients,
            'analysis_complete',
            'Analysis Complete',
            f'AI analysis for "{form_title}" completed successfully.',
            {'job_id': instance.id, 'form_id': instance.form_id},
        )
    else:
        error_hint = f' {instance.error_message}' if instance.error_message else ''
        _bulk_notify(
            recipients,
            'analysis_failed',
            'Analysis Failed',
            f'AI analysis for "{form_title}" failed.{error_hint}',
            {'job_id': instance.id, 'form_id': instance.form_id},
        )


# ── FormResponse ──────────────────────────────────────────────────────────────

@receiver(post_save, sender='feedback.FormResponse')
def on_form_response_save(sender, instance, created, **kwargs):
    if not created:
        return

    from users.models import User
    recipients = list(User.objects.filter(
        institution=instance.form.institution,
        is_active=True,
        role__in=['institution_admin', 'coordinator'],
    ))
    _bulk_notify(
        recipients,
        'feedback_response',
        'New Feedback Response',
        f'A student submitted a response to "{instance.form.title}".',
        {'form_id': instance.form_id, 'response_id': instance.id},
    )


# ── Institution ───────────────────────────────────────────────────────────────

@receiver(pre_save, sender='institutions.Institution')
def track_institution_approval(sender, instance, **kwargs):
    if instance.pk:
        try:
            from institutions.models import Institution
            instance._prev_approval_status = (
                Institution.objects.values_list('approval_status', flat=True).get(pk=instance.pk)
            )
        except Exception:
            instance._prev_approval_status = None
    else:
        instance._prev_approval_status = None


@receiver(post_save, sender='institutions.Institution')
def on_institution_save(sender, instance, created, **kwargs):
    from users.models import User

    if created:
        if instance.approval_status == 'pending':
            system_admins = list(User.objects.filter(role='system_admin', is_active=True))
            _bulk_notify(
                system_admins,
                'new_institution',
                'New Institution Registration',
                f'"{instance.institution_name}" has registered and is awaiting approval.',
                {'institution_id': instance.id},
            )
        return

    prev = getattr(instance, '_prev_approval_status', None)
    if prev == instance.approval_status:
        return

    institution_admins = list(User.objects.filter(
        institution=instance,
        role='institution_admin',
        is_active=True,
    ))

    if instance.approval_status == 'approved':
        _bulk_notify(
            institution_admins,
            'institution_approved',
            'Institution Approved',
            f'Your institution "{instance.institution_name}" has been approved.',
            {'institution_id': instance.id},
        )
    elif instance.approval_status == 'rejected':
        _bulk_notify(
            institution_admins,
            'institution_rejected',
            'Institution Rejected',
            f'Your institution "{instance.institution_name}" registration was rejected.',
            {'institution_id': instance.id},
        )


# ── ContactMessage ────────────────────────────────────────────────────────────

@receiver(post_save, sender='superadmin.ContactMessage')
def on_contact_message_save(sender, instance, created, **kwargs):
    if not created:
        return

    from users.models import User
    system_admins = list(User.objects.filter(role='system_admin', is_active=True))
    _bulk_notify(
        system_admins,
        'contact_message',
        'New Contact Message',
        f'New message from {instance.name}: "{instance.subject}"',
        {'message_id': instance.id},
    )
