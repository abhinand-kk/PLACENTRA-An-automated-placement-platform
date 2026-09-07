from django.contrib import admin
from .models import (
    StudentProfile,
    StudentContact,
    StudentCurrentEducation,
    StudentPreviousEducation,
    StudentExperience,
    StudentDocument
)

class StudentContactInline(admin.StackedInline):
    model = StudentContact
    can_delete = False


class StudentCurrentEducationInline(admin.StackedInline):
    model = StudentCurrentEducation
    can_delete = False


class StudentDocumentInline(admin.StackedInline):
    model = StudentDocument
    can_delete = False


class StudentPreviousEducationInline(admin.TabularInline):
    model = StudentPreviousEducation
    extra = 1


class StudentExperienceInline(admin.TabularInline):
    model = StudentExperience
    extra = 1


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('register_number', 'first_name', 'last_name', 'gender', 'institution', 'profile_completion', 'created_at')
    list_filter = ('institution', 'gender', 'profile_completion')
    search_fields = ('register_number', 'first_name', 'last_name', 'user__email')
    ordering = ('first_name', 'last_name')
    inlines = [
        StudentContactInline,
        StudentCurrentEducationInline,
        StudentPreviousEducationInline,
        StudentExperienceInline,
        StudentDocumentInline
    ]


@admin.register(StudentContact)
class StudentContactAdmin(admin.ModelAdmin):
    list_display = ('student', 'primary_email', 'mobile_number', 'state', 'district')
    search_fields = ('primary_email', 'personal_email', 'mobile_number', 'student__register_number')


@admin.register(StudentCurrentEducation)
class StudentCurrentEducationAdmin(admin.ModelAdmin):
    list_display = ('student', 'program', 'branch', 'batch', 'cgpa', 'active_backlogs')
    list_filter = ('program', 'branch', 'batch')
    search_fields = ('student__register_number', 'student__first_name', 'student__last_name')


@admin.register(StudentPreviousEducation)
class StudentPreviousEducationAdmin(admin.ModelAdmin):
    list_display = ('student', 'qualification_type', 'institution_name', 'year_of_passing', 'percentage')
    list_filter = ('qualification_type', 'year_of_passing')
    search_fields = ('institution_name', 'board_or_university', 'student__register_number')


@admin.register(StudentExperience)
class StudentExperienceAdmin(admin.ModelAdmin):
    list_display = ('student', 'company_name', 'designation', 'employment_type', 'start_date', 'end_date')
    list_filter = ('employment_type',)
    search_fields = ('company_name', 'designation', 'student__register_number')


@admin.register(StudentDocument)
class StudentDocumentAdmin(admin.ModelAdmin):
    list_display = ('student', 'uploaded_at')
    search_fields = ('student__register_number', 'student__first_name')
