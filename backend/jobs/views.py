from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend

from .models import Job
from .serializers import JobSerializer
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

        # If calling list action directly (/api/v1/jobs/), default to 'Open' status unless status filter is explicitly provided
        if self.action == 'list':
            if not self.request.query_params.get('status'):
                qs = qs.filter(status=Job.Status.OPEN)
        return qs

    def get_permissions(self):
        if self.action == 'create':
            return [IsRecruiterUser()]
        elif self.action in ['update', 'partial_update', 'destroy', 'change_status']:
            return [IsJobOwner()]
        elif self.action == 'my_jobs':
            return [IsRecruiterUser()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        from master_data.models import EmploymentType, HiringType, TargetJobRole, Program, Branch, WorkMode
        recruiter = self.request.user.recruiter_profile
        emp_type = serializer.validated_data.get('employment_type') or EmploymentType.objects.first()
        hir_type = serializer.validated_data.get('hiring_type') or HiringType.objects.first()
        wm_mode = serializer.validated_data.get('work_mode') or WorkMode.objects.first()
        exp_month = serializer.validated_data.get('expected_hiring_month') or 'Immediate'
        
        job = serializer.save(
            recruiter=recruiter,
            employment_type=emp_type,
            hiring_type=hir_type,
            work_mode=wm_mode,
            expected_hiring_month=exp_month
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
