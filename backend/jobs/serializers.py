from rest_framework import serializers
from .models import Job
from recruiters.serializers import RecruiterProfileSerializer
from master_data.serializers import (
    EmploymentTypeSerializer,
    HiringTypeSerializer,
    TargetJobRoleSerializer,
    ProgramSerializer,
    BranchSerializer,
    WorkModeSerializer
)

from master_data.models import EmploymentType, HiringType, TargetJobRole, Program, Branch, WorkMode

class JobSerializer(serializers.ModelSerializer):
    recruiter_detail = RecruiterProfileSerializer(source='recruiter', read_only=True)
    employment_type = serializers.PrimaryKeyRelatedField(queryset=EmploymentType.objects.all(), required=False, allow_null=True)
    employment_type_detail = EmploymentTypeSerializer(source='employment_type', read_only=True)
    hiring_type = serializers.PrimaryKeyRelatedField(queryset=HiringType.objects.all(), required=False, allow_null=True)
    hiring_type_detail = HiringTypeSerializer(source='hiring_type', read_only=True)
    target_job_roles = serializers.PrimaryKeyRelatedField(queryset=TargetJobRole.objects.all(), many=True, required=False)
    target_job_roles_detail = TargetJobRoleSerializer(source='target_job_roles', many=True, read_only=True)
    eligible_programs = serializers.PrimaryKeyRelatedField(queryset=Program.objects.all(), many=True, required=False)
    eligible_programs_detail = ProgramSerializer(source='eligible_programs', many=True, read_only=True)
    eligible_branches = serializers.PrimaryKeyRelatedField(queryset=Branch.objects.all(), many=True, required=False)
    eligible_branches_detail = BranchSerializer(source='eligible_branches', many=True, read_only=True)
    work_mode = serializers.PrimaryKeyRelatedField(queryset=WorkMode.objects.all(), required=False, allow_null=True)
    work_mode_detail = WorkModeSerializer(source='work_mode', read_only=True)
    expected_hiring_month = serializers.CharField(max_length=50, required=False, allow_blank=True, default='Immediate')

    class Meta:
        model = Job
        fields = (
            'id', 'recruiter', 'recruiter_detail', 'job_title', 'job_description',
            'employment_type', 'employment_type_detail', 'hiring_type', 'hiring_type_detail',
            'target_job_roles', 'target_job_roles_detail', 'eligible_programs', 'eligible_programs_detail',
            'eligible_branches', 'eligible_branches_detail', 'minimum_cgpa',
            'maximum_active_backlogs', 'expected_hiring_month', 'application_deadline',
            'expected_students', 'package_lpa', 'work_mode', 'work_mode_detail',
            'campus_visit_required', 'location', 'status', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'recruiter', 'created_at', 'updated_at')

    def validate_minimum_cgpa(self, value):
        if value < 0 or value > 10.0:
            raise serializers.ValidationError("Minimum CGPA must be between 0.0 and 10.0.")
        return value
