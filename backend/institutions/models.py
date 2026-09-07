from django.db import models
from master_data.models import InstitutionType

class Institution(models.Model):
    institution_name = models.CharField(max_length=255)
    institution_type = models.ForeignKey(
        InstitutionType,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='institutions'
    )
    affiliated_university = models.CharField(max_length=255, blank=True)
    address = models.TextField()
    district = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    website = models.URLField(blank=True, null=True)
    placement_email = models.EmailField()
    placement_phone = models.CharField(max_length=20)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['institution_name']

    def __str__(self):
        return self.institution_name
