from django.contrib import admin
from .models import Institution

@admin.register(Institution)
class InstitutionAdmin(admin.ModelAdmin):
    list_display = ('institution_name', 'institution_type', 'district', 'state', 'placement_email', 'placement_phone', 'is_active', 'created_at')
    list_filter = ('institution_type', 'state', 'district', 'is_active')
    search_fields = ('institution_name', 'affiliated_university', 'placement_email', 'placement_phone')
    ordering = ('institution_name',)
