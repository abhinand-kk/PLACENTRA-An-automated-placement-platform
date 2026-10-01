import pytest
from config import STUDENT_USER, RECRUITER_USER, OFFICER_USER, BASE_URL
from pages.login_page import LoginPage
from pages.student_pages import StudentDashboardPage

class TestAuthentication:
    """
    Authentication Selenium Test Suite.
    Tests login for Student, Recruiter, Placement Officer and negative cases.
    """

    def test_student_login_success(self, driver, login_page):
        login_page.log_step(1, "Opening Login Page", url=login_page.URL)
        login_page.load()
        
        login_page.log_step(2, f"Entering Student Credentials for [{STUDENT_USER['email']}]")
        login_page.login(STUDENT_USER["email"], STUDENT_USER["password"])
        
        login_page.log_step(3, "Verifying Redirect to Student Dashboard", expected="/student/dashboard", actual=driver.current_url)
        assert login_page.wait_for_url_contains("/student/dashboard")
        assert "dashboard" in driver.current_url.lower()
        login_page.log_step(4, "Student Login Assertion Completed", result="PASS")

    def test_recruiter_login_success(self, driver, login_page):
        login_page.log_step(1, "Opening Login Page", url=login_page.URL)
        login_page.load()
        
        login_page.log_step(2, f"Entering Recruiter Credentials for [{RECRUITER_USER['email']}]")
        login_page.login(RECRUITER_USER["email"], RECRUITER_USER["password"])
        
        login_page.log_step(3, "Verifying Redirect to Recruiter Dashboard", expected="/recruiter/dashboard", actual=driver.current_url)
        assert login_page.wait_for_url_contains("/recruiter/dashboard")
        assert "recruiter" in driver.current_url.lower()
        login_page.log_step(4, "Recruiter Login Assertion Completed", result="PASS")

    def test_placement_officer_login_success(self, driver, login_page):
        login_page.log_step(1, "Opening Login Page", url=login_page.URL)
        login_page.load()
        
        login_page.log_step(2, f"Entering Placement Officer Credentials for [{OFFICER_USER['email']}]")
        login_page.login(OFFICER_USER["email"], OFFICER_USER["password"])
        
        login_page.log_step(3, "Verifying Redirect to Placement Officer Dashboard", expected="/placement-officer/dashboard", actual=driver.current_url)
        assert login_page.wait_for_url_contains("/placement-officer/dashboard")
        assert "placement-officer" in driver.current_url.lower()
        login_page.log_step(4, "Officer Login Assertion Completed", result="PASS")

    def test_negative_invalid_password(self, driver, login_page):
        login_page.log_step(1, "Opening Login Page", url=login_page.URL)
        login_page.load()
        
        login_page.log_step(2, f"Submitting Invalid Password for [{STUDENT_USER['email']}]")
        login_page.login(STUDENT_USER["email"], "WrongPassword123!")
        
        error_msg = login_page.get_error_message()
        login_page.log_step(3, "Verifying Error Banner Visibility", expected="Error Banner Present", actual=error_msg)
        assert error_msg is not None
        assert "invalid" in error_msg.lower() or "password" in error_msg.lower()
        login_page.log_step(4, "Negative Password Validation Completed", result="PASS")

    def test_negative_nonexistent_user(self, driver, login_page):
        login_page.log_step(1, "Opening Login Page", url=login_page.URL)
        login_page.load()
        
        login_page.log_step(2, "Submitting Non-Existent Account Credentials")
        login_page.login("nonexistent_candidate999@test.com", "Password@123")
        
        error_msg = login_page.get_error_message()
        login_page.log_step(3, "Verifying Error Banner Visibility", expected="Error Banner Present", actual=error_msg)
        assert error_msg is not None
        login_page.log_step(4, "Negative Non-Existent Account Validation Completed", result="PASS")

    def test_logout_and_protected_route_access(self, driver, login_page, student_page):
        login_page.log_step(1, "Opening Login Page and Logging in as Student")
        login_page.load()
        login_page.login(STUDENT_USER["email"], STUDENT_USER["password"])
        assert student_page.is_dashboard_loaded()

        login_page.log_step(2, "Executing Logout Action")
        student_page.logout()
        
        login_page.log_step(3, "Verifying Redirect after Logout", expected="Redirect to /login or /", actual=driver.current_url)
        assert login_page.wait_for_url_contains("/login") or driver.current_url == f"{BASE_URL}/"

        login_page.log_step(4, "Attempting Direct Access to Protected Student Route while Unauthenticated")
        student_page.load()
        
        login_page.log_step(5, "Verifying Protection Redirect", expected="Redirect to /login or /", actual=driver.current_url)
        assert login_page.wait_for_url_contains("/login") or driver.current_url == f"{BASE_URL}/"
        login_page.log_step(6, "Logout & Protected Route Protection Completed", result="PASS")
