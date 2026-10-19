from datetime import datetime, date
from rest_framework import serializers
from .models import Application, Interview
from students.serializers import StudentProfileSerializer
from jobs.serializers import JobSerializer

class ApplicationSerializer(serializers.ModelSerializer):
    student_detail = StudentProfileSerializer(source='student', read_only=True)
    job_detail = JobSerializer(source='job', read_only=True)
    student_name = serializers.SerializerMethodField()
    register_number = serializers.SerializerMethodField()
    job_title = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    interviews = serializers.SerializerMethodField()
    offer_letter_url = serializers.SerializerMethodField()
    offer_letter_available = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = (
            'id', 'student', 'student_detail', 'job', 'job_detail',
            'student_name', 'register_number', 'job_title', 'status',
            'application_status', 'offer_letter_sent', 'offer_letter_sent_at',
            'offer_letter_url', 'offer_letter_available',
            'applied_at', 'updated_at', 'interviews'
        )
        read_only_fields = ('id', 'student', 'offer_letter_sent', 'offer_letter_sent_at', 'applied_at', 'updated_at')

    def get_student_name(self, obj):
        if obj.student:
            fn = (obj.student.first_name or '').strip()
            mn = (obj.student.middle_name or '').strip()
            ln = (obj.student.last_name or '').strip()
            full = f"{fn} {mn} {ln}".replace('  ', ' ').strip()
            return full if full else "Name Not Available"
        return "Name Not Available"

    def get_register_number(self, obj):
        return obj.student.register_number if obj.student else ""

    def get_job_title(self, obj):
        return obj.job.job_title if obj.job else ""

    def get_status(self, obj):
        return obj.application_status

    def get_interviews(self, obj):
        items = obj.interviews.all()
        return [
            {
                'id': i.id,
                'interview_type': i.interview_type,
                'interview_date': i.interview_date.strftime("%Y-%m-%d") if i.interview_date else None,
                'interview_time': i.interview_time.strftime("%H:%M:%S") if i.interview_time else None,
                'duration_minutes': i.duration_minutes,
                'mode': i.mode,
                'location_or_link': i.location_or_link,
                'instructions': i.instructions,
                'status': i.status
            }
            for i in items
        ]

    def get_offer_letter_url(self, obj):
        if obj.application_status == Application.ApplicationStatus.SELECTED:
            return f"/api/v1/applications/{obj.id}/offer-letter/"
        return None

    def get_offer_letter_available(self, obj):
        return obj.application_status == Application.ApplicationStatus.SELECTED

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


