from django.db import models
from django.conf import settings


class Notification(models.Model):
    TYPE_CHOICES = [
        ('analysis_complete',    'Analysis Complete'),
        ('analysis_failed',      'Analysis Failed'),
        ('feedback_response',    'New Feedback Response'),
        ('institution_approved', 'Institution Approved'),
        ('institution_rejected', 'Institution Rejected'),
        ('new_institution',      'New Institution Registered'),
        ('contact_message',      'New Contact Message'),
    ]

    recipient         = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications',
    )
    notification_type = models.CharField(max_length=30, choices=TYPE_CHOICES)
    title             = models.CharField(max_length=255)
    message           = models.TextField()
    data              = models.JSONField(default=dict, blank=True)
    is_read           = models.BooleanField(default=False)
    created_at        = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.notification_type} → {self.recipient}"
