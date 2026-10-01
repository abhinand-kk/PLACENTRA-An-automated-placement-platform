import os
import time
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from config import DEFAULT_TIMEOUT, EXPLICIT_WAIT_TIMEOUT

class BasePage:
    """
    Reusable Page Object Model Base Page with explicit waits and structured step stdout logging.
    """
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, EXPLICIT_WAIT_TIMEOUT)

    def log_step(self, step_num, action, url=None, expected=None, actual=None, result=None):
        """Prints formatted step execution information for pytest stdout capture."""
        print(f"\nSTEP {step_num}: {action}")
        if url:
            print(f"URL: {url}")
        if expected is not None:
            print(f"EXPECTED: {expected}")
        if actual is not None:
            print(f"ACTUAL: {actual}")
        if result is not None:
            print(f"RESULT: {result}")

    def navigate_to(self, url):
        print(f"\nSTEP: Opening Page")
        print(f"URL: {url}")
        self.driver.get(url)
        print(f"RESULT: Page loaded. Current URL: {self.driver.current_url}")

    def get_current_url(self):
        return self.driver.current_url

    def get_title(self):
        return self.driver.title

    def find_element(self, by_locator):
        element = self.wait.until(EC.visibility_of_element_located(by_locator))
        return element

    def find_elements(self, by_locator):
        return self.driver.find_elements(*by_locator)

    def click_element(self, by_locator):
        print(f"STEP: Clicking element [{by_locator[1]}]")
        element = self.wait.until(EC.element_to_be_clickable(by_locator))
        element.click()
        print(f"RESULT: Click completed on [{by_locator[1]}]")

    def send_keys(self, by_locator, text, mask=False):
        display_val = "[MASKED]" if mask or "password" in str(by_locator).lower() else text
        print(f"STEP: Entering text into [{by_locator[1]}] -> '{display_val}'")
        element = self.wait.until(EC.visibility_of_element_located(by_locator))
        element.clear()
        element.send_keys(text)
        print(f"RESULT: Input completed for [{by_locator[1]}]")

    def get_text(self, by_locator):
        element = self.wait.until(EC.visibility_of_element_located(by_locator))
        txt = element.text
        print(f"RESULT: Retrieved text from [{by_locator[1]}]: '{txt}'")
        return txt

    def is_visible(self, by_locator, timeout=5):
        try:
            WebDriverWait(self.driver, timeout).until(EC.visibility_of_element_located(by_locator))
            print(f"RESULT: Element [{by_locator[1]}] is visible.")
            return True
        except TimeoutException:
            print(f"RESULT: Element [{by_locator[1]}] not visible within {timeout}s.")
            return False

    def wait_for_url_contains(self, url_snippet, timeout=EXPLICIT_WAIT_TIMEOUT):
        try:
            WebDriverWait(self.driver, timeout).until(EC.url_contains(url_snippet))
            print(f"RESULT: URL contains expected snippet '{url_snippet}'. Current: {self.driver.current_url}")
            return True
        except TimeoutException:
            print(f"RESULT: URL snippet '{url_snippet}' not reached within {timeout}s. Current: {self.driver.current_url}")
            return False

    def take_screenshot(self, name="screenshot"):
        reports_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "reports", "screenshots")
        os.makedirs(reports_dir, exist_ok=True)
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        filepath = os.path.join(reports_dir, f"{name}_{timestamp}.png")
        self.driver.save_screenshot(filepath)
        return filepath
