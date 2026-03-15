from django.contrib import admin
from .models import Institution


@admin.register(Institution)
class InstitutionAdmin(admin.ModelAdmin):
    list_display = ('institution_name', 'institution_type', 'country', 'is_active', 'created_at')
    list_filter = ('is_active', 'institution_type', 'country')
    search_fields = ('institution_name', 'address')
