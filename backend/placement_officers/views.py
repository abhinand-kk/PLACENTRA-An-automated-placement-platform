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
from applications.models import Application
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
        profile = get_officer_profile(request.user)
        if not profile:
            return Response({'error': 'Placement Officer profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        inst = profile.institution

        students = StudentProfile.objects.filter(institution=inst)
        total_registered_students = students.count()
        avg_completion = students.aggregate(Avg('profile_completion'))['profile_completion__avg']
        profile_completion_percentage = round(avg_completion) if avg_completion is not None else 0

        total_recruiters = RecruiterProfile.objects.count()
        active_jobs = Job.objects.filter(status=Job.Status.OPEN).count()

        upcoming_drives = PlacementDrive.objects.filter(
            institution=inst,
            status=PlacementDrive.DriveStatus.UPCOMING
        ).count()

        inst_applications = Application.objects.filter(student__institution=inst)
        total_applications = inst_applications.count()
        selected_students = inst_applications.filter(
            application_status=Application.ApplicationStatus.SELECTED
        ).count()

        data = {
            'total_registered_students': total_registered_students,
            'profile_completion_percentage': profile_completion_percentage,
            'total_recruiters': total_recruiters,
            'active_jobs': active_jobs,
            'upcoming_placement_drives': upcoming_drives,
            'total_applications': total_applications,
            'selected_students': selected_students
        }
        return Response(data, status=status.HTTP_200_OK)


class PlacementOfficerStudentListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if getattr(request.user, 'role', '') != 'placement_officer':
            return Response({'error': 'Permission denied. Placement Officer access required.'}, status=status.HTTP_403_FORBIDDEN)

        profile = get_officer_profile(request.user)
        if not profile:
            return Response({'error': 'Placement Officer profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        students = StudentProfile.objects.select_related(
            'user', 'institution', 'current_education', 'current_education__program', 'current_education__branch'
        ).filter(institution=profile.institution) if profile.institution else StudentProfile.objects.none()

        if not students.exists():
            students = StudentProfile.objects.select_related(
                'user', 'institution', 'current_education', 'current_education__program', 'current_education__branch'
            ).all()

        data = []
        for s in students:
            ce = getattr(s, 'current_education', None)
            apps = Application.objects.filter(student=s)
            is_placed = apps.filter(application_status=Application.ApplicationStatus.SELECTED).exists()
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
                'placement_status': 'Placed' if is_placed else 'Seeking',
                'last_login': last_login_str,
                'login_status': login_status
            })

        return Response(data, status=status.HTTP_200_OK)


class StudentLoginActivityView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if getattr(request.user, 'role', '') != 'placement_officer':
            return Response({'error': 'Permission denied. Placement Officer authorization required.'}, status=status.HTTP_403_FORBIDDEN)

        profile = get_officer_profile(request.user)
        if not profile:
            return Response({'error': 'Placement Officer profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        # Only genuine active student accounts with a recorded successful login (user.last_login IS NOT NULL)
        base_qs = StudentProfile.objects.select_related(
            'user', 'institution', 'current_education', 'current_education__program', 'current_education__branch'
        ).filter(
            user__role='student',
            user__is_active=True,
            user__last_login__isnull=False
        )

        students = base_qs.filter(institution=profile.institution) if profile.institution else StudentProfile.objects.none()
        if not students.exists():
            students = base_qs

        students = students.order_by('-user__last_login')

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

        qs = RecruiterProfile.objects.all().order_by('-created_at')
        status_param = request.query_params.get('status')
        if status_param and status_param != 'All':
            qs = qs.filter(approval_status__iexact=status_param)

        data = []
        for r in qs:
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
                'created_at': r.created_at.strftime("%d %b %Y") if r.created_at else None
            })

        return Response(data, status=status.HTTP_200_OK)


class PlacementOfficerRecruiterDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        if getattr(request.user, 'role', '') != 'placement_officer':
            return Response({'error': 'Permission denied. Placement Officer authorization required.'}, status=status.HTTP_403_FORBIDDEN)

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
            posted_jobs.append({
                'id': j.id,
                'job_title': j.job_title,
                'package_lpa': float(j.package_lpa) if j.package_lpa is not None else None,
                'location': j.location,
                'status': j.status,
                'created_at': j.created_at.strftime("%d %b %Y") if j.created_at else None,
                'application_deadline': j.application_deadline.strftime("%d %b %Y") if j.application_deadline else None
            })

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

        qs = Job.objects.select_related('recruiter').all().order_by('-created_at')
        status_param = request.query_params.get('status')
        if status_param and status_param != 'All':
            qs = qs.filter(status__iexact=status_param)

        data = []
        for j in qs:
            data.append({
                'id': j.id,
                'job_title': j.job_title,
                'company_name': j.recruiter.company_name if j.recruiter else 'N/A',
                'recruiter_name': j.recruiter.recruiter_name if j.recruiter else 'N/A',
                'package_lpa': float(j.package_lpa) if j.package_lpa is not None else None,
                'location': j.location,
                'status': j.status,
                'created_at': j.created_at.strftime("%d %b %Y") if j.created_at else None,
                'application_deadline': j.application_deadline.strftime("%d %b %Y") if j.application_deadline else None,
                'job_description': j.job_description
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

