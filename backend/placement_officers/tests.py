from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from datetime import date

from institutions.models import Institution
from placement_officers.models import PlacementOfficerProfile
from students.models import StudentProfile, StudentCurrentEducation
from master_data.models import Program, Branch
from accounts.serializers import resolve_institution

User = get_user_model()


class PlacementOfficerStudentVisibilityTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # Create Institution A (Amal Jyothi) and Institution B (Other College)
        self.inst_a = Institution.objects.create(
            institution_name="Amal Jyothi College of Engineering",
            address="Kanjirappally",
            district="Kottayam",
            state="Kerala",
            pincode="686518",
            placement_email="placement@ajce.in",
            placement_phone="9876543210"
        )
        self.inst_b = Institution.objects.create(
            institution_name="Marian College Kuttikkanam",
            address="Kuttikkanam",
            district="Idukki",
            state="Kerala",
            pincode="685531",
            placement_email="placement@marian.in",
            placement_phone="9876543211"
        )

        # Create Placement Officer for Institution A
        self.po_user_a = User.objects.create_user(
            email="officer_a@ajce.in",
            password="Password123!",
            role=User.Role.PLACEMENT_OFFICER
        )
        self.po_profile_a = PlacementOfficerProfile.objects.create(
            user=self.po_user_a,
            institution=self.inst_a,
            full_name="Officer AJCE",
            designation="Head of Placements",
            official_email="officer_a@ajce.in",
            mobile_number="9876543210"
        )

        # Create Placement Officer for Institution B
        self.po_user_b = User.objects.create_user(
            email="officer_b@marian.in",
            password="Password123!",
            role=User.Role.PLACEMENT_OFFICER
        )
        self.po_profile_b = PlacementOfficerProfile.objects.create(
            user=self.po_user_b,
            institution=self.inst_b,
            full_name="Officer Marian",
            designation="Placement Officer",
            official_email="officer_b@marian.in",
            mobile_number="9876543211"
        )

        # Master data
        self.program = Program.objects.create(name="MCA")
        self.branch = Branch.objects.create(program=self.program, name="Computer Applications")

        # Create 2 Students for Institution A
        self.student_user_1 = User.objects.create_user(
            email="student1@ajce.in",
            password="Password123!",
            role=User.Role.STUDENT
        )
        self.student_profile_1 = StudentProfile.objects.create(
            user=self.student_user_1,
            institution=self.inst_a,
            register_number="AJC25MCA-001",
            first_name="Abhinand",
            last_name="K K",
            gender="Male",
            date_of_birth=date(2003, 5, 15),
            blood_group="B+",
            profile_completion=95
        )
        StudentCurrentEducation.objects.create(
            student=self.student_profile_1,
            program=self.program,
            branch=self.branch,
            field_of_study="Computer Applications",
            start_date=date(2024, 7, 1),
            end_date=date(2027, 6, 30),
            cgpa=8.75,
            active_backlogs=0,
            batch="2027",
            semester="4"
        )

        self.student_user_2 = User.objects.create_user(
            email="student2@ajce.in",
            password="Password123!",
            role=User.Role.STUDENT
        )
        self.student_profile_2 = StudentProfile.objects.create(
            user=self.student_user_2,
            institution=self.inst_a,
            register_number="AJC25MCA-002",
            first_name="Jestin",
            last_name="Shaji",
            gender="Male",
            date_of_birth=date(2003, 8, 20),
            blood_group="O+",
            profile_completion=90
        )
        StudentCurrentEducation.objects.create(
            student=self.student_profile_2,
            program=self.program,
            branch=self.branch,
            field_of_study="Computer Applications",
            start_date=date(2024, 7, 1),
            end_date=date(2027, 6, 30),
            cgpa=8.50,
            active_backlogs=0,
            batch="2027",
            semester="4"
        )

        # Create 1 Student for Institution B
        self.student_user_b = User.objects.create_user(
            email="student_b@marian.in",
            password="Password123!",
            role=User.Role.STUDENT
        )
        self.student_profile_b = StudentProfile.objects.create(
            user=self.student_user_b,
            institution=self.inst_b,
            register_number="MCK25MCA-001",
            first_name="Marian",
            last_name="Student",
            gender="Female",
            date_of_birth=date(2003, 3, 10),
            blood_group="A+",
            profile_completion=85
        )

    def test_authorized_officer_sees_institution_students(self):
        """Officer A sees only students enrolled in Institution A (2 students)."""
        self.client.force_authenticate(user=self.po_user_a)
        response = self.client.get('/api/v1/placement-officers/students/', HTTP_HOST='localhost')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
        names = [s['full_name'] for s in response.data]
        self.assertIn("Abhinand K K", names)
        self.assertIn("Jestin Shaji", names)
        self.assertNotIn("Marian Student", names)

    def test_unauthorized_officer_different_institution_isolation(self):
        """Officer B sees only students enrolled in Institution B (1 student), not Institution A."""
        self.client.force_authenticate(user=self.po_user_b)
        response = self.client.get('/api/v1/placement-officers/students/', HTTP_HOST='localhost')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['full_name'], "Marian Student")

    def test_empty_institution_returns_empty_list(self):
        """An officer whose institution has no registered students receives an empty list []."""
        empty_inst = Institution.objects.create(
            institution_name="Empty Campus",
            address="Address",
            district="District",
            state="State",
            pincode="000000",
            placement_email="empty@campus.edu",
            placement_phone="0000000000"
        )
        po_empty_user = User.objects.create_user(
            email="po_empty@campus.edu",
            password="Password123!",
            role=User.Role.PLACEMENT_OFFICER
        )
        PlacementOfficerProfile.objects.create(
            user=po_empty_user,
            institution=empty_inst,
            full_name="Empty Officer",
            designation="Officer",
            official_email="po_empty@campus.edu",
            mobile_number="0000000000"
        )
        self.client.force_authenticate(user=po_empty_user)
        response = self.client.get('/api/v1/placement-officers/students/', HTTP_HOST='localhost')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data, [])

    def test_student_detail_view_permissions(self):
        """Officer A can view Institution A student; Officer B receives 404 for Institution A student."""
        # Officer A accesses Student 1 (Inst A) -> 200 OK
        self.client.force_authenticate(user=self.po_user_a)
        response_a = self.client.get(f'/api/v1/placement-officers/students/{self.student_profile_1.id}/', HTTP_HOST='localhost')
        self.assertEqual(response_a.status_code, status.HTTP_200_OK)
        self.assertEqual(response_a.data['full_name'], "Abhinand K K")

        # Officer B accesses Student 1 (Inst A) -> 404 Not Found (Scoped out)
        self.client.force_authenticate(user=self.po_user_b)
        response_b = self.client.get(f'/api/v1/placement-officers/students/{self.student_profile_1.id}/', HTTP_HOST='localhost')
        self.assertEqual(response_b.status_code, status.HTTP_404_NOT_FOUND)

    def test_unauthenticated_requests_rejected(self):
        """Anonymous requests return 401; Student user returns 403."""
        # Unauthenticated
        response = self.client.get('/api/v1/placement-officers/students/', HTTP_HOST='localhost')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # Role = student
        self.client.force_authenticate(user=self.student_user_1)
        response = self.client.get('/api/v1/placement-officers/students/', HTTP_HOST='localhost')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_resolve_institution_handles_case_and_suffixes(self):
        """resolve_institution should match case-insensitively and strip 'Autonomous' without duplicates."""
        # Exact match
        inst1 = resolve_institution("Amal Jyothi College of Engineering")
        self.assertEqual(inst1.id, self.inst_a.id)

        # Lowercase match
        inst2 = resolve_institution("amal jyothi college of engineering")
        self.assertEqual(inst2.id, self.inst_a.id)

        # Suffix variation match ('Autonomous')
        inst3 = resolve_institution("Amal Jyothi College of Engineering Autonomous")
        self.assertEqual(inst3.id, self.inst_a.id)
