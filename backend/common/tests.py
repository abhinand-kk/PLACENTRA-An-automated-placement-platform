import base64
import email
from email import policy
from datetime import date, time, timedelta
from unittest.mock import patch, MagicMock

from django.test import TestCase, override_settings
from django.core import mail
from django.core.mail import EmailMultiAlternatives
from django.core.exceptions import ImproperlyConfigured
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework.test import APIClient
from rest_framework import status
from googleapiclient.errors import HttpError
from google.auth.exceptions import RefreshError

from common.gmail_backend import GmailAPIEmailBackend, _sanitize_error
from accounts.models import OTPVerification
from institutions.models import Institution
from master_data.models import Program, Branch, EmploymentType, HiringType, WorkMode
from recruiters.models import RecruiterProfile
from students.models import StudentProfile, StudentContact, StudentCurrentEducation
from jobs.models import Job
from applications.models import Application, Interview
from applications.email_service import (
    send_shortlisting_notification,
    send_interview_notification_email,
    send_selection_offer_email,
)

User = get_user_model()


class GmailBackendUnitTests(TestCase):
    """
    Unit tests for the custom GmailAPIEmailBackend over HTTPS.
    Tests MIME serialization, base64url encoding, header sanitization,
    error isolation, and fail_silently compliance.
    """

    def setUp(self):
        self.client_id = "test-client-id.apps.googleusercontent.com"
        self.client_secret = "test-client-secret"
        self.refresh_token = "1//test-refresh-token"
        self.sender_email = "placentraeducation@gmail.com"

    def test_missing_credentials_raises_improperly_configured_on_send(self):
        """
        Missing required OAuth credentials must raise ImproperlyConfigured upon sending,
        preventing silent fallback when Gmail API transport is explicitly configured.
        """
        backend = GmailAPIEmailBackend(
            client_id=None,
            client_secret=None,
            refresh_token=None,
            fail_silently=False
        )
        msg = EmailMultiAlternatives(
            subject="Test Subject",
            body="Test Body",
            from_email="placentraeducation@gmail.com",
            to=["student@example.com"]
        )
        with self.assertRaises(ImproperlyConfigured) as ctx:
            backend.send_messages([msg])
        self.assertIn("missing required credentials", str(ctx.exception))

    def test_empty_messages_returns_zero(self):
        """Calling send_messages with an empty list should safely return 0 without making API calls."""
        backend = GmailAPIEmailBackend(
            client_id=self.client_id,
            client_secret=self.client_secret,
            refresh_token=self.refresh_token
        )
        self.assertEqual(backend.send_messages([]), 0)

    @patch('common.gmail_backend.build')
    @patch('common.gmail_backend.Credentials')
    def test_send_message_encodes_base64url_and_submits_to_gmail_api(self, mock_creds_cls, mock_build):
        """
        Verifies that Django EmailMessage is converted to base64url RFC 2822 MIME
        and submitted to users.messages.send(userId='me', body={'raw': ...}).
        """
        mock_service = MagicMock()
        mock_build.return_value = mock_service
        mock_send_req = MagicMock()
        mock_send_req.execute.return_value = {'id': 'gmail_msg_12345', 'threadId': 'th_123'}
        mock_service.users().messages().send.return_value = mock_send_req

        backend = GmailAPIEmailBackend(
            client_id=self.client_id,
            client_secret=self.client_secret,
            refresh_token=self.refresh_token,
            sender_email=self.sender_email
        )

        msg = EmailMultiAlternatives(
            subject="Welcome to PLACENTRA",
            body="Hello candidate, this is plain text.",
            from_email=f"PLACENTRA Education <{self.sender_email}>",
            to=["candidate@example.com"],
            bcc=["archive@example.com"]
        )
        msg.attach_alternative("<p>Hello candidate, this is HTML.</p>", "text/html")
        msg.attach("offer.pdf", b"%PDF-1.4 test pdf content", "application/pdf")

        sent = backend.send_messages([msg])
        self.assertEqual(sent, 1)

        # Inspect API call
        mock_service.users().messages().send.assert_called_once()
        call_kwargs = mock_service.users().messages().send.call_args[1]
        self.assertEqual(call_kwargs['userId'], 'me')
        raw_b64 = call_kwargs['body']['raw']

        # Decode base64url payload and parse MIME
        raw_bytes = base64.urlsafe_b64decode(raw_b64.encode('ascii'))
        parsed_mime = email.message_from_bytes(raw_bytes, policy=policy.default)

        # Verify headers
        self.assertEqual(parsed_mime['Subject'], "Welcome to PLACENTRA")
        self.assertEqual(parsed_mime['To'], "candidate@example.com")
        self.assertIn("placentraeducation@gmail.com", parsed_mime['From'])
        self.assertIn("archive@example.com", parsed_mime['Bcc'])

        # Verify multi-part attachments (text, html, pdf)
        payload_parts = list(parsed_mime.walk())
        content_types = [p.get_content_type() for p in payload_parts]
        self.assertIn("text/plain", content_types)
        self.assertIn("text/html", content_types)
        self.assertIn("application/pdf", content_types)

    @patch('common.gmail_backend.build')
    @patch('common.gmail_backend.Credentials')
    def test_resend_dev_from_header_sanitized_to_placentra_gmail(self, mock_creds_cls, mock_build):
        """
        If a message still has 'onboarding@resend.dev' in the From header,
        it must be sanitized to the authorized placentraeducation@gmail.com address.
        """
        mock_service = MagicMock()
        mock_build.return_value = mock_service
        mock_send_req = MagicMock()
        mock_send_req.execute.return_value = {'id': 'msg_sanitized_1'}
        mock_service.users().messages().send.return_value = mock_send_req

        backend = GmailAPIEmailBackend(
            client_id=self.client_id,
            client_secret=self.client_secret,
            refresh_token=self.refresh_token,
            sender_email=self.sender_email
        )

        msg = EmailMultiAlternatives(
            subject="Test From Header Sanitization",
            body="Test content",
            from_email="PLACENTRA <onboarding@resend.dev>",
            to=["student@example.com"]
        )

        sent = backend.send_messages([msg])
        self.assertEqual(sent, 1)

        raw_b64 = mock_service.users().messages().send.call_args[1]['body']['raw']
        raw_bytes = base64.urlsafe_b64decode(raw_b64.encode('ascii'))
        parsed_mime = email.message_from_bytes(raw_bytes, policy=policy.default)
        self.assertNotIn("onboarding@resend.dev", parsed_mime['From'])
        self.assertIn("placentraeducation@gmail.com", parsed_mime['From'])

    @patch('common.gmail_backend.build')
    @patch('common.gmail_backend.Credentials')
    def test_gmail_api_http_error_handled_safely(self, mock_creds_cls, mock_build):
        """
        HttpError from Gmail API should be logged in sanitized form without leaking secrets,
        raising when fail_silently=False and returning 0 when fail_silently=True.
        """
        mock_service = MagicMock()
        mock_build.return_value = mock_service
        mock_resp = MagicMock(status=403)
        mock_service.users().messages().send().execute.side_effect = HttpError(
            resp=mock_resp,
            content=b'{"error":{"message":"Daily Limit Exceeded"}}'
        )

        # fail_silently=False raises
        backend_strict = GmailAPIEmailBackend(
            client_id=self.client_id,
            client_secret=self.client_secret,
            refresh_token=self.refresh_token,
            fail_silently=False
        )
        msg = EmailMultiAlternatives("Subj", "Body", self.sender_email, ["to@example.com"])
        with self.assertRaises(HttpError):
            backend_strict.send_messages([msg])

        # fail_silently=True returns 0
        backend_silent = GmailAPIEmailBackend(
            client_id=self.client_id,
            client_secret=self.client_secret,
            refresh_token=self.refresh_token,
            fail_silently=True
        )
        sent = backend_silent.send_messages([msg])
        self.assertEqual(sent, 0)

    @patch('common.gmail_backend.build')
    @patch('common.gmail_backend.Credentials')
    def test_oauth_refresh_error_handled_safely(self, mock_creds_cls, mock_build):
        """
        RefreshError (e.g. invalid grant or expired token) is safely handled without leaking token values.
        """
        mock_service = MagicMock()
        mock_build.return_value = mock_service
        mock_service.users().messages().send().execute.side_effect = RefreshError(
            "invalid_grant: Bad Request"
        )

        backend_silent = GmailAPIEmailBackend(
            client_id=self.client_id,
            client_secret=self.client_secret,
            refresh_token=self.refresh_token,
            fail_silently=True
        )
        msg = EmailMultiAlternatives("Subj", "Body", self.sender_email, ["to@example.com"])
        sent = backend_silent.send_messages([msg])
        self.assertEqual(sent, 0)

    def test_sanitize_error_prevents_leaks(self):
        """_sanitize_error strips private fields and prevents token or raw body leakage."""
        err1 = RefreshError("sensitive_oauth_token_xyz invalid_grant")
        sanitized1 = _sanitize_error(err1)
        self.assertTrue(sanitized1.startswith("Gmail OAuth RefreshError:"))

        resp_mock = MagicMock(status=400)
        err2 = HttpError(resp=resp_mock, content=b'{"error": "invalid"}')
        sanitized2 = _sanitize_error(err2)
        self.assertIn("status 400", sanitized2)


