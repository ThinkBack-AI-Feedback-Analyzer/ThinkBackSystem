from django.db import models
from django.conf import settings


class ContactMessage(models.Model):
    name       = models.CharField(max_length=255)
    email      = models.EmailField()
    subject    = models.CharField(max_length=255)
    message    = models.TextField()
    is_read    = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'contact_messages'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.subject} — {self.email}"


class AuditLog(models.Model):
    ACTION_CHOICES = (
        ('activate_institution',   'Activate Institution'),
        ('deactivate_institution', 'Deactivate Institution'),
        ('delete_institution',     'Delete Institution'),
        ('approve_institution',    'Approve Institution'),
        ('reject_institution',     'Reject Institution'),
        ('activate_user',          'Activate User'),
        ('deactivate_user',        'Deactivate User'),
        ('change_password',        'Change Password'),
        ('update_profile',         'Update Profile'),
    )

    performed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        related_name='audit_logs',
    )
    action      = models.CharField(max_length=50, choices=ACTION_CHOICES)
    target_type = models.CharField(max_length=50)   # 'institution' | 'user' | 'profile'
    target_id   = models.IntegerField(null=True, blank=True)
    target_name = models.CharField(max_length=255)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'superadmin_audit_logs'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.action} — {self.target_name}"
