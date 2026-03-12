from django.contrib import admin
from .models import CustomUser

class CustomUserAdmin(admin.ModelAdmin):
    list_display = ('email', 'full_name', 'role', 'is_active', 'is_staff')
    search_fields = ('email', 'full_name', 'student_id')
    list_filter = ('role', 'is_active', 'is_staff')

admin.site.register(CustomUser, CustomUserAdmin)
