from django.contrib import admin
from .models import Institution, Faculty, Department


@admin.register(Institution)
class InstitutionAdmin(admin.ModelAdmin):
    list_display = ('institution_name', 'institution_type', 'country', 'is_active', 'created_at')
    list_filter = ('is_active', 'institution_type', 'country')
    search_fields = ('institution_name', 'address')


@admin.register(Faculty)
class FacultyAdmin(admin.ModelAdmin):
    list_display = ('faculty_name', 'institution', 'is_active', 'created_at')
    list_filter = ('is_active', 'institution')
    search_fields = ('faculty_name',)


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('department_name', 'faculty', 'institution', 'is_active', 'created_at')
    list_filter = ('is_active', 'institution', 'faculty')
    search_fields = ('department_name',)
