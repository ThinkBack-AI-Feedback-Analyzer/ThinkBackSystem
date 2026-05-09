from django.db import models
from institutions.models import Institution, Course


class Student(models.Model):
    institution = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='students')
    courses     = models.ManyToManyField(Course, related_name='students', blank=True)
    student_id  = models.CharField(max_length=100)
    full_name   = models.CharField(max_length=255)
    email       = models.EmailField(blank=True, default='')
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table        = 'students'
        unique_together = [('institution', 'student_id')]
        ordering        = ['full_name']

    def __str__(self):
        return f"{self.student_id} — {self.full_name}"
