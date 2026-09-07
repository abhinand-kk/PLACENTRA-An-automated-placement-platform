from django.contrib import admin
from .models import PlacementDrive

@admin.register(PlacementDrive)
class PlacementDriveAdmin(admin.ModelAdmin):
    list_display = ('drive_title', 'institution', 'recruiter', 'job', 'drive_date', 'drive_time', 'venue', 'status')
    list_filter = ('status', 'drive_date', 'institution')
    search_fields = ('drive_title', 'institution__institution_name', 'recruiter__company_name', 'venue')
    ordering = ('-drive_date', '-drive_time')
