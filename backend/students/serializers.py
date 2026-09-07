from rest_framework import serializers
from .models import (
    StudentProfile,
    StudentContact,
    StudentCurrentEducation,
    StudentPreviousEducation,
    StudentExperience,
    StudentDocument
)
from master_data.serializers import ProgramSerializer, BranchSerializer, QualificationTypeSerializer, EmploymentTypeSerializer


class StudentContactSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentContact
        fields = (
            'id', 'student', 'primary_email', 'personal_email', 'mobile_number',
            'country', 'state', 'district', 'city', 'pincode', 'permanent_address'
        )
        read_only_fields = ('id', 'student')


class StudentCurrentEducationSerializer(serializers.ModelSerializer):
    program_detail = ProgramSerializer(source='program', read_only=True)
    branch_detail = BranchSerializer(source='branch', read_only=True)

    class Meta:
        model = StudentCurrentEducation
        fields = (
            'id', 'student', 'program', 'program_detail', 'branch', 'branch_detail',
            'field_of_study', 'start_date', 'end_date', 'batch', 'semester',
            'cgpa', 'active_backlogs'
        )
        read_only_fields = ('id', 'student')

    def validate_cgpa(self, value):
        if value < 0 or value > 10.0:
            raise serializers.ValidationError("CGPA must be between 0.0 and 10.0.")
        return value


class StudentPreviousEducationSerializer(serializers.ModelSerializer):
    qualification_type_detail = QualificationTypeSerializer(source='qualification_type', read_only=True)

    class Meta:
        model = StudentPreviousEducation
        fields = (
            'id', 'student', 'qualification_type', 'qualification_type_detail',
            'institution_name', 'board_or_university', 'year_of_passing', 'percentage'
        )
        read_only_fields = ('id', 'student')

    def validate_percentage(self, value):
        if value < 0 or value > 100.0:
            raise serializers.ValidationError("Percentage must be between 0.0 and 100.0.")
        return value


class StudentExperienceSerializer(serializers.ModelSerializer):
    employment_type_detail = EmploymentTypeSerializer(source='employment_type', read_only=True)

    class Meta:
        model = StudentExperience
        fields = (
            'id', 'student', 'company_name', 'designation', 'employment_type',
            'employment_type_detail', 'location', 'start_date', 'end_date', 'description'
        )
        read_only_fields = ('id', 'student')

    def validate(self, attrs):
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError({"end_date": "End date cannot be prior to start date."})
        return attrs


class StudentDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentDocument
        fields = (
            'id', 'student', 'resume', 'class10_certificate',
            'class12_certificate', 'degree_marksheet', 'uploaded_at'
        )
        read_only_fields = ('id', 'student', 'uploaded_at')


from institutions.serializers import InstitutionSerializer


class StudentProfileSerializer(serializers.ModelSerializer):
    institution_detail = InstitutionSerializer(source='institution', read_only=True)
    contact = StudentContactSerializer(read_only=True)
    current_education = StudentCurrentEducationSerializer(read_only=True)
    previous_educations = StudentPreviousEducationSerializer(many=True, read_only=True)
    experiences = StudentExperienceSerializer(many=True, read_only=True)
    documents = StudentDocumentSerializer(read_only=True)
    profile_photo = serializers.SerializerMethodField()

    class Meta:
        model = StudentProfile
        fields = (
            'id', 'user', 'institution', 'institution_detail', 'register_number', 'first_name',
            'middle_name', 'last_name', 'gender', 'date_of_birth', 'blood_group',
            'profile_photo', 'profile_completion', 'contact', 'current_education',
            'previous_educations', 'experiences', 'documents', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'user', 'profile_completion', 'created_at', 'updated_at')

    def get_profile_photo(self, obj):
        if not obj.profile_photo:
            return None
        try:
            url = obj.profile_photo.url
        except Exception:
            return None
        request = self.context.get('request')
        if request is not None:
            return request.build_absolute_uri(url)
        if url.startswith('http://') or url.startswith('https://'):
            return url
        return f"http://localhost:8000{url}" if url.startswith('/') else f"http://localhost:8000/media/{url}"
