from datetime import date
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Application, Interview
from .serializers import ApplicationSerializer, InterviewSerializer, InterviewCreateUpdateSerializer
from .permissions import IsStudentUser, IsApplicationParticipant
from jobs.models import Job
from .email_service import send_interview_notification_email



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
        elif self.action in ['job_applications', 'status_update', 'recruiter_dashboard', 'download_resume', 'download_offer_letter', 'resend_offer_email']:
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

        previous_status = application.application_status
        application.application_status = new_status
        application.save(update_fields=['application_status'])

        # Trigger shortlisting email & PDF notification idempotently when transitioning to SHORTLISTED
        if previous_status != Application.ApplicationStatus.SHORTLISTED and new_status == Application.ApplicationStatus.SHORTLISTED:
            from .email_service import send_shortlisting_notification
            send_shortlisting_notification(application)

        # Trigger Selection Offer Email with attached Offer Letter PDF when status is SELECTED
        email_sent = None
        recipient_email = None
        email_message = None

        if new_status == Application.ApplicationStatus.SELECTED:
            force_resend = request.data.get('force_resend', False) or request.data.get('resend', False)

            # Idempotency check: don't resend if already sent unless forced
            if application.offer_letter_sent and not force_resend:
                email_sent = True
                email_message = "Candidate is Selected. Offer letter email was already sent previously."
            else:
                from .email_service import send_selection_offer_email
                sent, info = send_selection_offer_email(application)
                if sent:
                    from django.utils import timezone
                    application.offer_letter_sent = True
                    application.offer_letter_sent_at = timezone.now()
                    application.save(update_fields=['offer_letter_sent', 'offer_letter_sent_at'])
                    email_sent = True
                    recipient_email = info
                    email_message = f"Offer letter email delivered successfully to {info}."
                else:
                    email_sent = False
                    email_message = f"Candidate status updated to Selected, but email delivery failed: {info}"

        serializer = self.get_serializer(application)
        data = serializer.data
        if email_sent is not None:
            data['email_sent'] = email_sent
            data['recipient_email'] = recipient_email
            data['email_message'] = email_message
        return Response(data, status=status.HTTP_200_OK)

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

    @action(detail=True, methods=['get'], url_path='resume')
    def download_resume(self, request, pk=None):
        import os, urllib.parse, logging
        from django.conf import settings
        from django.http import FileResponse

        application = self.get_object()
        student = application.student
        doc = getattr(student, 'documents', None)

        if not doc or not doc.resume:
            return Response({'error': 'Candidate resume has not been uploaded.'}, status=status.HTTP_404_NOT_FOUND)

        resume_field = doc.resume
        stored_path = str(resume_field)
        unquoted_path = urllib.parse.unquote(stored_path)

        media_root = settings.MEDIA_ROOT
        full_path = os.path.join(media_root, unquoted_path)

        if not os.path.exists(full_path):
            full_path = os.path.join(media_root, stored_path)

        if not os.path.exists(full_path):
            base_name = os.path.basename(unquoted_path)
            doc_dir = os.path.join(media_root, 'student_documents')
            if os.path.exists(doc_dir):
                for root_dir, _, files in os.walk(doc_dir):
                    if base_name in files:
                        full_path = os.path.join(root_dir, base_name)
                        break

        if not os.path.exists(full_path):
            logging.getLogger('django').error(f"Resume PDF file missing from disk storage: {full_path}")
            return Response({'error': 'Candidate resume file not found on server storage.'}, status=status.HTTP_404_NOT_FOUND)

        try:
            filename = os.path.basename(full_path)
            response = FileResponse(open(full_path, 'rb'), content_type='application/pdf')
            response['Content-Disposition'] = f'inline; filename="{filename}"'
            return response
        except Exception as e:
            logging.getLogger('django').error(f"Error serving resume PDF: {str(e)}")
            return Response({'error': 'Unable to open candidate resume PDF.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['post'], url_path='resend-offer-email')
    def resend_offer_email(self, request, pk=None):
        application = self.get_object()
        recruiter = getattr(request.user, 'recruiter_profile', None)

        if not recruiter or application.job.recruiter != recruiter:
            return Response({'error': 'Only the job owner recruiter can trigger offer emails.'}, status=status.HTTP_403_FORBIDDEN)

        if application.application_status != Application.ApplicationStatus.SELECTED:
            return Response({'error': 'Candidate must be in Selected status before sending an offer letter.'}, status=status.HTTP_400_BAD_REQUEST)

        from .email_service import send_selection_offer_email
        sent, info = send_selection_offer_email(application)
        if sent:
            from django.utils import timezone
            application.offer_letter_sent = True
            application.offer_letter_sent_at = timezone.now()
            application.save(update_fields=['offer_letter_sent', 'offer_letter_sent_at'])
            return Response({
                'message': f'Offer letter email sent successfully to {info}.',
                'email_sent': True,
                'recipient_email': info
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': f'Failed to deliver offer letter email: {info}',
                'email_sent': False
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'], url_path='offer-letter')
    def download_offer_letter(self, request, pk=None):
        import re
        from django.http import HttpResponse

        application = self.get_object()
        user = request.user

        # Access control: authorized recruiter, candidate student, campus placement officer, or staff
        is_recruiter = hasattr(user, 'recruiter_profile') and application.job.recruiter == user.recruiter_profile
        is_student = hasattr(user, 'student_profile') and application.student == user.student_profile
        is_officer = hasattr(user, 'placement_officer_profile') and application.student.institution == user.placement_officer_profile.institution
        is_admin = user.is_staff or user.is_superuser

        if not (is_recruiter or is_student or is_officer or is_admin):
            return Response({'error': 'You do not have permission to view or download this offer letter.'}, status=status.HTTP_403_FORBIDDEN)

        if application.application_status != Application.ApplicationStatus.SELECTED:
            return Response({'error': 'Offer letter is only available for selected candidates.'}, status=status.HTTP_400_BAD_REQUEST)

        from .pdf_generator import generate_selection_offer_pdf
        try:
            pdf_bytes = generate_selection_offer_pdf(application)
            student = application.student
            sanitized_name = re.sub(r'[^a-zA-Z0-9_]', '_', f"{student.first_name}_{student.last_name}")
            filename = f"{sanitized_name}_Selection_Offer_Letter.pdf"

            response = HttpResponse(pdf_bytes, content_type='application/pdf')
            response['Content-Disposition'] = f'inline; filename="{filename}"'
            return response
        except Exception as e:
            import logging
            logging.getLogger('django').exception(f"Error generating offer letter PDF for application ID {application.id}: {e}")
            return Response({'error': 'Unable to generate offer letter PDF document.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class InterviewViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return InterviewCreateUpdateSerializer
        return InterviewSerializer

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Interview.objects.none()

        qs = Interview.objects.select_related(
            'application',
            'application__student',
            'application__student__user',
            'application__job',
            'application__job__recruiter'
        )

        if hasattr(user, 'recruiter_profile'):
            return qs.filter(application__job__recruiter=user.recruiter_profile)
        elif hasattr(user, 'student_profile'):
            return qs.filter(application__student=user.student_profile)
        elif hasattr(user, 'placement_officer_profile'):
            return qs.filter(application__student__institution=user.placement_officer_profile.institution)
        elif user.is_staff or user.is_superuser:
            return qs
        return Interview.objects.none()

    def create(self, request, *args, **kwargs):
        recruiter = getattr(request.user, 'recruiter_profile', None)
        if not recruiter:
            return Response({'error': 'Only authorized recruiters can schedule candidate interviews.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        interview = serializer.save()

        # Update application status to INTERVIEW_SCHEDULED if currently SHORTLISTED
        application = interview.application
        if application.application_status == Application.ApplicationStatus.SHORTLISTED:
            application.application_status = Application.ApplicationStatus.INTERVIEW_SCHEDULED
            application.save(update_fields=['application_status'])

        # Send email and in-app notification
        email_sent = send_interview_notification_email(interview)

        response_serializer = InterviewSerializer(interview)
        data = response_serializer.data
        data['email_sent'] = email_sent
        return Response(data, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        recruiter = getattr(request.user, 'recruiter_profile', None)
        if not recruiter:
            return Response({'error': 'Only authorized recruiters can update/reschedule interviews.'}, status=status.HTTP_403_FORBIDDEN)

        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        if instance.application.job.recruiter != recruiter:
            return Response({'error': 'You are not authorized to edit this interview.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = self.get_serializer(instance, data=request.data, partial=partial, context={'request': request})
        serializer.is_valid(raise_exception=True)
        interview = serializer.save()

        if 'interview_date' in request.data or 'interview_time' in request.data:
            interview.status = Interview.InterviewStatus.RESCHEDULED
            interview.save(update_fields=['status'])

        email_sent = send_interview_notification_email(interview)

        response_serializer = InterviewSerializer(interview)
        data = response_serializer.data
        data['email_sent'] = email_sent
        return Response(data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='calendar')
    def calendar(self, request):
        qs = self.get_queryset().exclude(status=Interview.InterviewStatus.CANCELLED)
        events = []
        for item in qs:
            student_name = f"{item.application.student.first_name} {item.application.student.last_name}".strip()
            job_title = item.application.job.job_title
            company_name = getattr(item.application.job.recruiter, 'company_name', 'Company')
            events.append({
                'id': item.id,
                'application_id': item.application.id,
                'title': f"{item.interview_type} - {student_name}",
                'candidate_name': student_name,
                'job_title': job_title,
                'company_name': company_name,
                'interview_type': item.interview_type,
                'date': item.interview_date,
                'time': item.interview_time,
                'duration_minutes': item.duration_minutes,
                'mode': item.mode,
                'location_or_link': item.location_or_link,
                'instructions': item.instructions,
                'status': item.status,
            })
        return Response(events, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='my-interviews')
    def my_interviews(self, request):
        student = getattr(request.user, 'student_profile', None)
        if not student:
            return Response({'error': 'Student profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        qs = self.get_queryset().filter(application__student=student).exclude(status=Interview.InterviewStatus.CANCELLED)
        serializer = InterviewSerializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def destroy(self, request, *args, **kwargs):
        recruiter = getattr(request.user, 'recruiter_profile', None)
        if not recruiter:
            return Response({'error': 'Only authorized recruiters can cancel candidate interviews.'}, status=status.HTTP_403_FORBIDDEN)
        instance = self.get_object()
        if instance.application.job.recruiter != recruiter:
            return Response({'error': 'You are not authorized to cancel this interview.'}, status=status.HTTP_403_FORBIDDEN)

        instance.status = Interview.InterviewStatus.CANCELLED
        instance.save(update_fields=['status'])

        # Notify student about cancellation
        try:
            from notifications.models import Notification
            student_user = instance.application.student.user
            job_title = instance.application.job.job_title
            company_name = getattr(instance.application.job.recruiter, 'company_name', 'Company')
            Notification.objects.create(
                user=student_user,
                title=f"{instance.interview_type} Cancelled",
                message=f"Your scheduled {instance.interview_type} for {job_title} at {company_name} has been cancelled.",
                notification_type="Interview"
            )
        except Exception as e:
            pass

        return Response({'message': 'Interview cancelled successfully.'}, status=status.HTTP_200_OK)


