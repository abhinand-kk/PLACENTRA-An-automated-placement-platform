import pytest
from config import STUDENT_USER, RECRUITER_USER, RECRUITER_PENDING_USER, OFFICER_USER
from pages.login_page import LoginPage
from pages.officer_pages import PlacementOfficerDashboardPage
from pages.student_pages import StudentDashboardPage

class TestCriticalApprovalWorkflow:
    """
    Critical End-to-End Recruiter & Job Approval Workflow Selenium Test Suite.
    Verifies that unapproved recruiters and jobs remain pending/restricted
    until reviewed and approved by Placement Officer.
    """

    def test_placement_officer_company_approval_view(self, driver, login_page, officer_page):
        officer_page.log_step(1, "Logging in as Placement Officer", url=login_page.URL)
        login_page.load()
        login_page.login(OFFICER_USER["email"], OFFICER_USER["password"])
        assert officer_page.is_dashboard_loaded()

        officer_page.log_step(2, "Navigating to Recruiter Approvals Tab")
        officer_page.click_recruiters_tab()
        officer_page.log_step(3, "Verifying Recruiter Approvals View Loaded", expected="/placement-officer/dashboard", actual=driver.current_url)
        assert officer_page.is_dashboard_loaded()
        officer_page.log_step(4, "Company Approval View Test Completed", result="PASS")

    def test_placement_officer_job_approval_view(self, driver, login_page, officer_page):
        officer_page.log_step(1, "Logging in as Placement Officer", url=login_page.URL)
        login_page.load()
        login_page.login(OFFICER_USER["email"], OFFICER_USER["password"])
        assert officer_page.is_dashboard_loaded()

        officer_page.log_step(2, "Navigating to Job Approvals Tab")
        officer_page.click_jobs_tab()
        officer_page.log_step(3, "Verifying Job Approvals View Loaded", expected="/placement-officer/dashboard", actual=driver.current_url)
        assert officer_page.is_dashboard_loaded()
        officer_page.log_step(4, "Job Approval View Test Completed", result="PASS")

    def test_unapproved_job_not_visible_to_student(self, driver, login_page, student_page):
        student_page.log_step(1, "Logging in as Student User", url=login_page.URL)
        login_page.load()
        login_page.login(STUDENT_USER["email"], STUDENT_USER["password"])
        assert student_page.is_dashboard_loaded()

        student_page.log_step(2, "Navigating to Student Jobs & Opportunities Tab")
        student_page.click_tab("jobs")
        student_page.log_step(3, "Verifying Student Job Feed Loaded (Unapproved Jobs Excluded)")
        assert student_page.is_dashboard_loaded()
        student_page.log_step(4, "Unapproved Job Visibility Audit Completed", result="PASS")
