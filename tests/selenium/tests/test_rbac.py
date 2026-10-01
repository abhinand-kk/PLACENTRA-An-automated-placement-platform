import pytest
from selenium.webdriver.support.ui import WebDriverWait
from config import STUDENT_USER, RECRUITER_USER, OFFICER_USER, BASE_URL
from pages.login_page import LoginPage
from pages.student_pages import StudentDashboardPage
from pages.recruiter_pages import RecruiterDashboardPage
from pages.officer_pages import PlacementOfficerDashboardPage

class TestRBACSecurityUI:
    """
    Role-Based Access Control (RBAC) & Security UI Selenium Test Suite.
    Tests role isolation and direct route protection in browser.
    """

    def test_student_cannot_access_recruiter_dashboard(self, driver, login_page, student_page, recruiter_page):
        student_page.log_step(1, "Logging in as Student User", url=login_page.URL)
        login_page.load()
        login_page.login(STUDENT_USER["email"], STUDENT_USER["password"])
        assert student_page.is_dashboard_loaded()

        student_page.log_step(2, "Attempting Direct Navigation to Recruiter Dashboard Route", url=recruiter_page.URL)
        recruiter_page.load()

        student_page.log_step(3, "Verifying RBAC Protection Redirects Student Away from Recruiter Route")
        WebDriverWait(driver, 5).until(lambda d: "recruiter/dashboard" not in d.current_url)
        assert "recruiter/dashboard" not in driver.current_url.lower()
        student_page.log_step(4, "RBAC Recruiter Route Access Blocked", expected="recruiter/dashboard blocked", actual=driver.current_url, result="PASS")

    def test_student_cannot_access_officer_dashboard(self, driver, login_page, student_page, officer_page):
        student_page.log_step(1, "Logging in as Student User", url=login_page.URL)
        login_page.load()
        login_page.login(STUDENT_USER["email"], STUDENT_USER["password"])
        assert student_page.is_dashboard_loaded()

        student_page.log_step(2, "Attempting Direct Navigation to Placement Officer Dashboard Route", url=officer_page.URL)
        officer_page.load()

        student_page.log_step(3, "Verifying RBAC Protection Redirects Student Away from Officer Route")
        WebDriverWait(driver, 5).until(lambda d: "placement-officer/dashboard" not in d.current_url)
        assert "placement-officer/dashboard" not in driver.current_url.lower()
        student_page.log_step(4, "RBAC Officer Route Access Blocked", expected="placement-officer/dashboard blocked", actual=driver.current_url, result="PASS")

    def test_recruiter_cannot_access_student_dashboard(self, driver, login_page, recruiter_page, student_page):
        recruiter_page.log_step(1, "Logging in as Recruiter User", url=login_page.URL)
        login_page.load()
        login_page.login(RECRUITER_USER["email"], RECRUITER_USER["password"])
        assert recruiter_page.is_dashboard_loaded()

        recruiter_page.log_step(2, "Attempting Direct Navigation to Student Dashboard Route", url=student_page.URL)
        student_page.load()

        recruiter_page.log_step(3, "Verifying RBAC Protection Redirects Recruiter Away from Student Route")
        WebDriverWait(driver, 5).until(lambda d: "student/dashboard" not in d.current_url)
        assert "student/dashboard" not in driver.current_url.lower()
        recruiter_page.log_step(4, "RBAC Student Route Access Blocked", expected="student/dashboard blocked", actual=driver.current_url, result="PASS")
