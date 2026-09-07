from rest_framework import serializers
from .models import (
    InstitutionType,
    Program,
    Branch,
    QualificationType,
    EmploymentType,
    HiringType,
    WorkMode,
    TargetJobRole
)

class InstitutionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = InstitutionType
        fields = ('id', 'name')
        read_only_fields = ('id',)


class ProgramSerializer(serializers.ModelSerializer):
    class Meta:
        model = Program
        fields = ('id', 'name')
        read_only_fields = ('id',)


class BranchSerializer(serializers.ModelSerializer):
    program_name = serializers.CharField(source='program.name', read_only=True)

    class Meta:
        model = Branch
        fields = ('id', 'program', 'program_name', 'name')
        read_only_fields = ('id',)


class QualificationTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = QualificationType
        fields = ('id', 'name')
        read_only_fields = ('id',)


class EmploymentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmploymentType
        fields = ('id', 'name')
        read_only_fields = ('id',)


class HiringTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = HiringType
        fields = ('id', 'name')
        read_only_fields = ('id',)


class WorkModeSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkMode
        fields = ('id', 'name')
        read_only_fields = ('id',)


class TargetJobRoleSerializer(serializers.ModelSerializer):
    class Meta:
        model = TargetJobRole
        fields = ('id', 'name')
        read_only_fields = ('id',)
