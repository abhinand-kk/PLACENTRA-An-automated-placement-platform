import os

# PLACENTRA Selenium Test Configuration
BASE_URL = os.getenv("PLACENTRA_FRONTEND_URL", "http://localhost:5173")
BACKEND_URL = os.getenv("PLACENTRA_BACKEND_URL", "http://127.0.0.1:8000")

DEFAULT_TIMEOUT = 10
EXPLICIT_WAIT_TIMEOUT = 12

# Test Credentials (Masked/Secure test environment defaults)
STUDENT_USER = {
    "email": "abhinandkk2027@mca.ajce.in",
    "password": "Password@123",
    "name": "Abhinand K K"
}

RECRUITER_USER = {
    "email": "rahul@experion.com",
    "password": "Password@123",
    "company": "Experion"
}

RECRUITER_PENDING_USER = {
    "email": "newcompany@tech.com",
    "password": "password123",
    "company": "Tech Innovators Pvt Ltd"
}

OFFICER_USER = {
    "email": "abhinav@ajce.in",
    "password": "Password@123",
    "institution": "Amal Jyothi college of engineering"
}
