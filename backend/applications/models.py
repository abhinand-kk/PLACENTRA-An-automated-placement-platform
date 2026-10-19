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
    offer_letter_sent = models.BooleanField(default=False)
    offer_letter_sent_at = models.DateTimeField(null=True, blank=True)
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-applied_at']
        unique_together = ('student', 'job')

    def __str__(self):
        return f"{self.student} -> {self.job.job_title} ({self.get_application_status_display()})"


class Interview(models.Model):
    class InterviewType(models.TextChoices):
        TECHNICAL = 'Technical Interview', 'Technical Interview'
        HR = 'HR Interview', 'HR Interview'

    class InterviewMode(models.TextChoices):
        ONLINE = 'Online', 'Online'
        OFFLINE = 'Offline', 'Offline'
        HYBRID = 'Hybrid', 'Hybrid'

    class InterviewStatus(models.TextChoices):
        SCHEDULED = 'Scheduled', 'Scheduled'
        COMPLETED = 'Completed', 'Completed'
        CANCELLED = 'Cancelled', 'Cancelled'
        RESCHEDULED = 'Rescheduled', 'Rescheduled'

    application = models.ForeignKey(
        Application,
        on_delete=models.CASCADE,
        related_name='interviews'
    )
    interview_type = models.CharField(
        max_length=30,
        choices=InterviewType.choices,
        default=InterviewType.TECHNICAL
    )
    interview_date = models.DateField()
    interview_time = models.TimeField()
    duration_minutes = models.PositiveIntegerField(default=30)
    mode = models.CharField(
        max_length=20,
        choices=InterviewMode.choices,
        default=InterviewMode.ONLINE
    )
    location_or_link = models.CharField(
        max_length=500,
        blank=True,
        help_text="Meeting URL for Online or Venue Address for Offline/Hybrid"
    )
    instructions = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=InterviewStatus.choices,
        default=InterviewStatus.SCHEDULED
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['interview_date', 'interview_time']
        indexes = [
            models.Index(fields=['interview_date', 'interview_time']),
            models.Index(fields=['application', 'interview_type']),
        ]

    def __str__(self):
        return f"{self.interview_type} - {self.application.student} ({self.interview_date} {self.interview_time})"

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.application and self.application.application_status == Application.ApplicationStatus.SHORTLISTED:
            self.application.application_status = Application.ApplicationStatus.INTERVIEW_SCHEDULED
            self.application.save(update_fields=['application_status'])


