from rest_framework import serializers
from .models import Application
from students.serializers import StudentProfileSerializer
from jobs.serializers import JobSerializer

class ApplicationSerializer(serializers.ModelSerializer):
    student_detail = StudentProfileSerializer(source='student', read_only=True)
    job_detail = JobSerializer(source='job', read_only=True)

    class Meta:
        model = Application
        fields = (
            'id', 'student', 'student_detail', 'job', 'job_detail',
            'application_status', 'applied_at', 'updated_at'
        )
        read_only_fields = ('id', 'student', 'applied_at', 'updated_at')

    def validate(self, attrs):
        student = self.context.get('student') or attrs.get('student')
        job = attrs.get('job')

        if student and job:
            qs = Application.objects.filter(student=student, job=job)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError("Student has already applied to this job posting.")
        return attrs
