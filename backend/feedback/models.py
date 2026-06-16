import uuid
from django.db import models
from institutions.models import Institution


class FeedbackForm(models.Model):
    STATUS_CHOICES = [('draft', 'Draft'), ('published', 'Published'), ('closed', 'Closed')]
    TYPE_CHOICES   = [('Exam', 'Exam'), ('Lab', 'Lab'), ('Course', 'Course'), ('Custom', 'Custom')]

    institution  = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='feedback_forms')
    title        = models.CharField(max_length=255)
    form_type    = models.CharField(max_length=20, choices=TYPE_CHOICES, default='Custom')
    status       = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    close_date   = models.DateTimeField(null=True, blank=True)
    is_anonymous = models.BooleanField(default=True)
    created_at   = models.DateTimeField(auto_now_add=True)
    updated_at   = models.DateTimeField(auto_now=True)

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
    course     = models.ForeignKey('institutions.Course', on_delete=models.SET_NULL, null=True, blank=True, related_name='form_tokens')
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


class AnalysisResult(models.Model):
    form           = models.ForeignKey(FeedbackForm, on_delete=models.CASCADE, related_name='analysis_results')
    course_name    = models.CharField(max_length=255, default='All Responses')
    results        = models.JSONField()
    rating_results = models.JSONField(default=list, blank=True)
    analyzed_at    = models.DateTimeField(auto_now=True)

    class Meta:
        db_table        = 'analysis_results'
        constraints     = [models.UniqueConstraint(fields=['form', 'course_name'], name='unique_form_course_analysis')]


class AnalysisJob(models.Model):
    STATUS_CHOICES = [
        ('queued',    'Queued'),
        ('running',   'Running'),
        ('completed', 'Completed'),
        ('failed',    'Failed'),
    ]
    SOURCE_CHOICES = [
        ('manual', 'Manual'),
        ('auto',   'Auto'),
    ]

    form           = models.ForeignKey(FeedbackForm, on_delete=models.CASCADE, related_name='analysis_jobs')
    trigger_source = models.CharField(max_length=10, choices=SOURCE_CHOICES, default='manual')
    status         = models.CharField(max_length=10, choices=STATUS_CHOICES, default='queued')
    response_count = models.PositiveIntegerField(null=True, blank=True)
    triggered_at   = models.DateTimeField(auto_now_add=True)
    started_at     = models.DateTimeField(null=True, blank=True)
    completed_at   = models.DateTimeField(null=True, blank=True)
    error_message  = models.TextField(blank=True, default='')

    class Meta:
        db_table = 'analysis_jobs'
        ordering = ['-triggered_at']
