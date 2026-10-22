import datetime
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from rest_framework.exceptions import ValidationError

from institutions.models import Institution
from master_data.models import Program, Branch, EmploymentType
from accounts.serializers import StudentRegistrationSerializer
from students.models import StudentProfile, StudentExperience
from students.serializers import StudentExperienceSerializer, StudentProfileSerializer

User = get_user_model()


class StudentExperienceSerializerTests(TestCase):
    """
    Tests StudentExperienceSerializer data validation, alias mapping,
    date consistency, and skills list normalization.
    """

    def setUp(self):
        self.emp_type = EmploymentType.objects.create(name='Internship')

    def test_skills_cleaned_trimmed_and_deduplicated(self):
        """Skills must be trimmed, empty entries removed, and deduplicated case-insensitively."""
        serializer = StudentExperienceSerializer()
        raw_skills = [' React ', 'react', 'REACT', '  ', 'Node.js', '', 'Python']
        cleaned = serializer.validate_skills(raw_skills)
        self.assertEqual(cleaned, ['React', 'Node.js', 'Python'])

    def test_skills_validation_rejects_non_list(self):
        """Skills field must be a list."""
        serializer = StudentExperienceSerializer()
        with self.assertRaises(ValidationError):
            serializer.validate_skills("not-a-list")

    def test_alias_mapping_and_employment_type_resolution(self):
        """Frontend field aliases (company, jobTitle, startDate, endDate, isCurrent, type) must map correctly."""
        data = {
            'company': 'Innovative Labs',
            'jobTitle': 'AI Engineer Intern',
            'type': 'Internship',
            'location': 'Bangalore',
            'startDate': '2024-01-10',
            'endDate': '2024-04-20',
            'description': 'Developed ML pipelines',
            'skills': ['Python', 'PyTorch']
        }
        serializer = StudentExperienceSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        attrs = serializer.validated_data
        self.assertEqual(attrs['company_name'], 'Innovative Labs')
        self.assertEqual(attrs['designation'], 'AI Engineer Intern')
        self.assertEqual(attrs['employment_type'], self.emp_type)
        self.assertEqual(str(attrs['start_date']), '2024-01-10')
        self.assertEqual(str(attrs['end_date']), '2024-04-20')
        self.assertEqual(attrs['skills'], ['Python', 'PyTorch'])

    def test_current_experience_sets_end_date_null(self):
        """When isCurrent/is_current is true, end_date must be set to None."""
        data = {
            'company_name': 'Current Co',
            'designation': 'Developer Intern',
            'employment_type': self.emp_type.id,
            'location': 'Remote',
            'start_date': '2024-05-01',
            'end_date': '2024-08-01',
            'isCurrent': True,
            'skills': ['Go']
        }
        serializer = StudentExperienceSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        self.assertIsNone(serializer.validated_data.get('end_date'))

    def test_end_date_before_start_date_fails(self):
        """End date cannot precede start date."""
        data = {
            'company_name': 'Test Corp',
            'designation': 'Intern',
            'employment_type': self.emp_type.id,
            'location': 'City',
            'start_date': '2024-06-01',
            'end_date': '2024-05-01',
            'skills': ['Testing']
        }
        serializer = StudentExperienceSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('end_date', serializer.errors)


