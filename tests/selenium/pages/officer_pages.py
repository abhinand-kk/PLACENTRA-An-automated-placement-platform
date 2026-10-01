from selenium.webdriver.common.by import By
from pages.base_page import BasePage
from config import BASE_URL

class PlacementOfficerDashboardPage(BasePage):
    """
    Page Object Model for Placement Officer Dashboard (/placement-officer/dashboard).
    """
    URL = f"{BASE_URL}/placement-officer/dashboard"

    # Sidebar Nav Buttons (HTML DOM uses 'class', not React 'className')
    NAV_DASHBOARD = (By.XPATH, "//button[contains(@class, 'nav-item-btn') and contains(., 'Dashboard')]")
    NAV_RECRUITERS = (By.XPATH, "//button[contains(@class, 'nav-item-btn') and (contains(., 'Recruiters') or contains(., 'Companies'))]")
    NAV_JOBS = (By.XPATH, "//button[contains(@class, 'nav-item-btn') and contains(., 'Job')]")
    NAV_STUDENTS = (By.XPATH, "//button[contains(@class, 'nav-item-btn') and (contains(., 'Students') or contains(., 'Student Login Activity'))]")
    LOGOUT_BTN = (By.CSS_SELECTOR, ".btn-sidebar-logout")

    def load(self):
        self.navigate_to(self.URL)

    def is_dashboard_loaded(self):
        return self.wait_for_url_contains("/placement-officer/dashboard")

    def click_recruiters_tab(self):
        if self.is_visible(self.NAV_RECRUITERS, timeout=5):
            self.click_element(self.NAV_RECRUITERS)

    def click_jobs_tab(self):
        if self.is_visible(self.NAV_JOBS, timeout=5):
            self.click_element(self.NAV_JOBS)

    def click_students_tab(self):
        if self.is_visible(self.NAV_STUDENTS, timeout=5):
            self.click_element(self.NAV_STUDENTS)

    def logout(self):
        if self.is_visible(self.LOGOUT_BTN, timeout=5):
            self.click_element(self.LOGOUT_BTN)