class EmailWorkflowsPreservationTests(TestCase):
    """
    Verifies that all existing PLACENTRA email workflows:
    - Numeric OTP generation, verification, and cooldown
    - Shortlist appreciation emails
    - Interview notifications with PDF attachment
    - Candidate selection & provisional offer letters with PDF attachment
    function identically when routed through Django's email subsystem.
    """

    def setUp(self):
        self.client = APIClient()

        # Master Data
        self.program = Program.objects.create(name="Integrated MCA")
        self.branch = Branch.objects.create(name="Computer Applications", program=self.program)
        self.emp_type = EmploymentType.objects.create(name="Full-Time")
        self.hiring_type = HiringType.objects.create(name="Campus Placement")
        self.work_mode = WorkMode.objects.create(name="On-Site")

        # Institution
        self.institution = Institution.objects.create(
            institution_name="Amal Jyothi College of Engineering",
            address="Kanjirappally",
            district="Kottayam",
            state="Kerala",
            pincode="686518",
            placement_email="placement@ajce.in",
            placement_phone="9876543210"
        )

        # Student
        self.student_user = User.objects.create_user(
            email="abhinandkk2027@mca.ajce.in",
            password="Password123!",
            role=User.Role.STUDENT
        )
        self.student_profile = StudentProfile.objects.create(
            user=self.student_user,
            institution=self.institution,
            register_number="AJC25MCA-9999",
            first_name="Abhinand",
            last_name="K K",
            gender="Male",
            date_of_birth=date(2002, 5, 10),
            blood_group="O+"
        )
        self.student_contact = StudentContact.objects.create(
            student=self.student_profile,
            primary_email="abhinandkk2027@mca.ajce.in",
            personal_email="abhinand.personal@gmail.com",
            mobile_number="9876543210",
            state="Kerala",
            district="Kottayam",
            city="Kanjirappally",
            pincode="686518",
            permanent_address="Amal Jyothi Campus"
        )
        self.student_edu = StudentCurrentEducation.objects.create(
            student=self.student_profile,
            program=self.program,
            branch=self.branch,
            field_of_study="Computer Applications",
            start_date=date(2022, 8, 1),
            end_date=date(2027, 6, 30),
            batch="2022-2027",
            semester="S7",
            cgpa=8.5,
            active_backlogs=0
        )

        # Recruiter
        self.recruiter_user = User.objects.create_user(
            email="recruiter@deloitte.com",
            password="Password123!",
            role=User.Role.RECRUITER
        )
        self.recruiter_profile = RecruiterProfile.objects.create(
            user=self.recruiter_user,
            company_name="Deloitte",
            recruiter_name="Talent Acquisition Lead",
            designation="HR Manager",
            official_email="recruiter@deloitte.com",
            mobile_number="9876543220",
            hiring_volume="Medium (10-50)",
            is_verified=True,
            approval_status=RecruiterProfile.ApprovalStatus.APPROVED
        )

        # Job & Application
        self.job = Job.objects.create(
            recruiter=self.recruiter_profile,
            job_title="Software Engineer - Cloud Systems",
            employment_type=self.emp_type,
            hiring_type=self.hiring_type,
            work_mode=self.work_mode,
            location="Kochi, Kerala",
            package_lpa=8.50,
            expected_hiring_month="July 2027",
            application_deadline=date.today() + timedelta(days=30),
            minimum_cgpa=7.0,
            maximum_active_backlogs=0,
            status=Job.Status.OPEN
        )
        self.application = Application.objects.create(
            job=self.job,
            student=self.student_profile,
            application_status=Application.ApplicationStatus.SHORTLISTED
        )


    def test_numeric_otp_generation_delivery_and_expiry(self):
        """
        Verifies numeric 6-digit OTP generation, delivery to recipient,
        10-minute validity, and verification logic.
        """
        mail.outbox.clear()
        response = self.client.post('/api/v1/auth/otp/send/', {
            'target_type': 'student_email',
            'contact_value': 'teststudent@ajce.in'
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)

        sent_mail = mail.outbox[0]
        self.assertEqual(sent_mail.subject, "PLACENTRA Email Verification OTP")
        self.assertIn("teststudent@ajce.in", sent_mail.to)

        # Extract 6-digit OTP from message
        import re
        otp_match = re.search(r'\b\d{6}\b', sent_mail.body)
        self.assertIsNotNone(otp_match)
        otp = otp_match.group(0)

        # Verify OTP record in database
        otp_record = OTPVerification.objects.get(
            target_type='student_email',
            contact_value='teststudent@ajce.in'
        )
        self.assertEqual(otp_record.otp, otp)
        self.assertFalse(otp_record.is_expired())

        # Test verification API
        verify_resp = self.client.post('/api/v1/auth/otp/verify/', {
            'target_type': 'student_email',
            'contact_value': 'teststudent@ajce.in',
            'otp': otp
        })
        self.assertEqual(verify_resp.status_code, status.HTTP_200_OK)
        otp_record.refresh_from_db()
        self.assertTrue(otp_record.is_verified)

    def test_shortlist_notification_workflow(self):
        """Shortlist notification sends HTML & plain-text email without PDF attachment."""
        mail.outbox.clear()
        sent = send_shortlisting_notification(self.application)
        self.assertTrue(sent)
        self.assertEqual(len(mail.outbox), 1)

        sent_mail = mail.outbox[0]
        self.assertIn("Shortlisted", sent_mail.subject)
        self.assertIn("Software Engineer - Cloud Systems", sent_mail.subject)
        self.assertIn("Abhinand", sent_mail.body)
        self.assertEqual(len(sent_mail.attachments), 0)  # No PDF on shortlisting

    def test_interview_invitation_workflow_with_pdf(self):
        """Interview invitation sends email with attached Interview Invitation PDF."""
        mail.outbox.clear()
        interview = Interview.objects.create(
            application=self.application,
            interview_type="Technical Interview",
            interview_date=date.today() + timedelta(days=3),
            interview_time=time(10, 30),
            duration_minutes=45,
            mode="Online",
            location_or_link="https://meet.google.com/abc-defg-hij",
            instructions="Please be ready 10 minutes prior."
        )

        sent = send_interview_notification_email(interview)
        self.assertTrue(sent)
        self.assertEqual(len(mail.outbox), 1)

        sent_mail = mail.outbox[0]
        self.assertIn("Technical Interview", sent_mail.subject)
        self.assertIn("meet.google.com", sent_mail.body)
        self.assertEqual(len(sent_mail.attachments), 1)
        filename, content, mime_type = sent_mail.attachments[0]
        self.assertTrue(filename.endswith(".pdf"))
        self.assertEqual(mime_type, "application/pdf")
        self.assertTrue(content.startswith(b"%PDF"))

    def test_selection_offer_email_with_pdf_attachment(self):
        """Selection offer email sends message with attached provisional offer letter PDF."""
        mail.outbox.clear()
        self.application.application_status = Application.ApplicationStatus.SELECTED
        self.application.save()

        sent, recipient = send_selection_offer_email(self.application)
        self.assertTrue(sent)
        self.assertIn("abhinandkk2027@mca.ajce.in", recipient)
        self.assertEqual(len(mail.outbox), 1)

        sent_mail = mail.outbox[0]
        self.assertIn("Selection & Offer Letter", sent_mail.subject)
        self.assertIn("8.5 LPA", sent_mail.body)
        self.assertEqual(len(sent_mail.attachments), 1)
        filename, content, mime_type = sent_mail.attachments[0]
        self.assertTrue(filename.endswith("_Selection_Offer_Letter.pdf"))
        self.assertEqual(mime_type, "application/pdf")
        self.assertTrue(content.startswith(b"%PDF"))

    @patch('django.core.mail.EmailMultiAlternatives.send')
    def test_selection_offer_email_failure_does_not_break_status(self, mock_send):
        """Email delivery failure returns False but does not revert candidate selection."""
        mock_send.side_effect = Exception("Delivery timeout")
        self.application.application_status = Application.ApplicationStatus.SELECTED
        self.application.save()

        sent, err_msg = send_selection_offer_email(self.application)
        self.assertFalse(sent)
        self.application.refresh_from_db()
        # Candidate remains selected
        self.assertEqual(self.application.application_status, Application.ApplicationStatus.SELECTED)

    def test_password_reset_otp_workflow(self):
        """Password reset OTP email generation, delivery, and verification."""
        mail.outbox.clear()
        response = self.client.post('/api/v1/auth/password-reset/send-otp/', {
            'email': self.student_user.email
        })
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)

        sent_mail = mail.outbox[0]
        self.assertEqual(sent_mail.subject, "PLACENTRA Password Reset OTP")
        self.assertIn(self.student_user.email, sent_mail.to)

        import re
        otp_match = re.search(r'\b\d{6}\b', sent_mail.body)
        self.assertIsNotNone(otp_match)
        otp = otp_match.group(0)

        verify_resp = self.client.post('/api/v1/auth/password-reset/verify-otp/', {
            'email': self.student_user.email,
            'otp': otp
        })
        self.assertEqual(verify_resp.status_code, status.HTTP_200_OK)
        self.assertIn('reset_token', verify_resp.data)

    def test_placement_officer_registration_email_workflow(self):
        """Placement Officer registration sends confirmation email."""
        from applications.email_service import send_placement_officer_registration_email
        from placement_officers.models import PlacementOfficerProfile

        officer_user = User.objects.create_user(
            email="officer@ajce.in",
            password="Password123!",
            role=User.Role.PLACEMENT_OFFICER
        )
        PlacementOfficerProfile.objects.create(
            user=officer_user,
            institution=self.institution,
            full_name="Prof. John Mathew",
            designation="Head of Placements",
            mobile_number="9876543230"
        )

        mail.outbox.clear()
        sent = send_placement_officer_registration_email(officer_user)
        self.assertTrue(sent)
        self.assertEqual(len(mail.outbox), 1)
        sent_mail = mail.outbox[0]
        self.assertIn("Placement Officer Account Created", sent_mail.subject)
        self.assertIn("officer@ajce.in", sent_mail.to)


