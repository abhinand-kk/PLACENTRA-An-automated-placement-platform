from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Avg
from django.shortcuts import get_object_or_404

from .models import PlacementOfficerProfile, InstitutionDetails
from .serializers import PlacementOfficerProfileSerializer, InstitutionDetailsSerializer
from students.models import StudentProfile
from recruiters.models import RecruiterProfile
from jobs.models import Job
from applications.models import Application, Interview
from placement_drives.models import PlacementDrive


def get_officer_profile(user):
    if not hasattr(user, 'placement_officer_profile'):
        return None
    return user.placement_officer_profile


class PlacementOfficerProfileView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = get_officer_profile(request.user)
        if not profile:
            return Response({'error': 'Placement Officer profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = PlacementOfficerProfileSerializer(profile)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        profile = get_officer_profile(request.user)
        if not profile:
            return Response({'error': 'Placement Officer profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = PlacementOfficerProfileSerializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class InstitutionDetailsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        profile = get_officer_profile(request.user)
        if not profile:
            return Response({'error': 'Placement Officer profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        if not hasattr(profile, 'institution_details'):
            return Response({'message': 'No institution details set yet.'}, status=status.HTTP_200_OK)
        serializer = InstitutionDetailsSerializer(profile.institution_details)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request):
        profile = get_officer_profile(request.user)
        if not profile:
            return Response({'error': 'Placement Officer profile not found.'}, status=status.HTTP_404_NOT_FOUND)
        inst_details = getattr(profile, 'institution_details', None)
        if inst_details:
            serializer = InstitutionDetailsSerializer(inst_details, data=request.data, partial=True)
        else:
            serializer = InstitutionDetailsSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(placement_officer=profile)
            return Response(serializer.data, status=status.HTTP_200_OK if inst_details else status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PlacementOfficerDashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if getattr(request.user, 'role', '') != 'placement_officer':
            return Response({'error': 'Permission denied. Placement Officer authorization required.'}, status=status.HTTP_403_FORBIDDEN)

        profile = get_officer_profile(request.user)
        if not profile:
            return Response({'error': 'Placement Officer profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        inst = profile.institution
        if not inst:
            return Response({
                'total_registered_students': 0,
                'profile_completion_percentage': 0,
                'students_applied': 0,
                'total_applications': 0,
                'shortlisted_students': 0,
                'shortlisted_applications': 0,
                'interviews_scheduled': 0,
                'technical_interviews_count': 0,
                'hr_interviews_count': 0,
                'selected_students': 0,
                'rejected_students': 0,
                'total_recruiters': 0,
                'approved_companies': 0,
                'pending_recruiter_approvals': 0,
                'active_jobs': 0,
                'approved_jobs': 0,
                'pending_job_approvals': 0,
                'upcoming_placement_drives': 0
            }, status=status.HTTP_200_OK)

        students = StudentProfile.objects.filter(institution=inst)
        total_registered_students = students.count()
        avg_completion = students.aggregate(Avg('profile_completion'))['profile_completion__avg']
        profile_completion_percentage = round(avg_completion) if avg_completion is not None else 0

        inst_applications = Application.objects.filter(student__institution=inst)
        total_applications = inst_applications.count()
        students_applied = inst_applications.values('student').distinct().count()

        shortlisted_statuses = [
            Application.ApplicationStatus.SHORTLISTED,
            Application.ApplicationStatus.INTERVIEW_SCHEDULED,
            Application.ApplicationStatus.SELECTED
        ]
        shortlisted_applications = inst_applications.filter(application_status__in=shortlisted_statuses).count()
        shortlisted_students = inst_applications.filter(application_status__in=shortlisted_statuses).values('student').distinct().count()

        selected_students = inst_applications.filter(application_status=Application.ApplicationStatus.SELECTED).count()
        rejected_students = inst_applications.filter(application_status=Application.ApplicationStatus.REJECTED).count()

        inst_interviews = Interview.objects.filter(application__student__institution=inst)
        interviews_scheduled = inst_interviews.exclude(status=Interview.InterviewStatus.CANCELLED).count()
        technical_interviews_count = inst_interviews.filter(
            interview_type=Interview.InterviewType.TECHNICAL
        ).exclude(status=Interview.InterviewStatus.CANCELLED).count()
        hr_interviews_count = inst_interviews.filter(
            interview_type=Interview.InterviewType.HR
        ).exclude(status=Interview.InterviewStatus.CANCELLED).count()

        total_recruiters = RecruiterProfile.objects.count()
        approved_companies = RecruiterProfile.objects.filter(approval_status=RecruiterProfile.ApprovalStatus.APPROVED).count()
        pending_recruiter_approvals = RecruiterProfile.objects.filter(approval_status=RecruiterProfile.ApprovalStatus.PENDING).count()

        active_jobs = Job.objects.filter(status=Job.Status.OPEN).count()
        approved_jobs = Job.objects.filter(status=Job.Status.OPEN).count()
        pending_job_approvals = Job.objects.filter(status=Job.Status.PENDING_APPROVAL).count()

        upcoming_drives = PlacementDrive.objects.filter(
            institution=inst,
            status=PlacementDrive.DriveStatus.UPCOMING
        ).count()

        data = {
            'total_registered_students': total_registered_students,
            'profile_completion_percentage': profile_completion_percentage,
            'students_applied': students_applied,
            'total_applications': total_applications,
            'shortlisted_students': shortlisted_students,
            'shortlisted_applications': shortlisted_applications,
            'interviews_scheduled': interviews_scheduled,
            'technical_interviews_count': technical_interviews_count,
            'hr_interviews_count': hr_interviews_count,
            'selected_students': selected_students,
            'rejected_students': rejected_students,
            'total_recruiters': total_recruiters,
            'approved_companies': approved_companies,
            'pending_recruiter_approvals': pending_recruiter_approvals,
            'active_jobs': active_jobs,
            'approved_jobs': approved_jobs,
            'pending_job_approvals': pending_job_approvals,
            'upcoming_placement_drives': upcoming_drives
        }
        return Response(data, status=status.HTTP_200_OK)


class PlacementOfficerStudentListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if getattr(request.user, 'role', '') != 'placement_officer':
            return Response({'error': 'Permission denied. Placement Officer access required.'}, status=status.HTTP_403_FORBIDDEN)

        profile = get_officer_profile(request.user)
        if not profile or not profile.institution:
            return Response([], status=status.HTTP_200_OK)

        students = StudentProfile.objects.select_related(
            'user', 'institution', 'current_education', 'current_education__program', 'current_education__branch'
        ).filter(institution=profile.institution)

        data = []
        for s in students:
            ce = getattr(s, 'current_education', None)
            apps = Application.objects.filter(student=s)
            interviews = Interview.objects.filter(application__student=s).exclude(status=Interview.InterviewStatus.CANCELLED)
            
            shortlisted_statuses = [
                Application.ApplicationStatus.SHORTLISTED,
                Application.ApplicationStatus.INTERVIEW_SCHEDULED,
                Application.ApplicationStatus.SELECTED
            ]
            shortlisted_count = apps.filter(application_status__in=shortlisted_statuses).count()
            selected_count = apps.filter(application_status=Application.ApplicationStatus.SELECTED).count()
            is_placed = selected_count > 0

            last_login_dt = s.user.last_login
            last_login_str = last_login_dt.strftime("%d %b %Y, %I:%M %p") if last_login_dt else "Never"
            login_status = "Active" if last_login_dt else "Never Logged In"

            data.append({
                'id': s.id,
                'full_name': f"{s.first_name} {s.last_name}".strip() or s.user.email,
                'register_number': s.register_number,
                'gender': s.gender,
                'profile_completion': s.profile_completion,
                'email': s.user.email,
                'program': ce.program.name if ce and ce.program else 'N/A',
                'branch': ce.branch.name if ce and ce.branch else 'N/A',
                'cgpa': float(ce.cgpa) if ce and ce.cgpa is not None else None,
                'active_backlogs': ce.active_backlogs if ce else 0,
                'applications_count': apps.count(),
                'shortlisted_count': shortlisted_count,
                'interviews_count': interviews.count(),
                'selected_count': selected_count,
                'placement_status': 'Placed' if is_placed else 'Seeking',
                'last_login': last_login_str,
                'login_status': login_status
            })

        return Response(data, status=status.HTTP_200_OK)


class PlacementOfficerStudentDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        if getattr(request.user, 'role', '') != 'placement_officer':
            return Response({'error': 'Permission denied. Placement Officer authorization required.'}, status=status.HTTP_403_FORBIDDEN)

        profile = get_officer_profile(request.user)
        if not profile or not profile.institution:
            return Response({'error': 'Placement Officer institution not configured.'}, status=status.HTTP_403_FORBIDDEN)

        student = get_object_or_404(
            StudentProfile.objects.select_related(
                'user', 'institution', 'current_education', 'current_education__program', 'current_education__branch', 'contact', 'documents'
            ),
            pk=pk,
            institution=profile.institution
        )

        ce = getattr(student, 'current_education', None)
        contact = getattr(student, 'contact', None)
        docs = getattr(student, 'documents', None)

        apps = Application.objects.filter(student=student).select_related('job', 'job__recruiter').order_by('-applied_at')

        apps_data = []
        timeline = [
            {
                'title': 'Student Registered',
                'description': f"{student.first_name} {student.last_name} created candidate profile on PLACENTRA.",
                'date': student.created_at.strftime("%d %b %Y") if student.created_at else "N/A",
                'type': 'registration'
            }
        ]

        for app in apps:
            app_interviews = Interview.objects.filter(application=app).order_by('interview_date', 'interview_time')
            interviews_data = []
            for item in app_interviews:
                interviews_data.append({
                    'id': item.id,
                    'interview_type': item.interview_type,
                    'interview_date': item.interview_date.strftime("%d %b %Y") if item.interview_date else "N/A",
                    'interview_time': item.interview_time.strftime("%I:%M %p") if item.interview_time else "N/A",
                    'duration_minutes': item.duration_minutes,
                    'mode': item.mode,
                    'location_or_link': item.location_or_link or "Details pending",
                    'instructions': item.instructions or "None",
                    'status': item.status
                })

            apps_data.append({
                'id': app.id,
                'job_id': app.job.id,
                'job_title': app.job.job_title,
                'company_name': app.job.recruiter.company_name if app.job.recruiter else 'N/A',
                'location': app.job.location,
                'package_lpa': float(app.job.package_lpa) if app.job.package_lpa is not None else None,
                'applied_at': app.applied_at.strftime("%d %b %Y") if app.applied_at else "N/A",
                'application_status': app.application_status,
                'interviews': interviews_data
            })

            # Add REAL database timeline events
            app_date_str = app.applied_at.strftime("%d %b %Y") if app.applied_at else "N/A"
            timeline.append({
                'title': f"Applied to {app.job.job_title}",
                'description': f"Submitted job application for {app.job.job_title} at {app.job.recruiter.company_name if app.job.recruiter else 'Employer'}.",
                'date': app_date_str,
                'type': 'application'
            })

            if app.application_status in [Application.ApplicationStatus.SHORTLISTED, Application.ApplicationStatus.INTERVIEW_SCHEDULED, Application.ApplicationStatus.SELECTED]:
                timeline.append({
                    'title': f"Shortlisted — {app.job.job_title}",
                    'description': f"Candidate shortlisted by {app.job.recruiter.company_name if app.job.recruiter else 'Employer'}.",
                    'date': app_date_str,
                    'type': 'shortlist'
                })

            for item in app_interviews:
                dt_str = f"{item.interview_date.strftime('%d %b %Y') if item.interview_date else ''} {item.interview_time.strftime('%I:%M %p') if item.interview_time else ''}".strip()
                timeline.append({
                    'title': f"{item.interview_type} Scheduled",
                    'description': f"{item.interview_type} with {app.job.recruiter.company_name if app.job.recruiter else 'Employer'} via {item.mode} ({item.status}).",
                    'date': dt_str,
                    'type': 'interview'
                })

            if app.application_status == Application.ApplicationStatus.SELECTED:
                timeline.append({
                    'title': f"Selected & Offered — {app.job.job_title}",
                    'description': f"Candidate successfully selected for {app.job.job_title} at {app.job.recruiter.company_name if app.job.recruiter else 'Employer'}.",
                    'date': app_date_str,
                    'type': 'selection'
                })
            elif app.application_status == Application.ApplicationStatus.REJECTED:
                timeline.append({
                    'title': f"Application Closed — {app.job.job_title}",
                    'description': f"Application status updated to Rejected for {app.job.recruiter.company_name if app.job.recruiter else 'Employer'}.",
                    'date': app_date_str,
                    'type': 'rejection'
                })

        data = {
            'id': student.id,
            'full_name': f"{student.first_name} {student.last_name}".strip() or student.user.email,
            'register_number': student.register_number,
            'email': student.user.email,
            'gender': student.gender,
            'date_of_birth': student.date_of_birth,
            'profile_completion': student.profile_completion,
            'institution_name': student.institution.institution_name if student.institution else 'N/A',
            'current_education': {
                'program': ce.program.name if ce and ce.program else 'N/A',
                'branch': ce.branch.name if ce and ce.branch else 'N/A',
                'batch': ce.batch if ce else 'N/A',
                'semester': ce.semester if ce else 'N/A',
                'cgpa': float(ce.cgpa) if ce and ce.cgpa is not None else None,
                'active_backlogs': ce.active_backlogs if ce else 0
            },
            'contact': {
                'primary_email': contact.primary_email if contact else student.user.email,
                'mobile_number': contact.mobile_number if contact else 'N/A',
                'city': contact.city if contact else 'N/A',
                'district': contact.district if contact else 'N/A',
                'state': contact.state if contact else 'N/A'
            },
            'has_resume': bool(docs and docs.resume),
            'applications': apps_data,
            'timeline': timeline
        }

        return Response(data, status=status.HTTP_200_OK)


class StudentLoginActivityView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if getattr(request.user, 'role', '') != 'placement_officer':
            return Response({'error': 'Permission denied. Placement Officer authorization required.'}, status=status.HTTP_403_FORBIDDEN)

        profile = get_officer_profile(request.user)
        if not profile or not profile.institution:
            return Response([], status=status.HTTP_200_OK)

        students = StudentProfile.objects.select_related(
            'user', 'institution', 'current_education', 'current_education__program', 'current_education__branch'
        ).filter(
            institution=profile.institution,
            user__role='student',
            user__is_active=True,
            user__last_login__isnull=False
        ).order_by('-user__last_login')

        data = []
        for s in students:
            ce = getattr(s, 'current_education', None)
            last_login_dt = s.user.last_login
            if not last_login_dt:
                continue

            last_login_str = last_login_dt.strftime("%d %b %Y, %I:%M %p")
            program_name = ce.program.name if ce and ce.program else (ce.field_of_study if ce and ce.field_of_study else 'Integrated MCA')

            data.append({
                'id': s.id,
                'student_name': f"{s.first_name} {s.last_name}".strip() or s.user.email,
                'email': s.user.email,
                'course': program_name,
                'login_status': 'Active',
                'last_login': last_login_str,
                'last_login_raw': last_login_dt.isoformat()
            })

        return Response(data, status=status.HTTP_200_OK)


class PlacementOfficerRecruiterListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if getattr(request.user, 'role', '') != 'placement_officer':
            return Response({'error': 'Permission denied. Placement Officer authorization required.'}, status=status.HTTP_403_FORBIDDEN)

        profile = get_officer_profile(request.user)
        qs = RecruiterProfile.objects.all().order_by('-created_at')
        status_param = request.query_params.get('status')
        if status_param and status_param != 'All':
            qs = qs.filter(approval_status__iexact=status_param)

        data = []
        for r in qs:
            recruiter_apps = Application.objects.filter(job__recruiter=r, student__institution=profile.institution) if profile and profile.institution else Application.objects.filter(job__recruiter=r)
            jobs_cnt = Job.objects.filter(recruiter=r).count()
            apps_cnt = recruiter_apps.count()
            shortlisted_cnt = recruiter_apps.filter(application_status__in=['Shortlisted', 'Interview Scheduled', 'Selected']).count()
            interviews_cnt = Interview.objects.filter(application__in=recruiter_apps).count()
            selected_cnt = recruiter_apps.filter(application_status='Selected').count()

            data.append({
                'id': r.id,
                'company_name': r.company_name,
                'recruiter_name': r.recruiter_name,
                'designation': r.designation,
                'official_email': r.official_email,
                'mobile_number': r.mobile_number,
                'hiring_volume': r.hiring_volume,
                'approval_status': r.approval_status,
                'is_verified': r.is_verified,
                'created_at': r.created_at.strftime("%d %b %Y") if r.created_at else None,
                'posted_jobs_count': jobs_cnt,
                'applications_count': apps_cnt,
                'shortlisted_count': shortlisted_cnt,
                'interviews_count': interviews_cnt,
                'selected_count': selected_cnt
            })

        return Response(data, status=status.HTTP_200_OK)


class PlacementOfficerRecruiterDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        if getattr(request.user, 'role', '') != 'placement_officer':
            return Response({'error': 'Permission denied. Placement Officer authorization required.'}, status=status.HTTP_403_FORBIDDEN)

        profile = get_officer_profile(request.user)
        recruiter = get_object_or_404(RecruiterProfile.objects.select_related('user'), pk=pk)

        pref_data = None
        if hasattr(recruiter, 'hiring_preference') and recruiter.hiring_preference:
            hp = recruiter.hiring_preference
            pref_data = {
                'target_job_roles': [r.name for r in hp.target_job_roles.all()],
                'hiring_type': hp.hiring_type.name if hp.hiring_type else None,
                'eligible_programs': [p.name for p in hp.eligible_programs.all()],
                'eligible_branches': [b.name for b in hp.eligible_branches.all()],
                'minimum_cgpa': float(hp.minimum_cgpa) if hp.minimum_cgpa is not None else 0.0,
                'maximum_active_backlogs': hp.maximum_active_backlogs,
                'expected_hiring_month': hp.expected_hiring_month,
                'expected_students': hp.expected_students,
                'package_lpa': float(hp.package_lpa) if hp.package_lpa is not None else 0.0,
                'work_mode': hp.work_mode.name if hp.work_mode else None,
                'campus_visit_required': hp.campus_visit_required,
                'additional_requirements': hp.additional_requirements
            }

        jobs_qs = Job.objects.filter(recruiter=recruiter).order_by('-created_at')
        posted_jobs = []
        for j in jobs_qs:
            job_apps = Application.objects.filter(job=j, student__institution=profile.institution) if profile and profile.institution else Application.objects.filter(job=j)
            posted_jobs.append({
                'id': j.id,
                'job_title': j.job_title,
                'package_lpa': float(j.package_lpa) if j.package_lpa is not None else None,
                'location': j.location,
                'status': j.status,
                'applications_count': job_apps.count(),
                'created_at': j.created_at.strftime("%d %b %Y") if j.created_at else None,
                'application_deadline': j.application_deadline.strftime("%d %b %Y") if j.application_deadline else None
            })

        recruiter_apps = Application.objects.filter(job__recruiter=recruiter, student__institution=profile.institution) if profile and profile.institution else Application.objects.filter(job__recruiter=recruiter)

        data = {
            'id': recruiter.id,
            'company_name': recruiter.company_name,
            'recruiter_name': recruiter.recruiter_name,
            'designation': recruiter.designation,
            'official_email': recruiter.official_email,
            'mobile_number': recruiter.mobile_number,
            'hiring_volume': recruiter.hiring_volume,
            'approval_status': recruiter.approval_status,
            'is_verified': recruiter.is_verified,
            'created_at': recruiter.created_at.strftime("%d %b %Y, %I:%M %p") if recruiter.created_at else None,
            'user_email': recruiter.user.email,
            'user_date_joined': recruiter.user.created_at.strftime("%d %b %Y") if recruiter.user.created_at else None,
            'hiring_preference': pref_data,
            'posted_jobs_count': jobs_qs.count(),
            'applications_count': recruiter_apps.count(),
            'shortlisted_count': recruiter_apps.filter(application_status__in=['Shortlisted', 'Interview Scheduled', 'Selected']).count(),
            'interviews_count': Interview.objects.filter(application__in=recruiter_apps).count(),
            'selected_count': recruiter_apps.filter(application_status='Selected').count(),
            'posted_jobs': posted_jobs
        }

        return Response(data, status=status.HTTP_200_OK)


class PlacementOfficerRecruiterApprovalView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        if getattr(request.user, 'role', '') != 'placement_officer':
            return Response({'error': 'Permission denied. Placement Officer authorization required.'}, status=status.HTTP_403_FORBIDDEN)

        recruiter = get_object_or_404(RecruiterProfile, pk=pk)
        new_status = request.data.get('status')

        valid_statuses = [choice[0] for choice in RecruiterProfile.ApprovalStatus.choices]
        if new_status not in valid_statuses:
            return Response({
                'error': f'Invalid status. Allowed choices are: {", ".join(valid_statuses)}'
            }, status=status.HTTP_400_BAD_REQUEST)

        recruiter.approval_status = new_status
        recruiter.is_verified = (new_status == RecruiterProfile.ApprovalStatus.APPROVED)
        recruiter.save(update_fields=['approval_status', 'is_verified'])

        return Response({
            'message': f'Recruiter status updated to {new_status}.',
            'id': recruiter.id,
            'approval_status': recruiter.approval_status,
            'is_verified': recruiter.is_verified
        }, status=status.HTTP_200_OK)


class PlacementOfficerJobListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if getattr(request.user, 'role', '') != 'placement_officer':
            return Response({'error': 'Permission denied. Placement Officer authorization required.'}, status=status.HTTP_403_FORBIDDEN)

        profile = get_officer_profile(request.user)
        qs = Job.objects.select_related('recruiter', 'work_mode').all().order_by('-created_at')
        status_param = request.query_params.get('status')
        if status_param and status_param != 'All':
            qs = qs.filter(status__iexact=status_param)

        data = []
        for j in qs:
            job_apps = Application.objects.filter(job=j, student__institution=profile.institution) if profile and profile.institution else Application.objects.filter(job=j)
            shortlisted_cnt = job_apps.filter(application_status__in=['Shortlisted', 'Interview Scheduled', 'Selected']).count()
            interviews_cnt = Interview.objects.filter(application__in=job_apps).count()
            selected_cnt = job_apps.filter(application_status='Selected').count()

            data.append({
                'id': j.id,
                'job_title': j.job_title,
                'company_name': j.recruiter.company_name if j.recruiter else 'N/A',
                'recruiter_name': j.recruiter.recruiter_name if j.recruiter else 'N/A',
                'package_lpa': float(j.package_lpa) if j.package_lpa is not None else None,
                'location': j.location,
                'work_mode': j.work_mode.name if j.work_mode else 'N/A',
                'status': j.status,
                'created_at': j.created_at.strftime("%d %b %Y") if j.created_at else None,
                'application_deadline': j.application_deadline.strftime("%d %b %Y") if j.application_deadline else None,
                'job_description': j.job_description,
                'applications_count': job_apps.count(),
                'shortlisted_count': shortlisted_cnt,
                'interviews_count': interviews_cnt,
                'selected_count': selected_cnt
            })

        return Response(data, status=status.HTTP_200_OK)


class PlacementOfficerJobApprovalView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        if getattr(request.user, 'role', '') != 'placement_officer':
            return Response({'error': 'Permission denied. Placement Officer authorization required.'}, status=status.HTTP_403_FORBIDDEN)

        job = get_object_or_404(Job, pk=pk)
        new_status = request.data.get('status')

        valid_statuses = [choice[0] for choice in Job.Status.choices]
        if new_status not in valid_statuses:
            return Response({
                'error': f'Invalid status. Allowed choices are: {", ".join(valid_statuses)}'
            }, status=status.HTTP_400_BAD_REQUEST)

        job.status = new_status
        job.save(update_fields=['status'])

        return Response({
            'message': f'Job status updated to {new_status}.',
            'id': job.id,
            'status': job.status
        }, status=status.HTTP_200_OK)


class PlacementOfficerRecentActivityView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if getattr(request.user, 'role', '') != 'placement_officer':
            return Response({'error': 'Permission denied. Placement Officer authorization required.'}, status=status.HTTP_403_FORBIDDEN)

        profile = get_officer_profile(request.user)
        if not profile or not profile.institution:
            return Response([], status=status.HTTP_200_OK)

        inst = profile.institution

        recent_apps = Application.objects.filter(
            student__institution=inst
        ).select_related('student', 'job', 'job__recruiter').order_by('-updated_at')[:10]

        recent_interviews = Interview.objects.filter(
            application__student__institution=inst
        ).select_related('application', 'application__student', 'application__job', 'application__job__recruiter').order_by('-created_at')[:10]

        activities = []
        for app in recent_apps:
            student_name = f"{app.student.first_name} {app.student.last_name}".strip()
            job_title = app.job.job_title
            company_name = app.job.recruiter.company_name if app.job.recruiter else 'Company'
            date_str = app.updated_at.strftime("%d %b %Y, %I:%M %p") if app.updated_at else ""

            if app.application_status == Application.ApplicationStatus.SHORTLISTED:
                activities.append({
                    'id': f"app-shortlist-{app.id}",
                    'text': f"{student_name} was shortlisted for {job_title} at {company_name}.",
                    'date': date_str,
                    'type': 'shortlist'
                })
            elif app.application_status == Application.ApplicationStatus.SELECTED:
                activities.append({
                    'id': f"app-select-{app.id}",
                    'text': f"{student_name} was selected for {job_title} at {company_name}!",
                    'date': date_str,
                    'type': 'selection'
                })
            elif app.application_status == Application.ApplicationStatus.REJECTED:
                activities.append({
                    'id': f"app-reject-{app.id}",
                    'text': f"Application for {student_name} updated to Rejected for {job_title} at {company_name}.",
                    'date': date_str,
                    'type': 'rejection'
                })
            else:
                activities.append({
                    'id': f"app-apply-{app.id}",
                    'text': f"{student_name} applied for {job_title} at {company_name}.",
                    'date': date_str,
                    'type': 'application'
                })

        for item in recent_interviews:
            student_name = f"{item.application.student.first_name} {item.application.student.last_name}".strip()
            job_title = item.application.job.job_title
            company_name = item.application.job.recruiter.company_name if item.application.job.recruiter else 'Company'
            dt_str = f"{item.interview_date.strftime('%d %b %Y') if item.interview_date else ''} {item.interview_time.strftime('%I:%M %p') if item.interview_time else ''}".strip()

            activities.append({
                'id': f"interview-{item.id}",
                'text': f"{item.interview_type} scheduled for {student_name} for {job_title} at {company_name} on {dt_str}.",
                'date': item.created_at.strftime("%d %b %Y, %I:%M %p") if item.created_at else "",
                'type': 'interview'
            })

        return Response(activities[:15], status=status.HTTP_200_OK)
