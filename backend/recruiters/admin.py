from django.contrib import admin
from .models import RecruiterProfile, RecruiterHiringPreference

class RecruiterHiringPreferenceInline(admin.StackedInline):
    model = RecruiterHiringPreference
    can_delete = False
    filter_horizontal = ('target_job_roles', 'eligible_programs', 'eligible_branches')


@admin.register(RecruiterProfile)
class RecruiterProfileAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'recruiter_name', 'designation', 'official_email', 'mobile_number', 'hiring_volume', 'is_verified', 'created_at')
    list_filter = ('is_verified', 'hiring_volume')
    search_fields = ('company_name', 'recruiter_name', 'official_email', 'user__email')
    ordering = ('company_name',)
    inlines = [RecruiterHiringPreferenceInline]


@admin.register(RecruiterHiringPreference)
class RecruiterHiringPreferenceAdmin(admin.ModelAdmin):
    list_display = ('recruiter', 'hiring_type', 'work_mode', 'package_lpa', 'minimum_cgpa', 'maximum_active_backlogs', 'campus_visit_required')
    list_filter = ('hiring_type', 'work_mode', 'campus_visit_required')
    search_fields = ('recruiter__company_name', 'recruiter__recruiter_name')
    filter_horizontal = ('target_job_roles', 'eligible_programs', 'eligible_branches')
