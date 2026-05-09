import uuid
import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('feedback', '0001_initial'),
        ('students', '0002_remove_student_course_student_courses'),
    ]

    operations = [
        migrations.CreateModel(
            name='FormToken',
            fields=[
                ('id',         models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('token',      models.UUIDField(default=uuid.uuid4, unique=True, editable=False)),
                ('is_used',    models.BooleanField(default=False)),
                ('sent_at',    models.DateTimeField(blank=True, null=True)),
                ('used_at',    models.DateTimeField(blank=True, null=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('form',       models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tokens',     to='feedback.feedbackform')),
                ('student',    models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='form_tokens', to='students.student')),
            ],
            options={
                'db_table': 'form_tokens',
            },
        ),
        migrations.AddConstraint(
            model_name='formtoken',
            constraint=models.UniqueConstraint(fields=['form', 'student'], name='unique_form_student'),
        ),
        migrations.CreateModel(
            name='FormResponse',
            fields=[
                ('id',           models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('submitted_at', models.DateTimeField(auto_now_add=True)),
                ('form',         models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='responses', to='feedback.feedbackform')),
                ('token',        models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='response', to='feedback.formtoken')),
            ],
            options={
                'db_table': 'form_responses',
            },
        ),
        migrations.CreateModel(
            name='FormAnswer',
            fields=[
                ('id',       models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('answer',   models.TextField(blank=True)),
                ('question', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='feedback.feedbackquestion')),
                ('response', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='answers', to='feedback.formresponse')),
            ],
            options={
                'db_table': 'form_answers',
            },
        ),
    ]
