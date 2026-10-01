import json
import os

collection = {
    "info": {
        "_postman_id": "placentra-api-collection-v2",
        "name": "PLACENTRA API Testing",
        "description": "Comprehensive Postman API Test Suite with Exact Single Status Code Assertions.",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    "item": [
        {
            "name": "01 Authentication",
            "item": [
                {
                    "name": "Student Login - Success",
                    "request": {
                        "method": "POST",
                        "header": [{"key": "Content-Type", "value": "application/json"}],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({"email": "abhinandkk2027@mca.ajce.in", "password": "Password@123"})
                        },
                        "url": {"raw": "{{base_url}}/api/v1/auth/login/", "host": ["{{base_url}}"], "path": ["api", "v1", "auth", "login", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });",
                                "var jsonData = pm.response.json();",
                                "pm.test('Response contains access and refresh tokens', function () { pm.expect(jsonData).to.have.property('access'); pm.expect(jsonData).to.have.property('refresh'); });",
                                "pm.test('User role is student', function () { pm.expect(jsonData.role).to.eql('student'); });",
                                "pm.environment.set('student_access_token', jsonData.access);",
                                "pm.environment.set('student_refresh_token', jsonData.refresh);"
                            ]
                        }
                    }]
                },
                {
                    "name": "Approved Recruiter Login - Success",
                    "request": {
                        "method": "POST",
                        "header": [{"key": "Content-Type", "value": "application/json"}],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({"email": "rahul@experion.com", "password": "Password@123"})
                        },
                        "url": {"raw": "{{base_url}}/api/v1/auth/login/", "host": ["{{base_url}}"], "path": ["api", "v1", "auth", "login", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });",
                                "var jsonData = pm.response.json();",
                                "pm.test('User role is recruiter', function () { pm.expect(jsonData.role).to.eql('recruiter'); });",
                                "pm.environment.set('recruiter_access_token', jsonData.access);",
                                "pm.environment.set('recruiter_refresh_token', jsonData.refresh);"
                            ]
                        }
                    }]
                },
                {
                    "name": "Pending Recruiter Login - Success",
                    "request": {
                        "method": "POST",
                        "header": [{"key": "Content-Type", "value": "application/json"}],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({"email": "newcompany@tech.com", "password": "password123"})
                        },
                        "url": {"raw": "{{base_url}}/api/v1/auth/login/", "host": ["{{base_url}}"], "path": ["api", "v1", "auth", "login", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });",
                                "var jsonData = pm.response.json();",
                                "pm.test('User role is recruiter', function () { pm.expect(jsonData.role).to.eql('recruiter'); });",
                                "pm.environment.set('pending_recruiter_access_token', jsonData.access);"
                            ]
                        }
                    }]
                },
                {
                    "name": "Placement Officer Login - Success",
                    "request": {
                        "method": "POST",
                        "header": [{"key": "Content-Type", "value": "application/json"}],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({"email": "abhinav@ajce.in", "password": "Password@123"})
                        },
                        "url": {"raw": "{{base_url}}/api/v1/auth/login/", "host": ["{{base_url}}"], "path": ["api", "v1", "auth", "login", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });",
                                "var jsonData = pm.response.json();",
                                "pm.test('User role is placement_officer', function () { pm.expect(jsonData.role).to.eql('placement_officer'); });",
                                "pm.environment.set('officer_access_token', jsonData.access);",
                                "pm.environment.set('officer_refresh_token', jsonData.refresh);"
                            ]
                        }
                    }]
                },
                {
                    "name": "Login Negative - Invalid Password",
                    "request": {
                        "method": "POST",
                        "header": [{"key": "Content-Type", "value": "application/json"}],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({"email": "abhinandkk2027@mca.ajce.in", "password": "WrongPassword123!"})
                        },
                        "url": {"raw": "{{base_url}}/api/v1/auth/login/", "host": ["{{base_url}}"], "path": ["api", "v1", "auth", "login", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 400 Bad Request', function () { pm.response.to.have.status(400); });",
                                "var jsonData = pm.response.json();",
                                "pm.test('Response contains validation error keys', function () { pm.expect(jsonData).to.be.an('object'); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Login Negative - Nonexistent User",
                    "request": {
                        "method": "POST",
                        "header": [{"key": "Content-Type", "value": "application/json"}],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({"email": "nonexistent_candidate999@test.com", "password": "Password@123"})
                        },
                        "url": {"raw": "{{base_url}}/api/v1/auth/login/", "host": ["{{base_url}}"], "path": ["api", "v1", "auth", "login", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 400 Bad Request', function () { pm.response.to.have.status(400); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Login Negative - Missing Email",
                    "request": {
                        "method": "POST",
                        "header": [{"key": "Content-Type", "value": "application/json"}],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({"password": "Password@123"})
                        },
                        "url": {"raw": "{{base_url}}/api/v1/auth/login/", "host": ["{{base_url}}"], "path": ["api", "v1", "auth", "login", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 400 Bad Request', function () { pm.response.to.have.status(400); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Send OTP - Success",
                    "request": {
                        "method": "POST",
                        "header": [{"key": "Content-Type", "value": "application/json"}],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({"target_type": "email", "contact_value": "unique_fresh_otp_test@mca.ajce.in"})
                        },
                        "url": {"raw": "{{base_url}}/api/v1/auth/otp/send/", "host": ["{{base_url}}"], "path": ["api", "v1", "auth", "otp", "send", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });",
                                "var jsonData = pm.response.json();",
                                "pm.test('OTP sent message returned', function () { pm.expect(jsonData).to.have.property('otp'); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Check Contact Availability",
                    "request": {
                        "method": "POST",
                        "header": [{"key": "Content-Type", "value": "application/json"}],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({"target_type": "email", "contact_value": "new_unique_candidate_999@test.com"})
                        },
                        "url": {"raw": "{{base_url}}/api/v1/auth/otp/check-contact/", "host": ["{{base_url}}"], "path": ["api", "v1", "auth", "otp", "check-contact", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });",
                                "var jsonData = pm.response.json();",
                                "pm.test('Contact is available', function () { pm.expect(jsonData.available).to.be.true; });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Current User - Student Identity",
                    "request": {
                        "method": "GET",
                        "header": [
                            {"key": "Authorization", "value": "Bearer {{student_access_token}}"}
                        ],
                        "url": {"raw": "{{base_url}}/api/v1/auth/me/", "host": ["{{base_url}}"], "path": ["api", "v1", "auth", "me", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });",
                                "var jsonData = pm.response.json();",
                                "pm.test('Role is student', function () { pm.expect(jsonData.role).to.eql('student'); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Current User - Recruiter Identity",
                    "request": {
                        "method": "GET",
                        "header": [
                            {"key": "Authorization", "value": "Bearer {{recruiter_access_token}}"}
                        ],
                        "url": {"raw": "{{base_url}}/api/v1/auth/me/", "host": ["{{base_url}}"], "path": ["api", "v1", "auth", "me", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });",
                                "var jsonData = pm.response.json();",
                                "pm.test('Role is recruiter', function () { pm.expect(jsonData.role).to.eql('recruiter'); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Current User - Placement Officer Identity",
                    "request": {
                        "method": "GET",
                        "header": [
                            {"key": "Authorization", "value": "Bearer {{officer_access_token}}"}
                        ],
                        "url": {"raw": "{{base_url}}/api/v1/auth/me/", "host": ["{{base_url}}"], "path": ["api", "v1", "auth", "me", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });",
                                "var jsonData = pm.response.json();",
                                "pm.test('Role is placement_officer', function () { pm.expect(jsonData.role).to.eql('placement_officer'); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Current User - Unauthenticated",
                    "request": {
                        "method": "GET",
                        "header": [],
                        "url": {"raw": "{{base_url}}/api/v1/auth/me/", "host": ["{{base_url}}"], "path": ["api", "v1", "auth", "me", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 401 Unauthorized', function () { pm.response.to.have.status(401); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Token Refresh - Valid",
                    "request": {
                        "method": "POST",
                        "header": [{"key": "Content-Type", "value": "application/json"}],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({"refresh": "{{student_refresh_token}}"})
                        },
                        "url": {"raw": "{{base_url}}/api/v1/auth/token/refresh/", "host": ["{{base_url}}"], "path": ["api", "v1", "auth", "token", "refresh", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });",
                                "var jsonData = pm.response.json();",
                                "pm.test('New access token returned', function () { pm.expect(jsonData).to.have.property('access'); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Token Refresh - Invalid Token",
                    "request": {
                        "method": "POST",
                        "header": [{"key": "Content-Type", "value": "application/json"}],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({"refresh": "invalid_refresh_token_12345"})
                        },
                        "url": {"raw": "{{base_url}}/api/v1/auth/token/refresh/", "host": ["{{base_url}}"], "path": ["api", "v1", "auth", "token", "refresh", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 401 Unauthorized', function () { pm.response.to.have.status(401); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Logout - Valid Authenticated User",
                    "request": {
                        "method": "POST",
                        "header": [
                            {"key": "Content-Type", "value": "application/json"},
                            {"key": "Authorization", "value": "Bearer {{student_access_token}}"}
                        ],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({"refresh": "{{student_refresh_token}}"})
                        },
                        "url": {"raw": "{{base_url}}/api/v1/auth/logout/", "host": ["{{base_url}}"], "path": ["api", "v1", "auth", "logout", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });"
                            ]
                        }
                    }]
                }
            ]
        },
        {
            "name": "02 Student",
            "item": [
                {
                    "name": "Get Student Profile Details",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{student_access_token}}"}],
                        "url": {"raw": "{{base_url}}/api/v1/students/profile/", "host": ["{{base_url}}"], "path": ["api", "v1", "students", "profile", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });",
                                "var jsonData = pm.response.json();",
                                "pm.test('Profile has register number', function () { pm.expect(jsonData).to.have.property('register_number'); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Get Student Contact Info",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{student_access_token}}"}],
                        "url": {"raw": "{{base_url}}/api/v1/students/contact/", "host": ["{{base_url}}"], "path": ["api", "v1", "students", "contact", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Get Current Education",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{student_access_token}}"}],
                        "url": {"raw": "{{base_url}}/api/v1/students/current-education/", "host": ["{{base_url}}"], "path": ["api", "v1", "students", "current-education", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Get Previous Education List",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{student_access_token}}"}],
                        "url": {"raw": "{{base_url}}/api/v1/students/previous-education/", "host": ["{{base_url}}"], "path": ["api", "v1", "students", "previous-education", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Get Experience List",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{student_access_token}}"}],
                        "url": {"raw": "{{base_url}}/api/v1/students/experience/", "host": ["{{base_url}}"], "path": ["api", "v1", "students", "experience", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Get Profile Completion Score",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{student_access_token}}"}],
                        "url": {"raw": "{{base_url}}/api/v1/students/profile-completion/", "host": ["{{base_url}}"], "path": ["api", "v1", "students", "profile-completion", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });",
                                "var jsonData = pm.response.json();",
                                "pm.test('Score property exists', function () { pm.expect(jsonData).to.have.property('completion_percentage'); });"
                            ]
                        }
                    }]
                }
            ]
        },
        {
            "name": "03 Recruiter",
            "item": [
                {
                    "name": "Get Recruiter Profile",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{recruiter_access_token}}"}],
                        "url": {"raw": "{{base_url}}/api/v1/recruiters/profile/", "host": ["{{base_url}}"], "path": ["api", "v1", "recruiters", "profile", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });",
                                "var jsonData = pm.response.json();",
                                "pm.test('Profile contains company_name', function () { pm.expect(jsonData).to.have.property('company_name'); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Get Hiring Preferences",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{recruiter_access_token}}"}],
                        "url": {"raw": "{{base_url}}/api/v1/recruiters/hiring-preferences/", "host": ["{{base_url}}"], "path": ["api", "v1", "recruiters", "hiring-preferences", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Get Recruiter Dashboard Stats",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{recruiter_access_token}}"}],
                        "url": {"raw": "{{base_url}}/api/v1/recruiters/dashboard/", "host": ["{{base_url}}"], "path": ["api", "v1", "recruiters", "dashboard", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });"
                            ]
                        }
                    }]
                }
            ]
        },
        {
            "name": "04 Placement Officer",
            "item": [
                {
                    "name": "Get Officer Profile",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{officer_access_token}}"}],
                        "url": {"raw": "{{base_url}}/api/v1/placement-officers/profile/", "host": ["{{base_url}}"], "path": ["api", "v1", "placement-officers", "profile", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Get Institution Details",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{officer_access_token}}"}],
                        "url": {"raw": "{{base_url}}/api/v1/placement-officers/institution/", "host": ["{{base_url}}"], "path": ["api", "v1", "placement-officers", "institution", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Get Officer Dashboard Metrics",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{officer_access_token}}"}],
                        "url": {"raw": "{{base_url}}/api/v1/placement-officers/dashboard/", "host": ["{{base_url}}"], "path": ["api", "v1", "placement-officers", "dashboard", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });",
                                "var jsonData = pm.response.json();",
                                "pm.test('Contains total_registered_students', function () { pm.expect(jsonData).to.have.property('total_registered_students'); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Get Student Roster",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{officer_access_token}}"}],
                        "url": {"raw": "{{base_url}}/api/v1/placement-officers/students/", "host": ["{{base_url}}"], "path": ["api", "v1", "placement-officers", "students", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });",
                                "pm.test('Returns array of student records', function () { pm.expect(pm.response.json()).to.be.an('array'); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Get Student Login Activity View",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{officer_access_token}}"}],
                        "url": {"raw": "{{base_url}}/api/v1/placement-officers/students/login-activity/", "host": ["{{base_url}}"], "path": ["api", "v1", "placement-officers", "students", "login-activity", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });",
                                "pm.test('Returns active student login records', function () { pm.expect(pm.response.json()).to.be.an('array'); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Get Recruiter Roster",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{officer_access_token}}"}],
                        "url": {"raw": "{{base_url}}/api/v1/placement-officers/recruiters/", "host": ["{{base_url}}"], "path": ["api", "v1", "placement-officers", "recruiters", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });",
                                "pm.test('Returns array of recruiter records', function () { pm.expect(pm.response.json()).to.be.an('array'); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Get Job Approvals List",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{officer_access_token}}"}],
                        "url": {"raw": "{{base_url}}/api/v1/placement-officers/jobs/", "host": ["{{base_url}}"], "path": ["api", "v1", "placement-officers", "jobs", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });"
                            ]
                        }
                    }]
                }
            ]
        },
        {
            "name": "05 Jobs",
            "item": [
                {
                    "name": "List Open Jobs",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{student_access_token}}"}],
                        "url": {"raw": "{{base_url}}/api/v1/jobs/", "host": ["{{base_url}}"], "path": ["api", "v1", "jobs", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });",
                                "var jsonData = pm.response.json();",
                                "if (Array.isArray(jsonData)) { pm.expect(jsonData).to.be.an('array'); } else { pm.expect(jsonData.results).to.be.an('array'); }"
                            ]
                        }
                    }]
                },
                {
                    "name": "List My Jobs (Recruiter)",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{recruiter_access_token}}"}],
                        "url": {"raw": "{{base_url}}/api/v1/jobs/my-jobs/", "host": ["{{base_url}}"], "path": ["api", "v1", "jobs", "my-jobs", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Get Existing Job Details",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{student_access_token}}"}],
                        "url": {"raw": "{{base_url}}/api/v1/jobs/8/", "host": ["{{base_url}}"], "path": ["api", "v1", "jobs", "8", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });",
                                "var jsonData = pm.response.json();",
                                "pm.test('Job title matches Software Engineer', function () { pm.expect(jsonData.job_title).to.include('Software Engineer'); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Get Invalid Job ID",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{student_access_token}}"}],
                        "url": {"raw": "{{base_url}}/api/v1/jobs/99999/", "host": ["{{base_url}}"], "path": ["api", "v1", "jobs", "99999", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 404 Not Found', function () { pm.response.to.have.status(404); });"
                            ]
                        }
                    }]
                }
            ]
        },
        {
            "name": "06 Applications",
            "item": [
                {
                    "name": "List Student Applications",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{student_access_token}}"}],
                        "url": {"raw": "{{base_url}}/api/v1/applications/my-applications/", "host": ["{{base_url}}"], "path": ["api", "v1", "applications", "my-applications", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Get Student Dashboard Application Metrics",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{student_access_token}}"}],
                        "url": {"raw": "{{base_url}}/api/v1/applications/student-dashboard/", "host": ["{{base_url}}"], "path": ["api", "v1", "applications", "student-dashboard", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });",
                                "var jsonData = pm.response.json();",
                                "pm.test('Contains total_applications property', function () { pm.expect(jsonData).to.have.property('total_applications'); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Get Recruiter Application Metrics",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{recruiter_access_token}}"}],
                        "url": {"raw": "{{base_url}}/api/v1/applications/recruiter-dashboard/", "host": ["{{base_url}}"], "path": ["api", "v1", "applications", "recruiter-dashboard", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Apply Job - Duplicate Application Prevention",
                    "request": {
                        "method": "POST",
                        "header": [
                            {"key": "Content-Type", "value": "application/json"},
                            {"key": "Authorization", "value": "Bearer {{student_access_token}}"}
                        ],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({"job": 8})
                        },
                        "url": {"raw": "{{base_url}}/api/v1/applications/", "host": ["{{base_url}}"], "path": ["api", "v1", "applications", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 400 Bad Request', function () { pm.response.to.have.status(400); });",
                                "var jsonData = pm.response.json();",
                                "pm.test('Error message indicates already applied', function () { pm.expect(jsonData.error).to.include('already applied'); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Apply Job - Nonexistent Job Application Attempt",
                    "request": {
                        "method": "POST",
                        "header": [
                            {"key": "Content-Type", "value": "application/json"},
                            {"key": "Authorization", "value": "Bearer {{student_access_token}}"}
                        ],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({"job": 99999})
                        },
                        "url": {"raw": "{{base_url}}/api/v1/applications/", "host": ["{{base_url}}"], "path": ["api", "v1", "applications", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 404 Not Found', function () { pm.response.to.have.status(404); });"
                            ]
                        }
                    }]
                }
            ]
        },
        {
            "name": "07 Placement Drives",
            "item": [
                {
                    "name": "List Placement Drives",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{student_access_token}}"}],
                        "url": {"raw": "{{base_url}}/api/v1/placement-drives/", "host": ["{{base_url}}"], "path": ["api", "v1", "placement-drives", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Get Student Placement Drives",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{student_access_token}}"}],
                        "url": {"raw": "{{base_url}}/api/v1/placement-drives/student/", "host": ["{{base_url}}"], "path": ["api", "v1", "placement-drives", "student", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Get Placement Drives Calendar",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{student_access_token}}"}],
                        "url": {"raw": "{{base_url}}/api/v1/placement-drives/calendar/", "host": ["{{base_url}}"], "path": ["api", "v1", "placement-drives", "calendar", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Get Placement Drives Dashboard Stats",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{student_access_token}}"}],
                        "url": {"raw": "{{base_url}}/api/v1/placement-drives/dashboard/", "host": ["{{base_url}}"], "path": ["api", "v1", "placement-drives", "dashboard", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });"
                            ]
                        }
                    }]
                }
            ]
        },
        {
            "name": "08 Notifications",
            "item": [
                {
                    "name": "List Notifications",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{student_access_token}}"}],
                        "url": {"raw": "{{base_url}}/api/v1/notifications/", "host": ["{{base_url}}"], "path": ["api", "v1", "notifications", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Get Unread Count",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{student_access_token}}"}],
                        "url": {"raw": "{{base_url}}/api/v1/notifications/unread-count/", "host": ["{{base_url}}"], "path": ["api", "v1", "notifications", "unread-count", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });",
                                "var jsonData = pm.response.json();",
                                "pm.test('Has unread_count property', function () { pm.expect(jsonData).to.have.property('unread_count'); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Mark All Notifications Read",
                    "request": {
                        "method": "PATCH",
                        "header": [{"key": "Authorization", "value": "Bearer {{student_access_token}}"}],
                        "url": {"raw": "{{base_url}}/api/v1/notifications/read-all/", "host": ["{{base_url}}"], "path": ["api", "v1", "notifications", "read-all", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });"
                            ]
                        }
                    }]
                }
            ]
        },
        {
            "name": "09 Documents",
            "item": [
                {
                    "name": "Get Student Documents",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{student_access_token}}"}],
                        "url": {"raw": "{{base_url}}/api/v1/students/documents/", "host": ["{{base_url}}"], "path": ["api", "v1", "students", "documents", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Fetch DigiLocker Mock Data",
                    "request": {
                        "method": "POST",
                        "header": [{"key": "Authorization", "value": "Bearer {{student_access_token}}"}],
                        "url": {"raw": "{{base_url}}/api/v1/students/digilocker/fetch/", "host": ["{{base_url}}"], "path": ["api", "v1", "students", "digilocker", "fetch", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });"
                            ]
                        }
                    }]
                }
            ]
        },
        {
            "name": "10 Resume",
            "item": [
                {
                    "name": "GET Resume Data Endpoint",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{student_access_token}}"}],
                        "url": {"raw": "{{base_url}}/api/v1/students/resume/", "host": ["{{base_url}}"], "path": ["api", "v1", "students", "resume", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });",
                                "var jsonData = pm.response.json();",
                                "pm.test('Resume contains profile object', function () { pm.expect(jsonData).to.have.property('profile'); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "GET Resume Download PDF Stream",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{student_access_token}}"}],
                        "url": {"raw": "{{base_url}}/api/v1/students/resume/download/", "host": ["{{base_url}}"], "path": ["api", "v1", "students", "resume", "download", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });",
                                "pm.test('Content-Type is application/pdf', function () { pm.expect(pm.response.headers.get('Content-Type')).to.include('application/pdf'); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "GET Resume Data - Unauthenticated Access Blocked",
                    "request": {
                        "method": "GET",
                        "header": [],
                        "url": {"raw": "{{base_url}}/api/v1/students/resume/", "host": ["{{base_url}}"], "path": ["api", "v1", "students", "resume", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 401 Unauthorized', function () { pm.response.to.have.status(401); });"
                            ]
                        }
                    }]
                }
            ]
        },
        {
            "name": "11 Approval Workflow",
            "item": [
                {
                    "name": "Pending Recruiter Blocked from Posting Job",
                    "request": {
                        "method": "POST",
                        "header": [
                            {"key": "Content-Type", "value": "application/json"},
                            {"key": "Authorization", "value": "Bearer {{student_access_token}}"}
                        ],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({"job_title": "Unauthorized Job Posting", "location": "Test Loc", "package_lpa": 10.0, "job_description": "Restricted job posting test"})
                        },
                        "url": {"raw": "{{base_url}}/api/v1/jobs/", "host": ["{{base_url}}"], "path": ["api", "v1", "jobs", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 403 Forbidden', function () { pm.response.to.have.status(403); });",
                                "var jsonData = pm.response.json();",
                                "pm.test('Error indicates permission denied', function () { pm.expect(jsonData.message || jsonData.detail || jsonData.error).to.include('permission'); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Officer Recruiter Approval Roster View",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{officer_access_token}}"}],
                        "url": {"raw": "{{base_url}}/api/v1/placement-officers/recruiters/", "host": ["{{base_url}}"], "path": ["api", "v1", "placement-officers", "recruiters", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Officer Job Approval Roster View",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{officer_access_token}}"}],
                        "url": {"raw": "{{base_url}}/api/v1/placement-officers/jobs/", "host": ["{{base_url}}"], "path": ["api", "v1", "placement-officers", "jobs", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });"
                            ]
                        }
                    }]
                }
            ]
        },
        {
            "name": "12 Security and RBAC",
            "item": [
                {
                    "name": "Student Cannot Access Officer Students API",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{student_access_token}}"}],
                        "url": {"raw": "{{base_url}}/api/v1/placement-officers/students/", "host": ["{{base_url}}"], "path": ["api", "v1", "placement-officers", "students", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 403 Forbidden', function () { pm.response.to.have.status(403); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Student Cannot Access Officer Recruiters API",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{student_access_token}}"}],
                        "url": {"raw": "{{base_url}}/api/v1/placement-officers/recruiters/", "host": ["{{base_url}}"], "path": ["api", "v1", "placement-officers", "recruiters", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 403 Forbidden', function () { pm.response.to.have.status(403); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Recruiter Cannot Access Officer Dashboard API",
                    "request": {
                        "method": "GET",
                        "header": [{"key": "Authorization", "value": "Bearer {{recruiter_access_token}}"}],
                        "url": {"raw": "{{base_url}}/api/v1/placement-officers/dashboard/", "host": ["{{base_url}}"], "path": ["api", "v1", "placement-officers", "dashboard", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 404 Not Found', function () { pm.response.to.have.status(404); });",
                                "var jsonData = pm.response.json();",
                                "pm.test('Error indicates officer profile not found', function () { pm.expect(jsonData.error).to.include('profile not found'); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Unauthenticated Access Blocked on Auth Me API",
                    "request": {
                        "method": "GET",
                        "header": [],
                        "url": {"raw": "{{base_url}}/api/v1/auth/me/", "host": ["{{base_url}}"], "path": ["api", "v1", "auth", "me", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 401 Unauthorized', function () { pm.response.to.have.status(401); });"
                            ]
                        }
                    }]
                }
            ]
        },
        {
            "name": "13 Validation",
            "item": [
                {
                    "name": "Register Student - Malformed Email Validation",
                    "request": {
                        "method": "POST",
                        "header": [{"key": "Content-Type", "value": "application/json"}],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({"email": "not_an_email_address", "password": "Password@123"})
                        },
                        "url": {"raw": "{{base_url}}/api/v1/auth/student/register/", "host": ["{{base_url}}"], "path": ["api", "v1", "auth", "student", "register", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 400 Bad Request', function () { pm.response.to.have.status(400); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Job Status Update - Invalid Choice Validation",
                    "request": {
                        "method": "PATCH",
                        "header": [
                            {"key": "Content-Type", "value": "application/json"},
                            {"key": "Authorization", "value": "Bearer {{recruiter_access_token}}"}
                        ],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({"status": "INVALID_JOB_STATUS_CHOICE"})
                        },
                        "url": {"raw": "{{base_url}}/api/v1/jobs/8/status/", "host": ["{{base_url}}"], "path": ["api", "v1", "jobs", "8", "status", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 400 Bad Request', function () { pm.response.to.have.status(400); });",
                                "var jsonData = pm.response.json();",
                                "pm.test('Error indicates invalid status choice', function () { pm.expect(jsonData.error).to.include('Invalid status'); });"
                            ]
                        }
                    }]
                }
            ]
        },
        {
            "name": "14 Regression",
            "item": [
                {
                    "name": "Check OpenAPI Schema Generation",
                    "request": {
                        "method": "GET",
                        "header": [],
                        "url": {"raw": "{{base_url}}/api/schema/", "host": ["{{base_url}}"], "path": ["api", "schema", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Check Swagger UI Interactive Docs",
                    "request": {
                        "method": "GET",
                        "header": [],
                        "url": {"raw": "{{base_url}}/api/docs/", "host": ["{{base_url}}"], "path": ["api", "docs", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });"
                            ]
                        }
                    }]
                },
                {
                    "name": "Check Redoc UI Interactive Docs",
                    "request": {
                        "method": "GET",
                        "header": [],
                        "url": {"raw": "{{base_url}}/api/redoc/", "host": ["{{base_url}}"], "path": ["api", "redoc", ""]}
                    },
                    "event": [{
                        "listen": "test",
                        "script": {
                            "type": "text/javascript",
                            "exec": [
                                "pm.test('Status code is 200 OK', function () { pm.response.to.have.status(200); });"
                            ]
                        }
                    }]
                }
            ]
        }
    ]
}

col_path = os.path.join("tests", "postman", "placentra_api_collection.json")
with open(col_path, "w", encoding="utf-8") as f:
    json.dump(collection, f, indent=2)

print(f"Refined Collection file updated at {col_path}")
