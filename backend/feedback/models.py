from django.db import models
from institutions.models import Institution


class FeedbackForm(models.Model):
    STATUS_CHOICES = [('draft', 'Draft'), ('published', 'Published')]
    TYPE_CHOICES   = [('Exam', 'Exam'), ('Lab', 'Lab'), ('Course', 'Course'), ('Custom', 'Custom')]

    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='feedback_forms')
    title       = models.CharField(max_length=255)
    form_type   = models.CharField(max_length=20, choices=TYPE_CHOICES, default='Custom')
    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'feedback_forms'
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class FeedbackQuestion(models.Model):
    TYPE_CHOICES = [
        ('open_ended',       'Open Ended'),
        ('multiple_choice',  'Multiple Choice'),
        ('yes_no',           'Yes/No'),
        ('rating',           'Rating'),
    ]

    form          = models.ForeignKey(FeedbackForm, on_delete=models.CASCADE, related_name='questions')
    text          = models.TextField()
    question_type = models.CharField(max_length=30, choices=TYPE_CHOICES, default='open_ended')
    options       = models.JSONField(default=list)
    order         = models.PositiveIntegerField(default=0)

    class Meta:
        db_table = 'feedback_questions'
        ordering = ['order']