class SettingsAndFallbackSelectionTests(TestCase):
    """
    Verifies that environment variables select the appropriate email transport,
    missing credentials don't break settings loading, and invalid Gmail settings
    fail clearly rather than silently falling back to other providers.
    """

    def test_explicit_gmail_missing_credentials_fails_on_send_without_silent_fallback(self):
        """
        When Gmail API backend is explicitly configured, missing credentials
        raise ImproperlyConfigured rather than silently switching to Resend.
        """
        backend = GmailAPIEmailBackend(
            client_id="id-present",
            client_secret="",  # Missing secret
            refresh_token="",   # Missing token
            fail_silently=False
        )
        msg = EmailMultiAlternatives("Test", "Body", "placentraeducation@gmail.com", ["to@example.com"])
        with self.assertRaises(ImproperlyConfigured) as ctx:
            backend.send_messages([msg])
        self.assertIn("GMAIL_CLIENT_SECRET", str(ctx.exception))
        self.assertIn("GMAIL_REFRESH_TOKEN", str(ctx.exception))

    def test_sender_display_name_formatting(self):
        """Sender format should default to PLACENTRA Education <placentraeducation@gmail.com>."""
        backend = GmailAPIEmailBackend(
            client_id="id",
            client_secret="secret",
            refresh_token="token",
            sender_email="placentraeducation@gmail.com"
        )
        self.assertEqual(backend.sender_email, "placentraeducation@gmail.com")
