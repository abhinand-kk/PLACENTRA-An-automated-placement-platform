import pytest
import time
import requests
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from config import STUDENT_USER, BASE_URL
from pages.login_page import LoginPage


class TestForgotPasswordWorkflow:
    """
    Selenium Automated Test Suite for PLACENTRA Forgot Password / Reset Password Workflow.
    """

    def test_forgot_password_modal_opens(self, driver, login_page):
        login_page.log_step(1, "Opening Login Page", url=login_page.URL)
        login_page.load()

        login_page.log_step(2, "Clicking 'Forgot Password?' Link")
        forgot_link = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CLASS_NAME, "login-forgot-link"))
        )
        forgot_link.click()

        login_page.log_step(3, "Verifying Password Reset Modal Card is Visible")
        modal_card = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.CLASS_NAME, "reset-modal-card"))
        )
        assert modal_card.is_displayed()

        modal_title = driver.find_element(By.CLASS_NAME, "reset-title").text
        assert "Forgot Password" in modal_title
        login_page.log_step(4, "Forgot Password Modal Visibility Assertion Completed", result="PASS")

    def test_forgot_password_full_reset_and_login_flow(self, driver, login_page):
        temp_password = "NewResetPass@2026"
        orig_password = STUDENT_USER["password"]
        student_email = STUDENT_USER["email"]

        login_page.log_step(1, "Opening Login Page", url=login_page.URL)
        login_page.load()

        login_page.log_step(2, "Opening Forgot Password Modal")
        forgot_link = WebDriverWait(driver, 10).until(
            EC.element_to_be_clickable((By.CLASS_NAME, "login-forgot-link"))
        )
        forgot_link.click()

        # Step 1: Submit Email
        login_page.log_step(3, f"Submitting Registered Email: [{student_email}]")
        email_input = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.ID, "reset-email"))
        )
        email_input.clear()
        email_input.send_keys(student_email)

        send_otp_btn = driver.find_element(By.CLASS_NAME, "reset-submit-btn")
        send_otp_btn.click()

        # Step 2: Wait for Step 2 OTP Screen & Dev OTP badge
        login_page.log_step(4, "Waiting for Step 2 OTP Screen")
        otp_input = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.ID, "reset-otp"))
        )

        dev_badge = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.CLASS_NAME, "reset-dev-otp-badge"))
        )
        otp_code = dev_badge.text.split(":")[-1].strip()
        login_page.log_step(5, f"Extracted OTP Code from UI Badge: [{otp_code}]")

        otp_input.clear()
        otp_input.send_keys(otp_code)

        verify_btn = driver.find_element(By.CLASS_NAME, "reset-submit-btn")
        verify_btn.click()

        # Step 3: Enter New Password
        login_page.log_step(6, "Waiting for Step 3 New Password Screen")
        new_pass_input = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.ID, "reset-new-password"))
        )
        confirm_pass_input = driver.find_element(By.ID, "reset-confirm-password")

        new_pass_input.clear()
        new_pass_input.send_keys(temp_password)
        confirm_pass_input.clear()
        confirm_pass_input.send_keys(temp_password)

        reset_btn = driver.find_element(By.CLASS_NAME, "reset-submit-btn")
        reset_btn.click()

        # Step 4: Verify Success Screen & Return to Login
        login_page.log_step(7, "Verifying Password Reset Success Screen")
        success_msg = WebDriverWait(driver, 10).until(
            EC.visibility_of_element_located((By.CLASS_NAME, "reset-success-msg"))
        )
        assert "updated successfully" in success_msg.text.lower()

        return_login_btn = driver.find_element(By.CSS_SELECTOR, ".reset-success-box button")
        return_login_btn.click()

        # Step 5: Test Login with newly reset password
        try:
            login_page.log_step(8, f"Authenticating Login with Newly Reset Password for [{student_email}]")
            login_page.login(student_email, temp_password)

            login_page.log_step(9, "Verifying Redirect to Student Dashboard", expected="/student/dashboard", actual=driver.current_url)
            assert login_page.wait_for_url_contains("/student/dashboard")
            assert "dashboard" in driver.current_url.lower()
            login_page.log_step(10, "Login with Reset Password Assertion Passed", result="PASS")
        finally:
            # Cleanup: Always restore original password so database and future test runs remain intact
            try:
                import django, os
                os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'placentra.settings')
                django.setup()
                from accounts.models import User
                u = User.objects.get(email=student_email)
                u.set_password(orig_password)
                u.save()
                login_page.log_step(11, "Restored original student password in DB", result="CLEANUP")
            except Exception as ex:
                print("Cleanup exception:", ex)
