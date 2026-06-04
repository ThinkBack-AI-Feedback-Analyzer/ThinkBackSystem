from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

DEFAULT_EMAIL    = 'superadmin@thinkback.com'
DEFAULT_PASSWORD = 'ThinkBack@2024!'
DEFAULT_NAME     = 'Super Admin'


class Command(BaseCommand):
    help = 'Seed the default system super admin account'

    def add_arguments(self, parser):
        parser.add_argument('--email',    default=DEFAULT_EMAIL,    help='Super admin email')
        parser.add_argument('--password', default=DEFAULT_PASSWORD, help='Super admin password')
        parser.add_argument('--name',     default=DEFAULT_NAME,     help='Super admin full name')
        parser.add_argument('--force',    action='store_true',      help='Update password if user already exists')

    def handle(self, *args, **options):
        email    = options['email']
        password = options['password']
        name     = options['name']

        if User.objects.filter(email=email).exists():
            if options['force']:
                user = User.objects.get(email=email)
                user.set_password(password)
                user.role         = 'system_admin'
                user.is_staff     = True
                user.is_superuser = True
                user.is_active    = True
                user.save()
                self.stdout.write(self.style.WARNING(f'Updated existing super admin: {email}'))
            else:
                self.stdout.write(self.style.WARNING(f'Super admin already exists: {email} (use --force to update)'))
            return

        User.objects.create_superuser(
            email=email,
            password=password,
            full_name=name,
        )

        self.stdout.write(self.style.SUCCESS(
            f'\nSuper admin created successfully!\n'
            f'  Email   : {email}\n'
            f'  Password: {password}\n'
            f'\nChange the password after first login.\n'
        ))
