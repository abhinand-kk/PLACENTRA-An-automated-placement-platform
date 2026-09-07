from django.contrib import admin
from .models import Job

@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = ('job_title', 'recruiter', 'employment_type', 'hiring_type', 'package_lpa', 'status', 'application_deadline', 'created_at')
    list_filter = ('status', 'employment_type', 'hiring_type', 'work_mode')
    search_fields = ('job_title', 'recruiter__company_name', 'location')
    filter_horizontal = ('target_job_roles', 'eligible_programs', 'eligible_branches')
    ordering = ('-created_at',)