class StudentRegistrationExperienceTests(TestCase):
    """
    Tests student registration experience persistence to ensure submitted
    experience values (company, dates, employment type, skills) are stored accurately
    and no fabricated fallbacks (TechCorp Solutions, fake dates) are created.
    """

    def setUp(self):
        self.institution = Institution.objects.create(
            institution_name='Government Engineering College',
            address='College Road',
            district='Ernakulam',
            state='Kerala',
            pincode='682001',
            placement_email='placement@gec.edu',
            placement_phone='9876543210'
        )
        self.program = Program.objects.create(name='MCA')
        self.branch = Branch.objects.create(name='Computer Applications', program=self.program)
        self.emp_type_internship = EmploymentType.objects.create(name='Internship')
        self.emp_type_fulltime = EmploymentType.objects.create(name='Full-Time')

        self.base_reg_data = {
            'email': 'student.candidate@gec.edu',
            'password': 'SecurePassword123!',
            'register_number': 'GEC2024MCA001',
            'first_name': 'Rahul',
            'middle_name': '',
            'last_name': 'Nair',
            'gender': 'Male',
            'date_of_birth': '2001-05-15',
            'blood_group': 'B+',
            'institution_id': self.institution.id,
            'contact_details': {
                'primary_email': 'student.candidate@gec.edu',
                'mobile_number': '9876543210',
                'state': 'Kerala',
                'district': 'Ernakulam',
                'city': 'Kochi',
                'pincode': '682001'
            },
            'current_education': {
                'program_id': self.program.id,
                'branch_id': self.branch.id,
                'field_of_study': 'Computer Science & Applications',
                'startDate': '2023-08-01',
                'expectedEndDate': '2025-06-30',
                'batch': '2023-2025',
                'semester': 4,
                'cgpa': 8.75,
                'active_backlogs': 0
            }
        }

    def test_submitted_experience_persists_exactly_as_entered(self):
        """Submitted company, role, dates, type, description, and skills must be stored accurately."""
        data = self.base_reg_data.copy()
        data['email'] = 'rahul.exact@gec.edu'
        data['register_number'] = 'GEC2024MCA002'
        data['experiences'] = [
            {
                'company': 'Kochi Tech Ventures',
                'jobTitle': 'Backend Developer Intern',
                'type': 'Internship',
                'location': 'Infopark, Kochi',
                'startDate': '2024-01-02',
                'endDate': '2024-04-15',
                'description': 'Built REST APIs with Django and PostgreSQL.',
                'skills': ['Python', 'Django REST Framework', 'PostgreSQL', 'Docker']
            }
        ]

        serializer = StudentRegistrationSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()

        profile = user.student_profile
        experiences = profile.experiences.all()
        self.assertEqual(experiences.count(), 1)

        exp = experiences.first()
        self.assertEqual(exp.company_name, 'Kochi Tech Ventures')
        self.assertNotEqual(exp.company_name, 'TechCorp Solutions')
        self.assertEqual(exp.designation, 'Backend Developer Intern')
        self.assertEqual(exp.location, 'Infopark, Kochi')
        self.assertEqual(str(exp.start_date), '2024-01-02')
        self.assertEqual(str(exp.end_date), '2024-04-15')
        self.assertEqual(exp.employment_type.name, 'Internship')
        self.assertEqual(exp.description, 'Built REST APIs with Django and PostgreSQL.')
        self.assertEqual(exp.skills, ['Python', 'Django REST Framework', 'PostgreSQL', 'Docker'])

    def test_current_experience_at_registration_stores_null_end_date(self):
        """A current experience submitted at registration must have end_date=None."""
        data = self.base_reg_data.copy()
        data['email'] = 'rahul.current@gec.edu'
        data['register_number'] = 'GEC2024MCA003'
        data['experiences'] = [
            {
                'company': 'Innovate Software',
                'jobTitle': 'Full Stack Intern',
                'type': 'Internship',
                'location': 'Remote',
                'startDate': '2024-05-01',
                'isCurrent': True,
                'description': 'Working on React and Django application.',
                'skills': ['React', 'Django', 'Tailwind CSS']
            }
        ]

        serializer = StudentRegistrationSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()

        exp = user.student_profile.experiences.first()
        self.assertEqual(str(exp.start_date), '2024-05-01')
        self.assertIsNone(exp.end_date)
        self.assertEqual(exp.skills, ['React', 'Django', 'Tailwind CSS'])

    def test_empty_experience_creates_zero_records_and_no_techcorp(self):
        """When experiences is empty list, 0 records must be created and TechCorp Solutions must NOT exist."""
        data = self.base_reg_data.copy()
        data['email'] = 'rahul.noexp@gec.edu'
        data['register_number'] = 'GEC2024MCA004'
        data['experiences'] = []

        serializer = StudentRegistrationSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()

        profile = user.student_profile
        self.assertEqual(profile.experiences.count(), 0)
        self.assertFalse(StudentExperience.objects.filter(student=profile).exists())
        self.assertFalse(StudentExperience.objects.filter(company_name='TechCorp Solutions').exists())

    def test_omitted_experience_creates_zero_records(self):
        """When experiences is omitted, 0 records must be created."""
        data = self.base_reg_data.copy()
        data['email'] = 'rahul.omitted@gec.edu'
        data['register_number'] = 'GEC2024MCA005'
        # experiences not provided in payload

        serializer = StudentRegistrationSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()

        profile = user.student_profile
        self.assertEqual(profile.experiences.count(), 0)


