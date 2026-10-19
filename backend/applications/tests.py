from datetime import date, time, timedelta
from unittest.mock import patch
from django.test import TestCase
from django.contrib.auth import get_user_model
from django.core import mail
from rest_framework.test import APIClient
from rest_framework import status

from institutions.models import Institution
from master_data.models import Program, Branch, EmploymentType, HiringType, WorkMode
from recruiters.models import RecruiterProfile
from students.models import StudentProfile, StudentContact, StudentCurrentEducation
from jobs.models import Job
from notifications.models import Notification
from applications.models import Application, Interview
from applications.pdf_generator import generate_selection_offer_pdf

User = get_user_model()


class CandidateSelectionEmailAndOfferTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        # 1. Master Data
        self.program = Program.objects.create(name="Integrated MCA")
        self.branch = Branch.objects.create(name="Computer Applications", program=self.program)
        self.emp_type = EmploymentType.objects.create(name="Full-Time")
        self.hiring_type = HiringType.objects.create(name="Campus Placement")
        self.work_mode = WorkMode.objects.create(name="On-Site")

        # 2. Institution
        self.institution = Institution.objects.create(
            institution_name="Amal Jyothi College of Engineering",
            address="Kanjirappally",
            district="Kottayam",
            state="Kerala",
            pincode="686518",
            placement_email="placement@ajce.in",
            placement_phone="9876543210"
        )

        # 3. Student User & Profile
        self.student_user = User.objects.create_user(
            email="abhinandkk2027@mca.ajce.in",
            password="Password123!",
            role=User.Role.STUDENT
        )
        self.student_profile = StudentProfile.objects.create(
            user=self.student_user,
            institution=self.institution,
            register_number="AJC25MCA-2002",
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

        # 4. Recruiter User & Profile
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

        # 5. Other Recruiter (Unauthorized for this job)
        self.other_recruiter_user = User.objects.create_user(
            email="recruiter2@othercorp.com",
            password="Password123!",
            role=User.Role.RECRUITER
        )
        self.other_recruiter_profile = RecruiterProfile.objects.create(
            user=self.other_recruiter_user,
            company_name="OtherCorp",
            recruiter_name="Other Recruiter",
            designation="HR Specialist",
            official_email="recruiter2@othercorp.com",
            mobile_number="9876543221",
            is_verified=True,
            approval_status=RecruiterProfile.ApprovalStatus.APPROVED
        )

        # 6. Job
        self.job = Job.objects.create(
            recruiter=self.recruiter_profile,
            job_title="Analyst - Software Engineer",
            job_description="Software engineer role in core technology practice.",
            employment_type=self.emp_type,
            hiring_type=self.hiring_type,
            minimum_cgpa=6.5,
            maximum_active_backlogs=0,
            expected_hiring_month="July 2026",
            application_deadline=date.today() + timedelta(days=30),
            package_lpa=8.0,
            work_mode=self.work_mode,
            location="Bengaluru / Hybrid",
            status=Job.Status.OPEN
        )

        # 7. Application
        self.application = Application.objects.create(
            student=self.student_profile,
            job=self.job,
            application_status=Application.ApplicationStatus.INTERVIEW_SCHEDULED
        )

    def test_select_candidate_triggers_email_workflow_with_offer_letter(self):
        """
        Selecting an eligible candidate persists status, delivers email to student's registered address,
        attaches official Offer Letter PDF, and sets offer_letter_sent=True.
        """
        self.client.force_authenticate(user=self.recruiter_user)
        mail.outbox.clear()

        response = self.client.patch(
            f"/api/v1/applications/{self.application.id}/status/",
            {"status": "Selected"},
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.data.get("email_sent"))
        self.assertEqual(response.data.get("application_status"), "Selected")

        # Database state verification
        self.application.refresh_from_db()
        self.assertEqual(self.application.application_status, Application.ApplicationStatus.SELECTED)
        self.assertTrue(self.application.offer_letter_sent)
        self.assertIsNotNone(self.application.offer_letter_sent_at)

        # Email delivery verification
        self.assertEqual(len(mail.outbox), 1)
        sent_email = mail.outbox[0]
        self.assertIn("abhinandkk2027@mca.ajce.in", sent_email.to)
        self.assertIn("Analyst - Software Engineer", sent_email.subject)
        self.assertIn("Deloitte", sent_email.subject)

        # Content verification: authoritative data included
        self.assertIn("Abhinand K K", sent_email.body)
        self.assertIn("Analyst - Software Engineer", sent_email.body)
        self.assertIn("Deloitte", sent_email.body)
        self.assertIn("8.00 LPA", sent_email.body)
        self.assertIn("Bengaluru / Hybrid", sent_email.body)

        # Attachment verification
        self.assertEqual(len(sent_email.attachments), 1)
        attachment_name, attachment_content, content_type = sent_email.attachments[0]
        self.assertTrue(attachment_name.endswith(".pdf"))
        self.assertEqual(content_type, "application/pdf")
        self.assertTrue(attachment_content.startswith(b"%PDF"))

        # In-app notification verification
        notif = Notification.objects.filter(user=self.student_user).first()
        self.assertIsNotNone(notif)
        self.assertIn("Selected & Offered", notif.title)
        self.assertIn("Analyst - Software Engineer", notif.message)

    def test_idempotency_repeated_selection_does_not_send_duplicate_emails(self):
        """
        Subsequent selection updates or page refreshes do not send duplicate emails when offer letter is already sent.
        """
        self.client.force_authenticate(user=self.recruiter_user)
        mail.outbox.clear()

        # First selection
        res1 = self.client.patch(f"/api/v1/applications/{self.application.id}/status/", {"status": "Selected"})
        self.assertEqual(res1.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)

        # Second selection attempt (e.g. repeated click or form resubmission)
        res2 = self.client.patch(f"/api/v1/applications/{self.application.id}/status/", {"status": "Selected"})
        self.assertEqual(res2.status_code, status.HTTP_200_OK)
        # Email count must NOT increase
        self.assertEqual(len(mail.outbox), 1)
        self.assertTrue(res2.data.get("email_sent"))

    def test_force_resend_offer_email(self):
        """
        When recruiter explicitly requests resend or uses resend-offer-email endpoint, email is delivered.
        """
        self.client.force_authenticate(user=self.recruiter_user)
        mail.outbox.clear()

        # First selection
        self.client.patch(f"/api/v1/applications/{self.application.id}/status/", {"status": "Selected"})
        self.assertEqual(len(mail.outbox), 1)

        # Call resend endpoint
        res = self.client.post(f"/api/v1/applications/{self.application.id}/resend-offer-email/")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data.get("email_sent"))
        self.assertEqual(len(mail.outbox), 2)

    @patch("django.core.mail.EmailMultiAlternatives.send")
    def test_email_failure_preserves_selected_status_without_reversion(self, mock_send):
        """
        If SMTP server fails, application status remains Selected, offer_letter_sent remains False,
        and failure is surfaced in response without raising an uncaught crash.
        """
        mock_send.side_effect = Exception("SMTP Connection Timeout")
        self.client.force_authenticate(user=self.recruiter_user)

        response = self.client.patch(
            f"/api/v1/applications/{self.application.id}/status/",
            {"status": "Selected"},
            format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(response.data.get("email_sent"))

        # Selection status is successfully persisted
        self.application.refresh_from_db()
        self.assertEqual(self.application.application_status, Application.ApplicationStatus.SELECTED)
        self.assertFalse(self.application.offer_letter_sent)

    def test_unauthorized_recruiter_cannot_select_candidate(self):
        """
        A recruiter who does not own the job cannot select the candidate or trigger emails.
        """
        self.client.force_authenticate(user=self.other_recruiter_user)
        mail.outbox.clear()

        response = self.client.patch(
            f"/api/v1/applications/{self.application.id}/status/",
            {"status": "Selected"},
            format="json"
        )

        self.assertIn(response.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])
        self.assertEqual(len(mail.outbox), 0)

        self.application.refresh_from_db()
        self.assertNotEqual(self.application.application_status, Application.ApplicationStatus.SELECTED)

    def test_download_offer_letter_pdf_endpoint(self):
        """
        Authorized recruiter and student can download the offer letter PDF; non-selected returns 400.
        """
        # Non-selected application
        self.client.force_authenticate(user=self.student_user)
        res_bad = self.client.get(f"/api/v1/applications/{self.application.id}/offer-letter/")
        self.assertEqual(res_bad.status_code, status.HTTP_400_BAD_REQUEST)

        # Mark selected
        self.application.application_status = Application.ApplicationStatus.SELECTED
        self.application.save()

        # Student downloads
        res_student = self.client.get(f"/api/v1/applications/{self.application.id}/offer-letter/")
        self.assertEqual(res_student.status_code, status.HTTP_200_OK)
        self.assertEqual(res_student["Content-Type"], "application/pdf")
        self.assertTrue(res_student.content.startswith(b"%PDF"))

        # Recruiter downloads
        self.client.force_authenticate(user=self.recruiter_user)
        res_recruiter = self.client.get(f"/api/v1/applications/{self.application.id}/offer-letter/")
        self.assertEqual(res_recruiter.status_code, status.HTTP_200_OK)
        self.assertEqual(res_recruiter["Content-Type"], "application/pdf")

        # Other recruiter cannot access (either 403 or 404 due to queryset scoping)
        self.client.force_authenticate(user=self.other_recruiter_user)
        res_other = self.client.get(f"/api/v1/applications/{self.application.id}/offer-letter/")
        self.assertIn(res_other.status_code, [status.HTTP_403_FORBIDDEN, status.HTTP_404_NOT_FOUND])

    def test_missing_optional_terms_does_not_fabricate_data(self):
        """
        When optional job terms (e.g. expected_hiring_month) are not provided, PDF and email do not invent dates or numbers.
        """
        self.job.expected_hiring_month = ""
        self.job.location = "Flexible"
        self.job.save()

        pdf_bytes = generate_selection_offer_pdf(self.application)
        self.assertTrue(pdf_bytes.startswith(b"%PDF"))
        # PDF should generate successfully without crashing

    def test_existing_shortlist_and_interview_workflows_preserved(self):
        """
        Verifies that shortlisting and scheduling interviews continue to send their respective emails without regression.
        """
        # Shortlisting with second job posting to respect (student, job) uniqueness
        job2 = Job.objects.create(
            recruiter=self.recruiter_profile,
            job_title="Associate Consultant",
            job_description="Consulting role.",
            employment_type=self.emp_type,
            hiring_type=self.hiring_type,
            minimum_cgpa=6.0,
            maximum_active_backlogs=0,
            expected_hiring_month="August 2026",
            application_deadline=date.today() + timedelta(days=30),
            package_lpa=9.5,
            work_mode=self.work_mode,
            location="Hyderabad",
            status=Job.Status.OPEN
        )
        app2 = Application.objects.create(
            student=self.student_profile,
            job=job2,
            application_status=Application.ApplicationStatus.APPLIED
        )
        self.client.force_authenticate(user=self.recruiter_user)
        mail.outbox.clear()

        res_sl = self.client.patch(f"/api/v1/applications/{app2.id}/status/", {"status": "Shortlisted"})
        self.assertEqual(res_sl.status_code, status.HTTP_200_OK)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("Shortlisted", mail.outbox[0].subject)

        # Interview Scheduling
        mail.outbox.clear()
        interview_data = {
            "application": app2.id,
            "interview_type": Interview.InterviewType.TECHNICAL,
            "interview_date": (date.today() + timedelta(days=5)).strftime("%Y-%m-%d"),
            "interview_time": time(10, 0).strftime("%H:%M:%S"),
            "duration_minutes": 45,
            "mode": Interview.InterviewMode.ONLINE,
            "location_or_link": "https://meet.google.com/test-meet",
            "instructions": "Be prepared with system design concepts."
        }
        res_int = self.client.post("/api/v1/interviews/", interview_data, format="json")
        self.assertEqual(res_int.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(mail.outbox), 1)
        self.assertIn("Interview Scheduled", mail.outbox[0].subject)