class InterviewSerializer(serializers.ModelSerializer):
    application_detail = ApplicationSerializer(source='application', read_only=True)
    candidate_name = serializers.SerializerMethodField()
    register_number = serializers.SerializerMethodField()
    job_title = serializers.SerializerMethodField()
    company_name = serializers.SerializerMethodField()
    student_id = serializers.SerializerMethodField()
    recruiter_id = serializers.SerializerMethodField()

    class Meta:
        model = Interview
        fields = (
            'id', 'application', 'application_detail',
            'candidate_name', 'register_number', 'job_title', 'company_name',
            'student_id', 'recruiter_id',
            'interview_type', 'interview_date', 'interview_time',
            'duration_minutes', 'mode', 'location_or_link',
            'instructions', 'status', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')

    def get_candidate_name(self, obj):
        sp = obj.application.student
        return f"{sp.first_name} {sp.last_name}".strip()

    def get_register_number(self, obj):
        return obj.application.student.register_number if obj.application and obj.application.student else ""

    def get_job_title(self, obj):
        return obj.application.job.job_title

    def get_company_name(self, obj):
        recruiter = getattr(obj.application.job, 'recruiter', None)
        return recruiter.company_name if recruiter else "Company"

    def get_student_id(self, obj):
        return obj.application.student.id

    def get_recruiter_id(self, obj):
        recruiter = getattr(obj.application.job, 'recruiter', None)
        return recruiter.id if recruiter else None


class InterviewCreateUpdateSerializer(serializers.ModelSerializer):
    interview_date = serializers.DateField(input_formats=['%Y-%m-%d', '%d-%m-%Y', '%Y/%m/%d', '%d/%m/%Y', 'iso-8601'])

    class Meta:
        model = Interview
        fields = (
            'id', 'application', 'interview_type', 'interview_date',
            'interview_time', 'duration_minutes', 'mode',
            'location_or_link', 'instructions', 'status'
        )
        read_only_fields = ('id',)

    def validate(self, attrs):
        application = attrs.get('application') or (self.instance.application if self.instance else None)
        interview_date = attrs.get('interview_date') or (self.instance.interview_date if self.instance else None)
        interview_time = attrs.get('interview_time') or (self.instance.interview_time if self.instance else None)
        interview_type = attrs.get('interview_type') or (self.instance.interview_type if self.instance else None)
        mode = attrs.get('mode') or (self.instance.mode if self.instance else None)
        location_or_link = attrs.get('location_or_link', getattr(self.instance, 'location_or_link', ''))

        if not application:
            raise serializers.ValidationError({"application": "Application is required."})

        # 1. Candidate Eligibility Validation: Must be SHORTLISTED or INTERVIEW_SCHEDULED
        valid_statuses = [
            Application.ApplicationStatus.SHORTLISTED,
            Application.ApplicationStatus.INTERVIEW_SCHEDULED
        ]
        if application.application_status not in valid_statuses:
            raise serializers.ValidationError({
                "application": f"Interviews can only be scheduled for shortlisted candidates. Current candidate status is '{application.get_application_status_display()}'."
            })

        # 2. Recruiter Ownership Validation (checked against request user if recruiter)
        request = self.context.get('request')
        if request and hasattr(request.user, 'recruiter_profile'):
            recruiter = request.user.recruiter_profile
            if application.job.recruiter != recruiter:
                raise serializers.ValidationError({
                    "application": "You are not authorized to schedule interviews for another recruiter's candidates."
                })

        # 3. Past Date & Time Validation
        if interview_date:
            today = date.today()
            if interview_date < today:
                raise serializers.ValidationError({
                    "interview_date": "Interview date cannot be in the past."
                })
            if interview_date == today and interview_time:
                now_time = datetime.now().time()
                if interview_time < now_time:
                    raise serializers.ValidationError({
                        "interview_time": "Interview time cannot be in the past for today's date."
                    })

        # 4. Mode Validation
        if mode == Interview.InterviewMode.ONLINE and not location_or_link.strip():
            raise serializers.ValidationError({
                "location_or_link": "Meeting link URL is required for Online interviews."
            })
        elif mode == Interview.InterviewMode.OFFLINE and not location_or_link.strip():
            raise serializers.ValidationError({
                "location_or_link": "Venue location is required for Offline interviews."
            })

        # 5. Duplicate Protection: Prevent duplicate active round creation for same application
        status = attrs.get('status', getattr(self.instance, 'status', Interview.InterviewStatus.SCHEDULED))
        if status in [Interview.InterviewStatus.SCHEDULED, Interview.InterviewStatus.RESCHEDULED]:
            qs = Interview.objects.filter(
                application=application,
                interview_type=interview_type,
                status__in=[Interview.InterviewStatus.SCHEDULED, Interview.InterviewStatus.RESCHEDULED]
            )
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
                exact_dup = qs.filter(interview_date=interview_date, interview_time=interview_time)
                if exact_dup.exists():
                    raise serializers.ValidationError({
                        "non_field_errors": f"An active {interview_type} is already scheduled for this candidate at the exact same date and time ({interview_date} {interview_time})."
                    })
            else:
                if qs.exists():
                    raise serializers.ValidationError({
                        "interview_type": f"An active {interview_type} is already scheduled for this candidate application. Please update/reschedule the existing interview instead of creating a duplicate."
                    })

        return attrs


    def create(self, validated_data):
        return super().create(validated_data)

    def update(self, instance, validated_data):
        return super().update(instance, validated_data)

