from collections import defaultdict
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import PlacementDrive
from .serializers import PlacementDriveSerializer
from .filters import PlacementDriveFilter
from .permissions import IsPlacementOfficerUser, IsOfficerInstitutionOwner


class PlacementDriveViewSet(viewsets.ModelViewSet):
    queryset = PlacementDrive.objects.select_related(
        'institution', 'recruiter', 'job'
    ).all()
    serializer_class = PlacementDriveSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PlacementDriveFilter
    search_fields = ['drive_title', 'institution__institution_name', 'recruiter__company_name', 'venue']
    ordering_fields = ['drive_date', 'created_at']
    ordering = ['drive_date', 'drive_time']

    def get_queryset(self):
        qs = super().get_queryset()
        # Default to 'Upcoming' status if calling main list endpoint without explicit status query param
        if self.action == 'list':
            if not self.request.query_params.get('status'):
                qs = qs.filter(status=PlacementDrive.DriveStatus.UPCOMING)
        return qs

    def get_permissions(self):
        if self.action == 'create':
            return [IsPlacementOfficerUser()]
        elif self.action in ['update', 'partial_update', 'destroy']:
            return [IsOfficerInstitutionOwner()]
        elif self.action == 'my_institution':
            return [IsPlacementOfficerUser()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        from recruiters.models import RecruiterProfile
        from jobs.models import Job
        inst = self.request.user.placement_officer_profile.institution
        rec = serializer.validated_data.get('recruiter') or RecruiterProfile.objects.first()
        jb = serializer.validated_data.get('job') or Job.objects.first()
        serializer.save(institution=inst, recruiter=rec, job=jb)

    @action(detail=False, methods=['get'], url_path='my-institution')
    def my_institution(self, request):
        officer = getattr(request.user, 'placement_officer_profile', None)
        if not officer:
            return Response({'error': 'Placement Officer profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        qs = self.filter_queryset(
            PlacementDrive.objects.select_related(
                'institution', 'recruiter', 'job'
            ).filter(institution=officer.institution)
        )
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='recruiter')
    def recruiter(self, request):
        recruiter_profile = getattr(request.user, 'recruiter_profile', None)
        if not recruiter_profile:
            return Response({'error': 'Recruiter profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        qs = self.filter_queryset(
            PlacementDrive.objects.select_related(
                'institution', 'recruiter', 'job'
            ).filter(recruiter=recruiter_profile)
        )
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='student')
    def student(self, request):
        student_profile = getattr(request.user, 'student_profile', None)
        if not student_profile:
            return Response({'error': 'Student profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        qs = PlacementDrive.objects.select_related(
            'institution', 'recruiter', 'job'
        ).filter(institution=student_profile.institution)

        if not qs.exists():
            qs = PlacementDrive.objects.select_related(
                'institution', 'recruiter', 'job'
            ).all()

        qs = self.filter_queryset(qs)
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='calendar')
    def calendar(self, request):
        user = request.user
        qs = PlacementDrive.objects.select_related('institution', 'recruiter', 'job').all()

        if hasattr(user, 'student_profile'):
            qs = qs.filter(institution=user.student_profile.institution)
        elif hasattr(user, 'placement_officer_profile'):
            qs = qs.filter(institution=user.placement_officer_profile.institution)
        elif hasattr(user, 'recruiter_profile'):
            qs = qs.filter(recruiter=user.recruiter_profile)

        qs = self.filter_queryset(qs)
        grouped_drives = defaultdict(list)

        for drive in qs:
            date_str = str(drive.drive_date)
            grouped_drives[date_str].append(self.get_serializer(drive).data)

        return Response(dict(grouped_drives), status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='dashboard')
    def dashboard(self, request):
        user = request.user
        qs = PlacementDrive.objects.all()

        if hasattr(user, 'student_profile'):
            qs = qs.filter(institution=user.student_profile.institution)
        elif hasattr(user, 'placement_officer_profile'):
            qs = qs.filter(institution=user.placement_officer_profile.institution)
        elif hasattr(user, 'recruiter_profile'):
            qs = qs.filter(recruiter=user.recruiter_profile)

        data = {
            'upcoming_drives': qs.filter(status=PlacementDrive.DriveStatus.UPCOMING).count(),
            'ongoing_drives': qs.filter(status=PlacementDrive.DriveStatus.ONGOING).count(),
            'completed_drives': qs.filter(status=PlacementDrive.DriveStatus.COMPLETED).count(),
            'cancelled_drives': qs.filter(status=PlacementDrive.DriveStatus.CANCELLED).count(),
        }
        return Response(data, status=status.HTTP_200_OK)
