import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('feedback', '0001_initial'),
    ]

    operations = [
        # Change analyzed_at from auto_now_add to auto_now so it updates on every save
        migrations.AlterField(
            model_name='analysisresult',
            name='analyzed_at',
            field=models.DateTimeField(auto_now=True),
        ),

        # New AnalysisJob tracking table
        migrations.CreateModel(
            name='AnalysisJob',
            fields=[
                ('id',             models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('trigger_source', models.CharField(choices=[('manual', 'Manual'), ('auto', 'Auto')], default='manual', max_length=10)),
                ('status',         models.CharField(choices=[('queued', 'Queued'), ('running', 'Running'), ('completed', 'Completed'), ('failed', 'Failed')], default='queued', max_length=10)),
                ('response_count', models.PositiveIntegerField(blank=True, null=True)),
                ('triggered_at',   models.DateTimeField(auto_now_add=True)),
                ('started_at',     models.DateTimeField(blank=True, null=True)),
                ('completed_at',   models.DateTimeField(blank=True, null=True)),
                ('error_message',  models.TextField(blank=True, default='')),
                ('form',           models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='analysis_jobs', to='feedback.feedbackform')),
            ],
            options={
                'db_table': 'analysis_jobs',
                'ordering': ['-triggered_at'],
            },
        ),
    ]
