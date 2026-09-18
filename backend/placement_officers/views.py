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
