from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

from accounts.serializers import RecruiterRegistrationSerializer
from recruiters.models import RecruiterProfile

User = get_user_model()


class RecruiterEmailValidationTests(TestCase):
    """
    Tests recruiter registration email validation to ensure personal domains
    (Gmail, Outlook, Yahoo) and custom company domains are accepted,
    while format validation and duplicate prevention are strictly preserved.
    """

    def setUp(self):
        self.client = APIClient()
        self.base_data = {
            'email': 'recruiter@example.com',
            'password': 'SecurePassword123!',
            'company_name': 'Acme Global Technologies Pvt Ltd',
            'recruiter_name': 'Vikram Sharma',
            'designation': 'Senior Talent Acquisition Lead',
            'official_email': 'recruiter@example.com',
            'mobile_number': '9876543210',
            'hiring_volume': '10 - 50 Graduates / Year'
        }

    def test_accepts_valid_gmail_address(self):
        """A syntactically valid Gmail address must be accepted."""
        data = self.base_data.copy()
        data['email'] = 'vikram.recruiter@gmail.com'
        data['official_email'] = 'vikram.recruiter@gmail.com'
        serializer = RecruiterRegistrationSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()
        self.assertEqual(user.email, 'vikram.recruiter@gmail.com')
        self.assertEqual(user.role, User.Role.RECRUITER)
        profile = user.recruiter_profile
        self.assertEqual(profile.official_email, 'vikram.recruiter@gmail.com')

    def test_accepts_user_requested_gmail_address(self):
        """Specifically verifies kkabhinand05@gmail.com is accepted."""
        data = self.base_data.copy()
        data['email'] = 'kkabhinand05@gmail.com'
        data['official_email'] = 'kkabhinand05@gmail.com'
        serializer = RecruiterRegistrationSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()
        self.assertEqual(user.email, 'kkabhinand05@gmail.com')
        self.assertEqual(user.recruiter_profile.official_email, 'kkabhinand05@gmail.com')

    def test_accepts_valid_outlook_address(self):
        """A syntactically valid Outlook address must be accepted."""
        data = self.base_data.copy()
        data['email'] = 'hiring.team@outlook.com'
        data['official_email'] = 'hiring.team@outlook.com'
        serializer = RecruiterRegistrationSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_accepts_valid_yahoo_address(self):
        """A syntactically valid Yahoo address must be accepted."""
        data = self.base_data.copy()
        data['email'] = 'recruiter_jobs@yahoo.com'
        data['official_email'] = 'recruiter_jobs@yahoo.com'
        serializer = RecruiterRegistrationSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_accepts_valid_company_domain_address(self):
        """A standard corporate company-domain address must be accepted."""
        data = self.base_data.copy()
        data['email'] = 'vikram@acmeglobal.com'
        data['official_email'] = 'vikram@acmeglobal.com'
        serializer = RecruiterRegistrationSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_normalizes_uppercase_email_to_lowercase(self):
        """Email addresses with uppercase characters should be normalized to lowercase."""
        data = self.base_data.copy()
        data['email'] = 'Vikram.Hiring@Gmail.COM'
        data['official_email'] = 'Vikram.Hiring@Gmail.COM'
        serializer = RecruiterRegistrationSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()
        self.assertEqual(user.email, 'vikram.hiring@gmail.com')
        self.assertEqual(user.recruiter_profile.official_email, 'vikram.hiring@gmail.com')

    def test_rejects_malformed_email(self):
        """Malformed emails lacking standard syntax must be rejected."""
        malformed_emails = [
            'not-an-email',
            'recruiter@',
            '@gmail.com',
            'recruiter@domain',
            'recruiter@domain.c',
            'recruiter..lead@gmail.com',
            'recruiter@gmail..com',
            'recruiter name@gmail.com'
        ]
        for bad_email in malformed_emails:
            data = self.base_data.copy()
            data['email'] = bad_email
            data['official_email'] = bad_email
            serializer = RecruiterRegistrationSerializer(data=data)
            self.assertFalse(serializer.is_valid(), f"Expected invalid for {bad_email}")
            self.assertTrue(
                'official_email' in serializer.errors or 'email' in serializer.errors,
                f"Expected error on email field for {bad_email}"
            )

    def test_rejects_empty_email_field(self):
        """Empty or blank email fields must be rejected as required."""
        data = self.base_data.copy()
        data['official_email'] = ''
        serializer = RecruiterRegistrationSerializer(data=data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('official_email', serializer.errors)

    def test_rejects_duplicate_email_registration(self):
        """An already registered email must be rejected with duplicate user error."""
        data = self.base_data.copy()
        data['email'] = 'existing.recruiter@gmail.com'
        data['official_email'] = 'existing.recruiter@gmail.com'

        # Create initial user
        serializer1 = RecruiterRegistrationSerializer(data=data)
        self.assertTrue(serializer1.is_valid(), serializer1.errors)
        serializer1.save()

        # Attempt to register again with same email
        data2 = self.base_data.copy()
        data2['email'] = 'existing.recruiter@gmail.com'
        data2['official_email'] = 'existing.recruiter@gmail.com'
        serializer2 = RecruiterRegistrationSerializer(data=data2)
        self.assertFalse(serializer2.is_valid())
        self.assertIn('email', serializer2.errors)
        self.assertIn('already exists', str(serializer2.errors['email']))

    def test_api_view_recruiter_registration_with_personal_gmail(self):
        """Tests the full API endpoint /api/v1/auth/recruiter/register/ with a Gmail address."""
        payload = {
            'username': 'priya_hr',
            'email': 'priya.recruiter@gmail.com',
            'password': 'SecurePassword123!',
            'company_name': 'TalentBridge Solutions',
            'recruiter_name': 'Priya Nair',
            'designation': 'HR Manager',
            'official_email': 'priya.recruiter@gmail.com',
            'mobile_number': '9847112233',
            'hiring_volume': '10 - 50 Graduates / Year'
        }
        response = self.client.post('/api/v1/auth/recruiter/register/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])
        self.assertEqual(response.data['user']['email'], 'priya.recruiter@gmail.com')
        self.assertEqual(response.data['user']['role'], 'recruiter')
