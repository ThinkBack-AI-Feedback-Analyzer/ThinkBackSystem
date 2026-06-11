from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('feedback', '0002_analysisresult_analyzed_at_analysojob'),
    ]

    operations = [
        migrations.AddField(
            model_name='feedbackform',
            name='close_date',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='feedbackform',
            name='is_anonymous',
            field=models.BooleanField(default=False),
        ),
    ]