class StudentExperienceAPITests(TestCase):
    """
    Tests authenticated student experience CRUD endpoints:
    GET, POST, PUT, DELETE /api/v1/students/experience/
    Ensuring skills persistence, profile updates, and strict student ownership checks.
    """

    def setUp(self):
        self.client = APIClient()
        self.institution = Institution.objects.create(
            institution_name='Engineering College',
            address='Road 1',
            district='Ernakulam',
            state='Kerala',
            pincode='682001',
            placement_email='tpo@ec.edu',
            placement_phone='9876543210'
        )
        self.emp_type = EmploymentType.objects.create(name='Internship')
        self.emp_type_ft = EmploymentType.objects.create(name='Full-Time')

        # Create Student 1
        self.user1 = User.objects.create_user(
            email='student1@ec.edu',
            password='Password123!',
            role=User.Role.STUDENT
        )
        self.profile1 = StudentProfile.objects.create(
            user=self.user1,
            institution=self.institution,
            register_number='REG001',
            first_name='Ananya',
            last_name='Menon',
            date_of_birth='2001-05-15'
        )

        # Create Student 2
        self.user2 = User.objects.create_user(
            email='student2@ec.edu',
            password='Password123!',
            role=User.Role.STUDENT
        )
        self.profile2 = StudentProfile.objects.create(
            user=self.user2,
            institution=self.institution,
            register_number='REG002',
            first_name='Kiran',
            last_name='Kumar',
            date_of_birth='2001-08-20'
        )

    def test_create_experience_with_skills_and_custom_skill(self):
        """Student can create an experience with suggested and custom skills."""
        self.client.force_authenticate(user=self.user1)
        payload = {
            'company_name': 'Apex Cloud Systems',
            'designation': 'Cloud Developer Intern',
            'employment_type': self.emp_type.id,
            'location': 'Bangalore',
            'start_date': '2024-01-15',
            'end_date': '2024-04-15',
            'description': 'Deployed AWS Lambda functions and automated CI/CD.',
            'skills': ['AWS', 'Docker', 'Custom Serverless Framework', 'CI/CD']
        }
        res = self.client.post('/api/v1/students/experience/', payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED, res.data)
        self.assertEqual(res.data['company_name'], 'Apex Cloud Systems')
        self.assertEqual(res.data['skills'], ['AWS', 'Docker', 'Custom Serverless Framework', 'CI/CD'])

        # Verify DB persistence
        exp = StudentExperience.objects.get(id=res.data['id'])
        self.assertEqual(exp.student, self.profile1)
        self.assertEqual(exp.skills, ['AWS', 'Docker', 'Custom Serverless Framework', 'CI/CD'])

    def test_get_experiences_returns_student_skills(self):
        """GET /api/v1/students/experience/ returns the authenticated student's experiences with skills."""
        StudentExperience.objects.create(
            student=self.profile1,
            company_name='Web Solutions',
            designation='Web Intern',
            employment_type=self.emp_type,
            location='Kochi',
            start_date=datetime.date(2024, 2, 1),
            end_date=datetime.date(2024, 5, 1),
            skills=['HTML', 'CSS', 'JavaScript']
        )
        self.client.force_authenticate(user=self.user1)
        res = self.client.get('/api/v1/students/experience/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]['skills'], ['HTML', 'CSS', 'JavaScript'])

    def test_update_experience_modifies_skills_and_dates(self):
        """Student can update their existing experience record including skills and dates."""
        exp = StudentExperience.objects.create(
            student=self.profile1,
            company_name='Old Corp',
            designation='Junior Intern',
            employment_type=self.emp_type,
            location='Kochi',
            start_date=datetime.date(2024, 1, 1),
            end_date=datetime.date(2024, 3, 31),
            skills=['Java']
        )
        self.client.force_authenticate(user=self.user1)
        update_payload = {
            'company_name': 'Updated Corp',
            'designation': 'Software Engineer Intern',
            'employment_type': 'Full-Time',
            'start_date': '2024-01-01',
            'end_date': '2024-06-30',
            'skills': ['Java', 'Spring Boot', 'PostgreSQL', 'Docker']
        }
        res = self.client.put(f'/api/v1/students/experience/{exp.id}/', update_payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_200_OK, res.data)
        exp.refresh_from_db()
        self.assertEqual(exp.company_name, 'Updated Corp')
        self.assertEqual(exp.designation, 'Software Engineer Intern')
        self.assertEqual(exp.employment_type.name, 'Full-Time')
        self.assertEqual(str(exp.end_date), '2024-06-30')
        self.assertEqual(exp.skills, ['Java', 'Spring Boot', 'PostgreSQL', 'Docker'])

    def test_student_cannot_edit_another_students_experience(self):
        """Ownership isolation: Student 2 cannot update or delete Student 1's experience."""
        exp1 = StudentExperience.objects.create(
            student=self.profile1,
            company_name='Secret Corp',
            designation='Intern',
            employment_type=self.emp_type,
            location='Kochi',
            start_date=datetime.date(2024, 1, 1),
            end_date=datetime.date(2024, 3, 31),
            skills=['Python']
        )
        self.client.force_authenticate(user=self.user2)

        # Attempt to edit Student 1's experience
        res_put = self.client.put(f'/api/v1/students/experience/{exp1.id}/', {'company_name': 'Hacked Corp'}, format='json')
        self.assertEqual(res_put.status_code, status.HTTP_404_NOT_FOUND)

        # Attempt to delete Student 1's experience
        res_del = self.client.delete(f'/api/v1/students/experience/{exp1.id}/')
        self.assertEqual(res_del.status_code, status.HTTP_404_NOT_FOUND)

        # Verify exp1 remains unchanged
        exp1.refresh_from_db()
        self.assertEqual(exp1.company_name, 'Secret Corp')

    def test_delete_experience(self):
        """Student can delete their own experience."""
        exp = StudentExperience.objects.create(
            student=self.profile1,
            company_name='Temp Corp',
            designation='Intern',
            employment_type=self.emp_type,
            location='Kochi',
            start_date=datetime.date(2024, 1, 1),
            end_date=datetime.date(2024, 3, 31),
            skills=['Testing']
        )
        self.client.force_authenticate(user=self.user1)
        res = self.client.delete(f'/api/v1/students/experience/{exp.id}/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertFalse(StudentExperience.objects.filter(id=exp.id).exists())

    def test_profile_api_returns_experiences_with_skills_and_no_fabricated_data(self):
        """GET /api/v1/students/profile/ includes experiences with actual skills, not fabricated fallbacks."""
        StudentExperience.objects.create(
            student=self.profile1,
            company_name='Digital Solutions',
            designation='Frontend Intern',
            employment_type=self.emp_type,
            location='Kochi',
            start_date=datetime.date(2024, 1, 1),
            end_date=datetime.date(2024, 4, 1),
            skills=['React', 'Next.js', 'Tailwind CSS']
        )
        self.client.force_authenticate(user=self.user1)
        res = self.client.get('/api/v1/students/profile/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        experiences = res.data.get('experiences', [])
        self.assertEqual(len(experiences), 1)
        self.assertEqual(experiences[0]['company_name'], 'Digital Solutions')
        self.assertEqual(experiences[0]['skills'], ['React', 'Next.js', 'Tailwind CSS'])
