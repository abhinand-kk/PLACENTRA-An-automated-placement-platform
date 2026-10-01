import os
import sys
import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

# Ensure tests/selenium is in PYTHONPATH
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from pages.login_page import LoginPage
from pages.student_pages import StudentDashboardPage
from pages.recruiter_pages import RecruiterDashboardPage
from pages.officer_pages import PlacementOfficerDashboardPage

@pytest.fixture(scope="function")
def driver(request):
    chrome_options = Options()
    headless = os.getenv("HEADLESS", "true").lower() == "true"
    if headless:
        chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--log-level=3")

    try:
        service = Service(ChromeDriverManager().install())
        driver_inst = webdriver.Chrome(service=service, options=chrome_options)
    except Exception as e:
        print(f"Fallback to default Chrome WebDriver launch: {e}")
        driver_inst = webdriver.Chrome(options=chrome_options)

    driver_inst.implicitly_wait(2)
    yield driver_inst

    # Cleanup driver after test
    try:
        driver_inst.quit()
    except Exception:
        pass

def pytest_runtest_setup(item):
    """Print structured test start header for Captured stdout call."""
    print("\n" + "=" * 50)
    print("TEST START")
    print("=" * 50)
    print(f"TEST: {item.name}")

@pytest.hookimpl(tryfirst=True, hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    rep = outcome.get_result()
    
    if rep.when == "call":
        driver = item.funcargs.get("driver")
        current_url = driver.current_url if driver else "N/A"
        
        if rep.passed:
            print(f"\nTEST PASSED: {item.name}")
            print("=" * 50)
        elif rep.failed:
            print(f"\nTEST FAILED: {item.name}")
            print(f"CURRENT URL: {current_url}")
            if call.excinfo:
                print(f"ERROR: {call.excinfo.value}")
            print("=" * 50)
            
            if driver:
                reports_dir = os.path.join(os.path.dirname(__file__), "reports", "screenshots")
                os.makedirs(reports_dir, exist_ok=True)
                test_name = item.name.replace("/", "_").replace("\\", "_")
                screenshot_path = os.path.join(reports_dir, f"FAIL_{test_name}.png")
                try:
                    driver.save_screenshot(screenshot_path)
                    print(f"[FAILURE SCREENSHOT SAVED]: {screenshot_path}")
                except Exception as err:
                    print(f"Failed to capture screenshot: {err}")

    elif rep.when == "setup" and rep.skipped:
        print(f"\nTEST SKIPPED: {item.name}")
        print(f"REASON: {rep.longreprtext}")
        print("=" * 50)

@pytest.fixture
def login_page(driver):
    return LoginPage(driver)

@pytest.fixture
def student_page(driver):
    return StudentDashboardPage(driver)

@pytest.fixture
def recruiter_page(driver):
    return RecruiterDashboardPage(driver)

@pytest.fixture
def officer_page(driver):
    return PlacementOfficerDashboardPage(driver)
