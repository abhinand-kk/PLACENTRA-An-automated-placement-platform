from django.db import models
from students.models import StudentProfile
from jobs.models import Job


class Application(models.Model):
    class ApplicationStatus(models.TextChoices):
        APPLIED = 'Applied', 'Applied'
        UNDER_REVIEW = 'Under Review', 'Under Review'
        SHORTLISTED = 'Shortlisted', 'Shortlisted'
        INTERVIEW_SCHEDULED = 'Interview Scheduled', 'Interview Scheduled'
        SELECTED = 'Selected', 'Selected'
        REJECTED = 'Rejected', 'Rejected'

    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='applications'
    )
    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='applications'
    )
    application_status = models.CharField(
        max_length=30,
        choices=ApplicationStatus.choices,
        default=ApplicationStatus.APPLIED
    )
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-applied_at']
        unique_together = ('student', 'job')

    def __str__(self):
        return f"{self.student} -> {self.job.job_title} ({self.get_application_status_display()})"
