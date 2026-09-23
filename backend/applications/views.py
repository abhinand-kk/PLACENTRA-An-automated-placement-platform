from datetime import date
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Application
from .serializers import ApplicationSerializer
from .permissions import IsStudentUser, IsApplicationParticipant
from jobs.models import Job


class ApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = ApplicationSerializer

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Application.objects.none()

        qs = Application.objects.select_related(
            'student',
            'student__institution',
            'student__contact',
            'student__current_education',
            'student__current_education__program',
            'student__current_education__branch',
            'student__documents',
            'job',
            'job__recruiter',
            'job__employment_type',
            'job__hiring_type',
            'job__work_mode'
        ).prefetch_related(
            'student__previous_educations',
            'student__previous_educations__qualification_type',
            'student__experiences',
            'student__experiences__employment_type',
            'job__target_job_roles',
            'job__eligible_programs',
            'job__eligible_branches'
        )

        if hasattr(user, 'recruiter_profile'):
            return qs.filter(job__recruiter=user.recruiter_profile)
        elif hasattr(user, 'student_profile'):
            return qs.filter(student=user.student_profile)
        elif hasattr(user, 'placement_officer_profile'):
            return qs.filter(student__institution=user.placement_officer_profile.institution)
        elif user.is_staff or user.is_superuser:
            return qs
        return Application.objects.none()


    def get_permissions(self):
        if self.action in ['create', 'my_applications', 'student_dashboard', 'destroy']:
            return [IsStudentUser()]
        elif self.action in ['job_applications', 'status_update', 'recruiter_dashboard']:
            return [permissions.IsAuthenticated()]
        return [IsApplicationParticipant()]

    def create(self, request, *args, **kwargs):
        student = getattr(request.user, 'student_profile', None)
        if not student:
            return Response({'error': 'Only registered students can apply for jobs.'}, status=status.HTTP_403_FORBIDDEN)

        job_id = request.data.get('job')
        if not job_id:
            return Response({'error': 'Job ID is required.'}, status=status.HTTP_400_BAD_REQUEST)

        job = get_object_or_404(Job, pk=job_id)

        # Check job status and recruiter approval
        if job.status != Job.Status.OPEN or getattr(job.recruiter, 'approval_status', 'Approved') != 'Approved':
            return Response({'error': 'Applications are closed or pending approval for this job posting.'}, status=status.HTTP_400_BAD_REQUEST)


        # Check application deadline
        if date.today() > job.application_deadline:
            return Response({'error': 'The application deadline for this job posting has passed.'}, status=status.HTTP_400_BAD_REQUEST)

        # Check duplicate application
        if Application.objects.filter(student=student, job=job).exists():
            return Response({'error': 'You have already applied for this job posting.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = self.get_serializer(data=request.data, context={'student': student})
        serializer.is_valid(raise_exception=True)
        serializer.save(student=student, job=job)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def destroy(self, request, *args, **kwargs):
        application = self.get_object()
        student = getattr(request.user, 'student_profile', None)

        if not student or application.student != student:
            return Response({'error': 'You can only withdraw your own applications.'}, status=status.HTTP_403_FORBIDDEN)

        if date.today() > application.job.application_deadline:
            return Response({'error': 'Applications cannot be withdrawn after the deadline.'}, status=status.HTTP_400_BAD_REQUEST)

        application.delete()
        return Response({'message': 'Application withdrawn successfully.'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='my-applications')
    def my_applications(self, request):
        student = getattr(request.user, 'student_profile', None)
        if not student:
            return Response({'error': 'Student profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        qs = Application.objects.select_related(
            'student', 'job', 'job__recruiter'
        ).filter(student=student)

        status_param = request.query_params.get('status')
        if status_param and status_param != 'All':
            qs = qs.filter(application_status__iexact=status_param)

        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path=r'job/(?P<job_id>\d+)')
    def job_applications(self, request, job_id=None):
        recruiter = getattr(request.user, 'recruiter_profile', None)
        if not recruiter:
            return Response({'error': 'Only recruiters can view job applicants.'}, status=status.HTTP_403_FORBIDDEN)

        job = get_object_or_404(Job, pk=job_id)
        if job.recruiter != recruiter:
            return Response({'error': 'You can only view applicants for your own jobs.'}, status=status.HTTP_403_FORBIDDEN)

        qs = Application.objects.select_related(
            'student',
            'student__current_education',
            'student__current_education__program',
            'student__current_education__branch',
            'student__documents'
        ).filter(job=job)

        page = self.paginate_queryset(qs)

        def format_applicant(app):
            sp = app.student
            ce = getattr(sp, 'current_education', None)
            docs = getattr(sp, 'documents', None)
            return {
                'id': app.id,
                'student_name': f"{sp.first_name} {sp.last_name}".strip(),
                'register_number': sp.register_number,
                'program': ce.program.name if ce and ce.program else None,
                'branch': ce.branch.name if ce and ce.branch else None,
                'cgpa': float(ce.cgpa) if ce and ce.cgpa is not None else None,
                'status': app.application_status,
                'applied_at': app.applied_at,
                'resume_url': docs.resume.url if docs and docs.resume else None
            }

        if page is not None:
            data = [format_applicant(app) for app in page]
            return self.get_paginated_response(data)

        data = [format_applicant(app) for app in qs]
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'], url_path='status')
    def status_update(self, request, pk=None):
        application = self.get_object()
        recruiter = getattr(request.user, 'recruiter_profile', None)

        if not recruiter or application.job.recruiter != recruiter:
            return Response({'error': 'Only the job owner recruiter can update application status.'}, status=status.HTTP_403_FORBIDDEN)

        new_status = request.data.get('status')
        valid_statuses = [choice[0] for choice in Application.ApplicationStatus.choices]
        if new_status not in valid_statuses:
            return Response({
                'error': f'Invalid status. Allowed choices: {", ".join(valid_statuses)}'
            }, status=status.HTTP_400_BAD_REQUEST)

        application.application_status = new_status
        application.save(update_fields=['application_status'])
        serializer = self.get_serializer(application)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='recruiter-dashboard')
    def recruiter_dashboard(self, request):
        recruiter = getattr(request.user, 'recruiter_profile', None)
        if not recruiter:
            return Response({'error': 'Recruiter profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        recruiter_apps = Application.objects.filter(job__recruiter=recruiter)
        data = {
            'total_applications': recruiter_apps.count(),
            'under_review': recruiter_apps.filter(application_status=Application.ApplicationStatus.UNDER_REVIEW).count(),
            'shortlisted': recruiter_apps.filter(application_status=Application.ApplicationStatus.SHORTLISTED).count(),
            'interview_scheduled': recruiter_apps.filter(application_status=Application.ApplicationStatus.INTERVIEW_SCHEDULED).count(),
            'selected': recruiter_apps.filter(application_status=Application.ApplicationStatus.SELECTED).count(),
            'rejected': recruiter_apps.filter(application_status=Application.ApplicationStatus.REJECTED).count(),
        }
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='student-dashboard')
    def student_dashboard(self, request):
        student = getattr(request.user, 'student_profile', None)
        if not student:
            return Response({'error': 'Student profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        student_apps = Application.objects.filter(student=student)
        active_statuses = [
            Application.ApplicationStatus.APPLIED,
            Application.ApplicationStatus.UNDER_REVIEW,
            Application.ApplicationStatus.SHORTLISTED,
            Application.ApplicationStatus.INTERVIEW_SCHEDULED,
        ]
        data = {
            'total_applications': student_apps.count(),
            'active_applications': student_apps.filter(application_status__in=active_statuses).count(),
            'shortlisted': student_apps.filter(application_status=Application.ApplicationStatus.SHORTLISTED).count(),
            'interviews': student_apps.filter(application_status=Application.ApplicationStatus.INTERVIEW_SCHEDULED).count(),
            'selected': student_apps.filter(application_status=Application.ApplicationStatus.SELECTED).count(),
            'rejected': student_apps.filter(application_status=Application.ApplicationStatus.REJECTED).count(),
        }
        return Response(data, status=status.HTTP_200_OK)
