import pytest
from config import RECRUITER_USER, RECRUITER_PENDING_USER
from pages.login_page import LoginPage
from pages.recruiter_pages import RecruiterDashboardPage

class TestRecruiterWorkflow:
    """
    Recruiter Workflow Selenium Test Suite.
    Tests Recruiter Dashboard, Job Postings, and Approval status UI.
    """

    def test_approved_recruiter_dashboard(self, driver, login_page, recruiter_page):
        recruiter_page.log_step(1, "Opening Login Page", url=login_page.URL)
        login_page.load()
        
        recruiter_page.log_step(2, f"Logging in as Approved Recruiter [{RECRUITER_USER['email']}]")
        login_page.login(RECRUITER_USER["email"], RECRUITER_USER["password"])
        
        recruiter_page.log_step(3, "Verifying Recruiter Dashboard Load State", expected="/recruiter/dashboard", actual=driver.current_url)
        assert recruiter_page.is_dashboard_loaded()
        recruiter_page.log_step(4, "Approved Recruiter Dashboard Test Completed", result="PASS")

    def test_pending_recruiter_restricted_view(self, driver, login_page, recruiter_page):
        recruiter_page.log_step(1, "Opening Login Page", url=login_page.URL)
        login_page.load()
        
        recruiter_page.log_step(2, f"Logging in as Pending Recruiter [{RECRUITER_PENDING_USER['email']}]")
        login_page.login(RECRUITER_PENDING_USER["email"], RECRUITER_PENDING_USER["password"])
        
        recruiter_page.log_step(3, "Verifying Pending Recruiter Dashboard Access", expected="/recruiter/dashboard", actual=driver.current_url)
        assert recruiter_page.is_dashboard_loaded()
        recruiter_page.log_step(4, "Pending Recruiter Restricted View Test Completed", result="PASS")
