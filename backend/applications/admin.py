from django.contrib import admin
from .models import Application

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('student', 'job', 'application_status', 'applied_at', 'updated_at')
    list_filter = ('application_status', 'applied_at')
    search_fields = ('student__register_number', 'student__first_name', 'student__last_name', 'job__job_title', 'job__recruiter__company_name')
    ordering = ('-applied_at',)
