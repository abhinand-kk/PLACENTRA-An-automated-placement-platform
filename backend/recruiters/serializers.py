from rest_framework import serializers
from .models import RecruiterProfile, RecruiterHiringPreference
from master_data.serializers import (
    TargetJobRoleSerializer,
    HiringTypeSerializer,
    ProgramSerializer,
    BranchSerializer,
    WorkModeSerializer
)

class RecruiterHiringPreferenceSerializer(serializers.ModelSerializer):
    target_job_roles_detail = TargetJobRoleSerializer(source='target_job_roles', many=True, read_only=True)
    hiring_type_detail = HiringTypeSerializer(source='hiring_type', read_only=True)
    eligible_programs_detail = ProgramSerializer(source='eligible_programs', many=True, read_only=True)
    eligible_branches_detail = BranchSerializer(source='eligible_branches', many=True, read_only=True)
    work_mode_detail = WorkModeSerializer(source='work_mode', read_only=True)

    class Meta:
        model = RecruiterHiringPreference
        fields = (
            'id', 'recruiter', 'target_job_roles', 'target_job_roles_detail',
            'hiring_type', 'hiring_type_detail', 'eligible_programs', 'eligible_programs_detail',
            'eligible_branches', 'eligible_branches_detail', 'minimum_cgpa',
            'maximum_active_backlogs', 'expected_hiring_month', 'expected_students',
            'package_lpa', 'work_mode', 'work_mode_detail', 'campus_visit_required',
            'additional_requirements', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'recruiter', 'created_at', 'updated_at')

    def validate_minimum_cgpa(self, value):
        if value < 0 or value > 10.0:
            raise serializers.ValidationError("Minimum CGPA must be between 0.0 and 10.0.")
        return value


class RecruiterProfileSerializer(serializers.ModelSerializer):
    hiring_preference = RecruiterHiringPreferenceSerializer(read_only=True)

    class Meta:
        model = RecruiterProfile
        fields = (
            'id', 'user', 'company_name', 'recruiter_name', 'designation',
            'official_email', 'mobile_number', 'hiring_volume', 'is_verified',
            'hiring_preference', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'user', 'created_at', 'updated_at')
