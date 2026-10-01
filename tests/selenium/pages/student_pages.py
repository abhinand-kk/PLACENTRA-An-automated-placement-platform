from selenium.webdriver.common.by import By
from pages.base_page import BasePage
from config import BASE_URL

class StudentDashboardPage(BasePage):
    """
    Page Object Model for Student Dashboard (/student/dashboard).
    """
    URL = f"{BASE_URL}/student/dashboard"

    # Sidebar Nav Buttons (HTML DOM uses 'class', not React 'className')
    NAV_DASHBOARD = (By.XPATH, "//button[contains(@class, 'nav-item-btn') and contains(., 'Dashboard')]")
    NAV_PROFILE = (By.XPATH, "//button[contains(@class, 'nav-item-btn') and contains(., 'My Profile')]")
    NAV_RESUME = (By.XPATH, "//button[contains(@class, 'nav-item-btn') and contains(., 'My Resume')]")
    NAV_JOBS = (By.XPATH, "//button[contains(@class, 'nav-item-btn') and contains(., 'Jobs & Opportunities')]")
    NAV_APPLICATIONS = (By.XPATH, "//button[contains(@class, 'nav-item-btn') and contains(., 'My Applications')]")
    NAV_NOTIFICATIONS = (By.XPATH, "//button[contains(@class, 'nav-item-btn') and contains(., 'Notifications')]")
    NAV_SETTINGS = (By.XPATH, "//button[contains(@class, 'nav-item-btn') and contains(., 'Settings')]")
    LOGOUT_BTN = (By.CSS_SELECTOR, ".btn-sidebar-logout")

    # Resume Tab Locators
    DOWNLOAD_PDF_BTN = (By.CSS_SELECTOR, ".btn-download-pdf")
    RESUME_SHEET = (By.CSS_SELECTOR, ".a4-resume-sheet")
    COMPLETENESS_VAL = (By.CSS_SELECTOR, ".completion-val")

    def load(self):
        self.navigate_to(self.URL)

    def is_dashboard_loaded(self):
        return self.wait_for_url_contains("/student/dashboard")

    def click_tab(self, tab_name):
        locator_map = {
            "dashboard": self.NAV_DASHBOARD,
            "profile": self.NAV_PROFILE,
            "resume": self.NAV_RESUME,
            "jobs": self.NAV_JOBS,
            "applications": self.NAV_APPLICATIONS,
            "notifications": self.NAV_NOTIFICATIONS,
            "settings": self.NAV_SETTINGS
        }
        if tab_name in locator_map:
            self.click_element(locator_map[tab_name])

    def logout(self):
        if self.is_visible(self.LOGOUT_BTN, timeout=5):
            self.click_element(self.LOGOUT_BTN)
