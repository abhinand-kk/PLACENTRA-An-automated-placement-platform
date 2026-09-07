from django.db import models
from institutions.models import Institution
from recruiters.models import RecruiterProfile
from jobs.models import Job


class PlacementDrive(models.Model):
    class DriveStatus(models.TextChoices):
        UPCOMING = 'Upcoming', 'Upcoming'
        ONGOING = 'Ongoing', 'Ongoing'
        COMPLETED = 'Completed', 'Completed'
        CANCELLED = 'Cancelled', 'Cancelled'

    institution = models.ForeignKey(
        Institution,
        on_delete=models.CASCADE,
        related_name='placement_drives'
    )
    recruiter = models.ForeignKey(
        RecruiterProfile,
        on_delete=models.CASCADE,
        related_name='placement_drives'
    )
    job = models.ForeignKey(
        Job,
        on_delete=models.CASCADE,
        related_name='placement_drives'
    )
    drive_title = models.CharField(max_length=255)
    drive_date = models.DateField()
    drive_time = models.TimeField()
    venue = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    status = models.CharField(
        max_length=20,
        choices=DriveStatus.choices,
        default=DriveStatus.UPCOMING
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-drive_date', '-drive_time']

    def __str__(self):
        return f"{self.drive_title} - {self.institution.institution_name} ({self.recruiter.company_name})"
