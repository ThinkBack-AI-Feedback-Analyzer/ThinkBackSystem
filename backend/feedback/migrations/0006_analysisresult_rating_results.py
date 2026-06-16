from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('feedback', '0005_formtoken_course'),
    ]

    operations = [
        migrations.AddField(
            model_name='analysisresult',
            name='rating_results',
            field=models.JSONField(blank=True, default=list),
        ),
    ]
