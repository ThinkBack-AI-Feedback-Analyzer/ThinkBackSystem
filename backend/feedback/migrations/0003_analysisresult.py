import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('feedback', '0002_formtoken_formresponse_formanswer'),
    ]

    operations = [
        migrations.CreateModel(
            name='AnalysisResult',
            fields=[
                ('id',          models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('course_name', models.CharField(max_length=255, default='All Responses')),
                ('results',     models.JSONField()),
                ('analyzed_at', models.DateTimeField(auto_now_add=True)),
                ('form',        models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='analysis_results', to='feedback.feedbackform')),
            ],
            options={'db_table': 'analysis_results'},
        ),
        migrations.AddConstraint(
            model_name='analysisresult',
            constraint=models.UniqueConstraint(fields=['form', 'course_name'], name='unique_form_course_analysis'),
        ),
    ]
