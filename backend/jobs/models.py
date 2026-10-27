from django.db import models
from recruiters.models import RecruiterProfile
from master_data.models import EmploymentType, HiringType, TargetJobRole, Program, Branch, WorkMode


class Job(models.Model):
    class Status(models.TextChoices):
        PENDING_APPROVAL = 'Pending Approval', 'Pending Approval'
        OPEN = 'Open', 'Open'
        REJECTED = 'Rejected', 'Rejected'
        CLOSED = 'Closed', 'Closed'
        DRAFT = 'Draft', 'Draft'


    recruiter = models.ForeignKey(
        RecruiterProfile,
        on_delete=models.CASCADE,
        related_name='jobs'
    )
    job_title = models.CharField(max_length=255)
    job_description = models.TextField()
    employment_type = models.ForeignKey(EmploymentType, on_delete=models.RESTRICT)
    hiring_type = models.ForeignKey(HiringType, on_delete=models.RESTRICT)
    target_job_roles = models.ManyToManyField(TargetJobRole, related_name='jobs')
    eligible_programs = models.ManyToManyField(Program, related_name='jobs')
    eligible_branches = models.ManyToManyField(Branch, related_name='jobs')
    minimum_cgpa = models.DecimalField(max_digits=4, decimal_places=2, default=0.0)
    maximum_active_backlogs = models.PositiveIntegerField(default=0)
    expected_hiring_month = models.CharField(max_length=50)
    application_deadline = models.DateField()
    expected_students = models.PositiveIntegerField(default=1)
    package_lpa = models.DecimalField(max_digits=5, decimal_places=2)
    work_mode = models.ForeignKey(WorkMode, on_delete=models.RESTRICT)
    campus_visit_required = models.BooleanField(default=True)
    location = models.CharField(max_length=255)
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.DRAFT
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.job_title} - {self.recruiter.company_name}"


class PublicReferenceJob(models.Model):
    company_name = models.CharField(max_length=255)
    company_website = models.URLField(max_length=500)
    industry = models.CharField(max_length=150, default='Information Technology')
    job_title = models.CharField(max_length=255)
    job_description = models.TextField()
    location = models.CharField(max_length=255)
    work_mode = models.CharField(max_length=100, default='Hybrid')
    eligibility_criteria = models.TextField()
    package_details = models.CharField(max_length=255)
    application_deadline = models.CharField(max_length=100, blank=True, default='Active / Rolling Intake')
    application_url = models.URLField(max_length=500, help_text="Official direct application portal URL")
    source_url = models.URLField(max_length=500, help_text="Official careers page / authoritative source URL")
    verified_at = models.DateField(help_text="Date when information was verified from official source")
    is_active = models.BooleanField(default=True)
    is_reference_only = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['company_name', '-created_at']

    def __str__(self):
        return f"[Public Reference] {self.job_title} - {self.company_name}"

