from datetime import date, timedelta
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core.management import call_command
from rest_framework.test import APIClient
from rest_framework import status

from master_data.models import (
    HiringType,
    EmploymentType,
    WorkMode,
    TargetJobRole,
    Program,
    Branch,
)
from recruiters.models import RecruiterProfile
from jobs.models import Job

User = get_user_model()


class JobCreationMasterDataRobustnessTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Seed initial canonical master data
        self.ht_direct = HiringType.objects.create(name='Direct')
        self.ht_campus = HiringType.objects.create(name='Campus Placement')
        self.emp_full_time = EmploymentType.objects.create(name='Full Time')
        self.emp_internship = EmploymentType.objects.create(name='Internship')
        self.work_onsite = WorkMode.objects.create(name='On-Site')
        self.work_hybrid = WorkMode.objects.create(name='Hybrid')

        # Create approved recruiter
        self.recruiter_user = User.objects.create_user(
            email='recruiter@company.com',
            password='Password123!',
            role=User.Role.RECRUITER
        )
        self.recruiter_profile = RecruiterProfile.objects.create(
            user=self.recruiter_user,
            company_name='Acme Corp',
            recruiter_name='Jane Recruiter',
            designation='HR Manager',
            official_email='recruiter@company.com',
            mobile_number='9876543210',
            approval_status=RecruiterProfile.ApprovalStatus.APPROVED,
            is_verified=True
        )

        # Standard job payload matching recruiter form (omits hiring_type, employment_type, work_mode)
        self.valid_payload = {
            'job_title': 'Software Engineer - Backend',
            'location': 'Bangalore, India',
            'package_lpa': 14.5,
            'job_description': 'Build scalable APIs and microservices.',
            'requirements': 'Proficiency in Python and PostgreSQL.',
            'application_deadline': (date.today() + timedelta(days=30)).isoformat(),
            'status': 'Open'
        }

    def test_job_creation_omitting_hiring_type_succeeds_with_deterministic_default(self):
        """
        Job creation succeeds when a valid hiring-type record exists and the current
        recruiter form omits hiring_type, employment_type, and work_mode.
        """
        self.client.force_authenticate(user=self.recruiter_user)
        response = self.client.post('/api/v1/jobs/', self.valid_payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        job_id = response.data['id']
        job = Job.objects.get(id=job_id)

        # Verifies deterministic fallback to 'Direct'
        self.assertEqual(job.hiring_type.name, 'Direct')
        self.assertEqual(job.employment_type.name, 'Full Time')
        self.assertEqual(job.work_mode.name, 'Hybrid')
        self.assertEqual(job.recruiter, self.recruiter_profile)
        self.assertEqual(job.job_title, 'Software Engineer - Backend')
        self.assertEqual(job.status, 'Open')

    def test_deterministic_fallback_order_when_direct_not_present(self):
        """
        When 'Direct' is absent, fallback resolves deterministically to 'Campus Placement'.
        """
        self.ht_direct.delete()

        self.client.force_authenticate(user=self.recruiter_user)
        response = self.client.post('/api/v1/jobs/', self.valid_payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        job = Job.objects.get(id=response.data['id'])
        self.assertEqual(job.hiring_type.name, 'Campus Placement')

    def test_job_creation_with_explicit_valid_hiring_type_is_preserved(self):
        """
        Explicitly supplied valid hiring_type is preserved rather than overwritten by default.
        """
        self.client.force_authenticate(user=self.recruiter_user)
        payload = dict(self.valid_payload)
        payload['hiring_type'] = self.ht_campus.id
        payload['employment_type'] = self.emp_internship.id
        payload['work_mode'] = self.work_onsite.id

        response = self.client.post('/api/v1/jobs/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        job = Job.objects.get(id=response.data['id'])
        self.assertEqual(job.hiring_type.id, self.ht_campus.id)
        self.assertEqual(job.hiring_type.name, 'Campus Placement')
        self.assertEqual(job.employment_type.id, self.emp_internship.id)
        self.assertEqual(job.work_mode.id, self.work_onsite.id)

    def test_job_creation_with_invalid_hiring_type_id_returns_400(self):
        """
        Explicit invalid or unknown foreign-key IDs receive an appropriate HTTP 400 validation response.
        """
        self.client.force_authenticate(user=self.recruiter_user)
        payload = dict(self.valid_payload)
        payload['hiring_type'] = 999999

        response = self.client.post('/api/v1/jobs/', payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # Check custom exception handler structure: errors dictionary contains hiring_type
        errors = response.data.get('errors') or response.data
        self.assertIn('hiring_type', errors)
        self.assertEqual(Job.objects.count(), 0)

    def test_missing_master_data_handled_safely_without_500_integrity_error(self):
        """
        When required master data (HiringType) is completely missing from database,
        the system returns an HTTP 400 validation error instead of throwing an
        uncaught database IntegrityError (HTTP 500).
        """
        HiringType.objects.all().delete()

        self.client.force_authenticate(user=self.recruiter_user)
        response = self.client.post('/api/v1/jobs/', self.valid_payload, format='json')

        # Must NOT be 500
        self.assertNotEqual(response.status_code, status.HTTP_500_INTERNAL_SERVER_ERROR)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        errors = response.data.get('errors') or response.data
        self.assertIn('hiring_type', errors)
        self.assertIn('master data is not configured', str(errors['hiring_type']))
        # Ensure no partial or broken job record was created
        self.assertEqual(Job.objects.count(), 0)

    def test_seed_master_data_command_is_safe_and_idempotent(self):
        """
        The master-data seeding command is safe to execute repeatedly,
        seeds required defaults, and does not duplicate or overwrite existing records.
        """
        # Execute seeding command
        call_command('seed_master_data')

        direct_count = HiringType.objects.filter(name='Direct').count()
        campus_count = HiringType.objects.filter(name='Campus Placement').count()
        self.assertEqual(direct_count, 1)
        self.assertEqual(campus_count, 1)

        total_ht_count_1 = HiringType.objects.count()
        total_et_count_1 = EmploymentType.objects.count()
        total_wm_count_1 = WorkMode.objects.count()

        # Run command second time (idempotency check)
        call_command('seed_master_data')

        self.assertEqual(HiringType.objects.count(), total_ht_count_1)
        self.assertEqual(EmploymentType.objects.count(), total_et_count_1)
        self.assertEqual(WorkMode.objects.count(), total_wm_count_1)

    def test_unauthenticated_request_rejected(self):
        """Unauthenticated job creation is rejected with 401."""
        response = self.client.post('/api/v1/jobs/', self.valid_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_pending_recruiter_approval_rejected(self):
        """Recruiter whose profile is not approved cannot post jobs."""
        unapproved_user = User.objects.create_user(
            email='unapproved@company.com',
            password='Password123!',
            role=User.Role.RECRUITER
        )
        RecruiterProfile.objects.create(
            user=unapproved_user,
            company_name='Pending Corp',
            recruiter_name='Bob Pending',
            designation='HR',
            official_email='unapproved@company.com',
            mobile_number='9876543211',
            approval_status=RecruiterProfile.ApprovalStatus.PENDING,
            is_verified=False
        )

        self.client.force_authenticate(user=unapproved_user)
        response = self.client.post('/api/v1/jobs/', self.valid_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('pending verification', response.data.get('error', ''))

    def test_non_recruiter_role_rejected(self):
        """Student role user cannot post jobs."""
        student_user = User.objects.create_user(
            email='student@college.edu',
            password='Password123!',
            role=User.Role.STUDENT
        )
        self.client.force_authenticate(user=student_user)
        response = self.client.post('/api/v1/jobs/', self.valid_payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
