from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Job, PublicReferenceJob
from .serializers import JobSerializer, PublicReferenceJobSerializer
from .filters import JobFilter
from .permissions import IsRecruiterUser, IsJobOwner


class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.select_related(
        'recruiter', 'employment_type', 'hiring_type', 'work_mode'
    ).prefetch_related(
        'target_job_roles', 'eligible_programs', 'eligible_branches'
    ).all()
    serializer_class = JobSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = JobFilter
    search_fields = ['job_title', 'recruiter__company_name', 'recruiter__recruiter_name', 'location']
    ordering_fields = ['created_at', 'application_deadline', 'package_lpa']
    ordering = ['-created_at']

    def get_queryset(self):
        qs = super().get_queryset()

        # For student/public list action (/api/v1/jobs/), default to 'Open' status and approved recruiters only
        if self.action == 'list':
            if not self.request.query_params.get('status'):
                qs = qs.filter(status=Job.Status.OPEN, recruiter__approval_status='Approved')
        return qs

    def get_permissions(self):
        if self.action == 'create':
            return [IsRecruiterUser()]
        elif self.action in ['update', 'partial_update', 'destroy', 'change_status']:
            return [IsJobOwner()]
        elif self.action == 'my_jobs':
            return [IsRecruiterUser()]
        return [permissions.IsAuthenticated()]

    def create(self, request, *args, **kwargs):
        recruiter = getattr(request.user, 'recruiter_profile', None)
        if not recruiter:
            return Response({'error': 'Only registered recruiters can post jobs.'}, status=status.HTTP_403_FORBIDDEN)
        
        if recruiter.approval_status != 'Approved':
            return Response({'error': 'Your recruiter/company profile is pending verification by the Placement Officer. Job posting will be enabled once approved.'}, status=status.HTTP_403_FORBIDDEN)
            
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        from master_data.models import TargetJobRole, Program, Branch
        from rest_framework.exceptions import ValidationError

        recruiter = self.request.user.recruiter_profile

        # Defensive master-data integrity check to prevent uncaught db IntegrityError
        hir_type = serializer.validated_data.get('hiring_type')
        emp_type = serializer.validated_data.get('employment_type')
        wm_mode = serializer.validated_data.get('work_mode')

        if not hir_type:
            raise ValidationError({'hiring_type': 'Required hiring type master data is not configured in the system.'})
        if not emp_type:
            raise ValidationError({'employment_type': 'Required employment type master data is not configured in the system.'})
        if not wm_mode:
            raise ValidationError({'work_mode': 'Required work mode master data is not configured in the system.'})

        job_status = serializer.validated_data.get('status') or Job.Status.PENDING_APPROVAL

        job = serializer.save(
            recruiter=recruiter,
            status=job_status
        )
        
        if not job.eligible_programs.exists():
            job.eligible_programs.set(Program.objects.all())
        if not job.eligible_branches.exists():
            job.eligible_branches.set(Branch.objects.all())
        if not job.target_job_roles.exists():
            job.target_job_roles.set(TargetJobRole.objects.all())


    @action(detail=False, methods=['get'], url_path='my-jobs')
    def my_jobs(self, request):
        recruiter = getattr(request.user, 'recruiter_profile', None)
        if not recruiter:
            return Response({'error': 'Recruiter profile not found.'}, status=status.HTTP_404_NOT_FOUND)

        qs = self.filter_queryset(
            Job.objects.select_related(
                'recruiter', 'employment_type', 'hiring_type', 'work_mode'
            ).prefetch_related(
                'target_job_roles', 'eligible_programs', 'eligible_branches'
            ).filter(recruiter=recruiter)
        )
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'], url_path='status')
    def change_status(self, request, pk=None):
        job = self.get_object()
        new_status = request.data.get('status')

        valid_statuses = [choice[0] for choice in Job.Status.choices]
        if new_status not in valid_statuses:
            return Response({
                'error': f'Invalid status. Allowed choices are: {", ".join(valid_statuses)}'
            }, status=status.HTTP_400_BAD_REQUEST)

        job.status = new_status
        job.save(update_fields=['status'])
        serializer = self.get_serializer(job)
        return Response(serializer.data, status=status.HTTP_200_OK)


class PublicReferenceJobViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Publicly sourced enterprise reference opportunities.
    Provides verifiable market vacancy data for student career reference and recruiter benchmarks.
    ReadOnly: does not permit direct in-app application submission.
    """
    queryset = PublicReferenceJob.objects.filter(is_active=True)
    serializer_class = PublicReferenceJobSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['job_title', 'company_name', 'location', 'industry']
    ordering_fields = ['created_at', 'company_name']
    ordering = ['company_name']

