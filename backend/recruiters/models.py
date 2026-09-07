from django.db import models
from django.conf import settings
from master_data.models import TargetJobRole, HiringType, Program, Branch, WorkMode


class RecruiterProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='recruiter_profile'
    )
    company_name = models.CharField(max_length=255)
    recruiter_name = models.CharField(max_length=150)
    designation = models.CharField(max_length=150)
    official_email = models.EmailField()
    mobile_number = models.CharField(max_length=20)
    hiring_volume = models.CharField(max_length=100)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['company_name']

    def __str__(self):
        return f"{self.company_name} ({self.recruiter_name})"


class RecruiterHiringPreference(models.Model):
    recruiter = models.OneToOneField(
        RecruiterProfile,
        on_delete=models.CASCADE,
        related_name='hiring_preference'
    )
    target_job_roles = models.ManyToManyField(
        TargetJobRole,
        related_name='recruiter_preferences'
    )
    hiring_type = models.ForeignKey(
        HiringType,
        on_delete=models.RESTRICT,
        related_name='recruiter_preferences'
    )
    eligible_programs = models.ManyToManyField(
        Program,
        related_name='recruiter_preferences'
    )
    eligible_branches = models.ManyToManyField(
        Branch,
        related_name='recruiter_preferences'
    )
    minimum_cgpa = models.DecimalField(max_digits=4, decimal_places=2, default=0.0)
    maximum_active_backlogs = models.PositiveIntegerField(default=0)
    expected_hiring_month = models.CharField(max_length=50)
    expected_students = models.PositiveIntegerField(default=1)
    package_lpa = models.DecimalField(max_digits=5, decimal_places=2)
    work_mode = models.ForeignKey(
        WorkMode,
        on_delete=models.RESTRICT,
        related_name='recruiter_preferences'
    )
    campus_visit_required = models.BooleanField(default=True)
    additional_requirements = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Hiring Preference - {self.recruiter.company_name}"
