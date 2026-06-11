from datetime import timedelta

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from superadmin.models import AuditLog


class Command(BaseCommand):
    help = 'Delete audit logs older than AUDIT_LOG_RETENTION_DAYS (default 90)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--days',
            type=int,
            default=None,
            help='Override retention period in days',
        )

    def handle(self, *args, **options):
        days = options['days'] or getattr(settings, 'AUDIT_LOG_RETENTION_DAYS', 90)
        cutoff = timezone.now() - timedelta(days=days)
        deleted, _ = AuditLog.objects.filter(created_at__lt=cutoff).delete()
        self.stdout.write(self.style.SUCCESS(f'Deleted {deleted} audit log(s) older than {days} days.'))
