import uuid
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


class FormToken(models.Model):
    form       = models.ForeignKey(FeedbackForm, on_delete=models.CASCADE, related_name='tokens')
    student    = models.ForeignKey('students.Student', on_delete=models.CASCADE, related_name='form_tokens')
    token      = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    is_used    = models.BooleanField(default=False)
    sent_at    = models.DateTimeField(null=True, blank=True)
    used_at    = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table        = 'form_tokens'
        unique_together = [('form', 'student')]

    def __str__(self):
        return f"{self.student} → {self.form}"


class FormResponse(models.Model):
    form         = models.ForeignKey(FeedbackForm, on_delete=models.CASCADE, related_name='responses')
    token        = models.OneToOneField(FormToken, on_delete=models.CASCADE, related_name='response')
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'form_responses'


class FormAnswer(models.Model):
    response = models.ForeignKey(FormResponse, on_delete=models.CASCADE, related_name='answers')
    question = models.ForeignKey(FeedbackQuestion, on_delete=models.CASCADE)
    answer   = models.TextField(blank=True)

    class Meta:
        db_table = 'form_answers'
