from rest_framework import serializers
from .models import PlacementOfficerProfile, InstitutionDetails
from institutions.serializers import InstitutionSerializer

class InstitutionDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstitutionDetails
        fields = (
            'id', 'placement_officer', 'student_strength', 'eligible_final_year_students',
            'placement_cell_email', 'placement_cell_phone', 'placement_season',
            'placement_policy', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'placement_officer', 'created_at', 'updated_at')


class PlacementOfficerProfileSerializer(serializers.ModelSerializer):
    institution_detail = InstitutionSerializer(source='institution', read_only=True)
    institution_details = InstitutionDetailsSerializer(read_only=True)

    class Meta:
        model = PlacementOfficerProfile
        fields = (
            'id', 'user', 'institution', 'institution_detail', 'full_name',
            'designation', 'official_email', 'mobile_number', 'is_verified',
            'institution_details', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'user', 'institution', 'created_at', 'updated_at')
