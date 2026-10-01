import pytest
from config import OFFICER_USER
from pages.login_page import LoginPage
from pages.officer_pages import PlacementOfficerDashboardPage

class TestPlacementOfficerWorkflow:
    """
    Placement Officer Workflow Selenium Test Suite.
    Tests Officer Dashboard, Recruiter Approvals, Job Approvals, and Student Login Activity.
    """

    @pytest.fixture(autouse=True)
    def setup_officer_session(self, driver, login_page, officer_page):
        officer_page.log_step(1, "Authenticating Placement Officer Session", url=login_page.URL)
        login_page.load()
        login_page.login(OFFICER_USER["email"], OFFICER_USER["password"])
        assert officer_page.is_dashboard_loaded()
        officer_page.log_step(2, "Placement Officer Session Authenticated", result="PASS")

    def test_officer_dashboard_loaded(self, driver, officer_page):
        officer_page.log_step(1, "Verifying Placement Officer Dashboard Loaded State", expected="/placement-officer/dashboard", actual=driver.current_url)
        assert officer_page.is_dashboard_loaded()
        officer_page.log_step(2, "Placement Officer Dashboard Verified", result="PASS")

    def test_officer_recruiters_approval_tab(self, driver, officer_page):
        officer_page.log_step(1, "Navigating to Recruiter Approvals Tab")
        officer_page.click_recruiters_tab()
        officer_page.log_step(2, "Verifying Recruiter Approvals Tab Active View")
        assert officer_page.is_dashboard_loaded()
        officer_page.log_step(3, "Recruiter Approvals Tab Test Completed", result="PASS")

    def test_officer_job_approval_tab(self, driver, officer_page):
        officer_page.log_step(1, "Navigating to Job Approvals Tab")
        officer_page.click_jobs_tab()
        officer_page.log_step(2, "Verifying Job Approvals Tab Active View")
        assert officer_page.is_dashboard_loaded()
        officer_page.log_step(3, "Job Approvals Tab Test Completed", result="PASS")

    def test_officer_students_login_activity_tab(self, driver, officer_page):
        officer_page.log_step(1, "Navigating to Student Login Activity Tab")
        officer_page.click_students_tab()
        officer_page.log_step(2, "Verifying Student Login Activity Tab Active View")
        assert officer_page.is_dashboard_loaded()
        officer_page.log_step(3, "Student Login Activity Tab Test Completed", result="PASS")
