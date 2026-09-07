from django.contrib import admin
from .models import PlacementOfficerProfile, InstitutionDetails

class InstitutionDetailsInline(admin.StackedInline):
    model = InstitutionDetails
    can_delete = False


@admin.register(PlacementOfficerProfile)
class PlacementOfficerProfileAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'designation', 'institution', 'official_email', 'mobile_number', 'is_verified', 'created_at')
    list_filter = ('is_verified', 'institution')
    search_fields = ('full_name', 'official_email', 'institution__institution_name', 'user__email')
    ordering = ('full_name',)
    inlines = [InstitutionDetailsInline]


@admin.register(InstitutionDetails)
class InstitutionDetailsAdmin(admin.ModelAdmin):
    list_display = ('placement_officer', 'student_strength', 'eligible_final_year_students', 'placement_cell_email', 'placement_cell_phone', 'placement_season')
    search_fields = ('placement_officer__full_name', 'placement_officer__institution__institution_name', 'placement_cell_email')
