import pytest
from config import STUDENT_USER, BASE_URL
from pages.login_page import LoginPage
from pages.student_pages import StudentDashboardPage

class TestStudentWorkflow:
    """
    Student Workflow Selenium Test Suite.
    Tests Student Dashboard, Navigation Tabs, Resume Page, and Profile views.
    """

    @pytest.fixture(autouse=True)
    def setup_student_session(self, driver, login_page, student_page):
        student_page.log_step(1, "Authenticating Student Session", url=login_page.URL)
        login_page.load()
        login_page.login(STUDENT_USER["email"], STUDENT_USER["password"])
        assert student_page.is_dashboard_loaded()
        student_page.log_step(2, "Student Session Authenticated", result="PASS")

    def test_student_dashboard_loaded(self, driver, student_page):
        student_page.log_step(1, "Verifying Student Dashboard Loaded State", expected="/student/dashboard", actual=driver.current_url)
        assert student_page.is_dashboard_loaded()
        assert "dashboard" in driver.current_url.lower()
        student_page.log_step(2, "Student Dashboard Verified", result="PASS")

    def test_student_navigation_tabs(self, driver, student_page):
        # 1. Profile Tab
        student_page.log_step(1, "Navigating to 'My Profile' Tab")
        student_page.click_tab("profile")
        assert student_page.is_dashboard_loaded()

        # 2. Resume Tab
        student_page.log_step(2, "Navigating to 'My Resume' Tab")
        student_page.click_tab("resume")
        assert student_page.is_visible(student_page.RESUME_SHEET, timeout=5)
        assert student_page.is_visible(student_page.DOWNLOAD_PDF_BTN, timeout=5)

        # 3. Jobs Tab
        student_page.log_step(3, "Navigating to 'Jobs & Opportunities' Tab")
        student_page.click_tab("jobs")
        assert student_page.is_dashboard_loaded()

        # 4. Applications Tab
        student_page.log_step(4, "Navigating to 'My Applications' Tab")
        student_page.click_tab("applications")
        assert student_page.is_dashboard_loaded()

        # 5. Notifications Tab
        student_page.log_step(5, "Navigating to 'Notifications' Tab")
        student_page.click_tab("notifications")
        assert student_page.is_dashboard_loaded()

        # 6. Settings Tab
        student_page.log_step(6, "Navigating to 'Settings' Tab")
        student_page.click_tab("settings")
        assert student_page.is_dashboard_loaded()
        student_page.log_step(7, "Student Navigation Tabs Audit Completed", result="PASS")

    def test_student_resume_direct_route(self, driver, student_page):
        target_url = f"{BASE_URL}/student/resume"
        student_page.log_step(1, "Navigating Directly to Student Resume URL", url=target_url)
        student_page.navigate_to(target_url)
        
        student_page.log_step(2, "Verifying Live Resume Sheet and PDF Download Button Visibility")
        assert student_page.is_visible(student_page.RESUME_SHEET, timeout=5)
        assert student_page.is_visible(student_page.DOWNLOAD_PDF_BTN, timeout=5)
        student_page.log_step(3, "Direct Student Resume Route Audit Completed", result="PASS")
