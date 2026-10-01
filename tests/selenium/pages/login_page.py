from selenium.webdriver.common.by import By
from pages.base_page import BasePage
from config import BASE_URL

class LoginPage(BasePage):
    """
    Page Object Model for PLACENTRA Login Page (/login).
    """
    URL = f"{BASE_URL}/login"

    # Locators
    EMAIL_INPUT = (By.ID, "login-email")
    PASSWORD_INPUT = (By.ID, "login-password")
    SUBMIT_BUTTON = (By.CSS_SELECTOR, "button[type='submit'].login-submit-btn")
    ERROR_BANNER = (By.CSS_SELECTOR, ".login-error-banner")
    STUDENT_REG_BTN = (By.CSS_SELECTOR, ".login-reg-btn-student")
    RECRUITER_REG_BTN = (By.CSS_SELECTOR, ".login-reg-btn-recruiter")
    OFFICER_REG_BTN = (By.CSS_SELECTOR, ".login-reg-btn-officer")
    BACK_TO_HOME_LINK = (By.CSS_SELECTOR, ".login-back-home-btn")

    def load(self):
        self.navigate_to(self.URL)

    def login(self, email, password):
        self.send_keys(self.EMAIL_INPUT, email)
        self.send_keys(self.PASSWORD_INPUT, password)
        self.click_element(self.SUBMIT_BUTTON)

    def get_error_message(self):
        if self.is_visible(self.ERROR_BANNER, timeout=3):
            return self.get_text(self.ERROR_BANNER)
        return None

    def click_student_register(self):
        self.click_element(self.STUDENT_REG_BTN)

    def click_recruiter_register(self):
        self.click_element(self.RECRUITER_REG_BTN)

    def click_officer_register(self):
        self.click_element(self.OFFICER_REG_BTN)
