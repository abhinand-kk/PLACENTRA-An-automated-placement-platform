from selenium.webdriver.common.by import By
from pages.base_page import BasePage
from config import BASE_URL

class RecruiterDashboardPage(BasePage):
    """
    Page Object Model for Recruiter Dashboard (/recruiter/dashboard).
    """
    URL = f"{BASE_URL}/recruiter/dashboard"

    # Sidebar Nav Buttons (HTML DOM uses 'class', not React 'className')
    NAV_DASHBOARD = (By.XPATH, "//button[contains(@class, 'nav-item-btn') and contains(., 'Dashboard')]")
    NAV_JOBS = (By.XPATH, "//button[contains(@class, 'nav-item-btn') and contains(., 'Job Postings')]")
    NAV_POST_JOB = (By.XPATH, "//button[contains(@class, 'nav-item-btn') and contains(., 'Post New Job')]")
    NAV_APPLICANTS = (By.XPATH, "//button[contains(@class, 'nav-item-btn') and (contains(., 'Applicants') or contains(., 'Candidates'))]")
    LOGOUT_BTN = (By.CSS_SELECTOR, ".btn-sidebar-logout")

    # Create Job Form Locators
    JOB_TITLE_INPUT = (By.CSS_SELECTOR, "input[placeholder*='Software Engineer']")
    LOCATION_INPUT = (By.CSS_SELECTOR, "input[placeholder*='Bangalore']")
    PACKAGE_INPUT = (By.CSS_SELECTOR, "input[placeholder*='12.5']")
    DESCRIPTION_TEXTAREA = (By.CSS_SELECTOR, "textarea[placeholder*='role']")
    REQUIREMENTS_TEXTAREA = (By.CSS_SELECTOR, "textarea[placeholder*='skills']")
    SUBMIT_JOB_BTN = (By.CSS_SELECTOR, "button[type='submit']")

    def load(self):
        self.navigate_to(self.URL)

    def is_dashboard_loaded(self):
        return self.wait_for_url_contains("/recruiter/dashboard")

    def click_post_job(self):
        if self.is_visible(self.NAV_POST_JOB, timeout=3):
            self.click_element(self.NAV_POST_JOB)

    def logout(self):
        if self.is_visible(self.LOGOUT_BTN, timeout=5):
            self.click_element(self.LOGOUT_BTN)
