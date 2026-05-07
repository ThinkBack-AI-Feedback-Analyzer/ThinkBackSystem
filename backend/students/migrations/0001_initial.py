from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('institutions', '0002_course'),
    ]

    operations = [
        migrations.CreateModel(
            name='Student',
            fields=[
                ('id',         models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('student_id', models.CharField(max_length=100)),
                ('full_name',  models.CharField(max_length=255)),
                ('email',      models.EmailField(blank=True, default='')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('institution', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='students', to='institutions.institution')),
                ('course',      models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='students', to='institutions.course')),
            ],
            options={
                'db_table': 'students',
                'ordering': ['full_name'],
            },
        ),
        migrations.AlterUniqueTogether(
            name='student',
            unique_together={('institution', 'student_id')},
        ),
    ]
