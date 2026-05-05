from django.db import models


class Institution(models.Model):
    institution_name = models.CharField(max_length=255, null=False)
    institution_type = models.CharField(max_length=100, null=False)
    logo = models.ImageField(upload_to='institution_logos/', null=True, blank=True)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    country = models.CharField(max_length=100, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.institution_name

    class Meta:
        db_table = 'institutions'


class Course(models.Model):
    institution   = models.ForeignKey(Institution, on_delete=models.CASCADE, related_name='courses')
    title         = models.CharField(max_length=255)
    code          = models.CharField(max_length=50)
    faculty_name  = models.CharField(max_length=255)
    academic_year = models.CharField(max_length=20)
    description   = models.TextField(blank=True, default='')
    coordinator   = models.CharField(max_length=255, blank=True, default='')
    lecturer      = models.CharField(max_length=255, blank=True, default='')
    created_at    = models.DateTimeField(auto_now_add=True)
    updated_at    = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.code} — {self.title}"

    class Meta:
        db_table = 'courses'
        ordering = ['-created_at']
