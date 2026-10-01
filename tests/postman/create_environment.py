import json
import os

os.makedirs(os.path.join("tests", "postman"), exist_ok=True)
os.makedirs(os.path.join("tests", "postman", "reports"), exist_ok=True)

environment_data = {
    "id": "placentra-local-environment-001",
    "name": "PLACENTRA Local Environment",
    "values": [
        {"key": "base_url", "value": "http://127.0.0.1:8000", "type": "default", "enabled": True},
        {"key": "student_access_token", "value": "", "type": "secret", "enabled": True},
        {"key": "student_refresh_token", "value": "", "type": "secret", "enabled": True},
        {"key": "recruiter_access_token", "value": "", "type": "secret", "enabled": True},
        {"key": "recruiter_refresh_token", "value": "", "type": "secret", "enabled": True},
        {"key": "pending_recruiter_access_token", "value": "", "type": "secret", "enabled": True},
        {"key": "officer_access_token", "value": "", "type": "secret", "enabled": True},
        {"key": "officer_refresh_token", "value": "", "type": "secret", "enabled": True},
        {"key": "job_id", "value": "1", "type": "default", "enabled": True}
    ],
    "_postman_variable_scope": "environment"
}

env_path = os.path.join("tests", "postman", "placentra_local_environment.json")
with open(env_path, "w", encoding="utf-8") as f:
    json.dump(environment_data, f, indent=2)

print(f"Environment file written to {env_path}")
