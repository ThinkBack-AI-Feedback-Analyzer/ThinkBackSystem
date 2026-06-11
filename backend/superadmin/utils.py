from .models import AuditLog


def log_action(user, action, target_type, target_id, target_name):
    AuditLog.objects.create(
        performed_by=user,
        action=action,
        target_type=target_type,
        target_id=target_id,
        target_name=target_name,
    )
