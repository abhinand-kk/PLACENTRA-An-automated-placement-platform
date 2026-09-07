from django.db import models
from django.conf import settings
from institutions.models import Institution


class PlacementOfficerProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='placement_officer_profile'
    )
    institution = models.OneToOneField(
        Institution,
        on_delete=models.CASCADE,
        related_name='placement_officer_profile'
    )
    full_name = models.CharField(max_length=150)
    designation = models.CharField(max_length=150)
    official_email = models.EmailField()
    mobile_number = models.CharField(max_length=20)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['full_name']

    def __str__(self):
        return f"{self.full_name} - {self.institution.institution_name}"


class InstitutionDetails(models.Model):
    placement_officer = models.OneToOneField(
        PlacementOfficerProfile,
        on_delete=models.CASCADE,
        related_name='institution_details'
    )
    student_strength = models.PositiveIntegerField()
    eligible_final_year_students = models.PositiveIntegerField()
    placement_cell_email = models.EmailField()
    placement_cell_phone = models.CharField(max_length=20)
    placement_season = models.CharField(max_length=50)
    placement_policy = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Institution Details - {self.placement_officer.institution.institution_name}"
