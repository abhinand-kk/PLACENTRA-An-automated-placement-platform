from rest_framework import serializers
from .models import PlacementDrive
from institutions.serializers import InstitutionSerializer
from recruiters.serializers import RecruiterProfileSerializer
from jobs.serializers import JobSerializer
from recruiters.models import RecruiterProfile
from jobs.models import Job

class PlacementDriveSerializer(serializers.ModelSerializer):
    institution_detail = InstitutionSerializer(source='institution', read_only=True)
    recruiter = serializers.PrimaryKeyRelatedField(queryset=RecruiterProfile.objects.all(), required=False, allow_null=True)
    recruiter_detail = RecruiterProfileSerializer(source='recruiter', read_only=True)
    job = serializers.PrimaryKeyRelatedField(queryset=Job.objects.all(), required=False, allow_null=True)
    job_detail = JobSerializer(source='job', read_only=True)

    class Meta:
        model = PlacementDrive
        fields = (
            'id', 'institution', 'institution_detail', 'recruiter', 'recruiter_detail',
            'job', 'job_detail', 'drive_title', 'drive_date', 'drive_time',
            'venue', 'description', 'status', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'institution', 'created_at', 'updated_at')
