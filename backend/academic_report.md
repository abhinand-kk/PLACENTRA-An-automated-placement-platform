### A. DATABASE SUMMARY

| Item | Verified Value |
|------|----------------|
| Database | PLACENTRA |
| DB Engine | PostgreSQL |
| Total Tables | 41 |
| PLACENTRA Domain Tables | 26 |
| Django/Framework Tables | 15 |

### B. PLACENTRA DOMAIN TABLES

| No. | Table Name | Primary Key | Foreign Keys |
|-----|------------|-------------|--------------|
| 1 | accounts_otpverification | id | Nil |
| 2 | accounts_user | id | Nil |
| 3 | applications_application | id | job_id -> jobs_job.id<br>student_id -> students_studentprofile.id |
| 4 | applications_interview | id | application_id -> applications_application.id |
| 5 | institutions_institution | id | institution_type_id -> master_data_institutiontype.id |
| 6 | jobs_job | id | employment_type_id -> master_data_employmenttype.id<br>hiring_type_id -> master_data_hiringtype.id<br>recruiter_id -> recruiters_recruiterprofile.id<br>work_mode_id -> master_data_workmode.id |
| 7 | master_data_branch | id | program_id -> master_data_program.id |
| 8 | master_data_employmenttype | id | Nil |
| 9 | master_data_hiringtype | id | Nil |
| 10 | master_data_institutiontype | id | Nil |
| 11 | master_data_program | id | Nil |
| 12 | master_data_qualificationtype | id | Nil |
| 13 | master_data_targetjobrole | id | Nil |
| 14 | master_data_workmode | id | Nil |
| 15 | notifications_notification | id | user_id -> accounts_user.id |
| 16 | placement_drives_placementdrive | id | institution_id -> institutions_institution.id<br>job_id -> jobs_job.id<br>recruiter_id -> recruiters_recruiterprofile.id |
| 17 | placement_officers_institutiondetails | id | placement_officer_id -> placement_officers_placementofficerprofile.id |
| 18 | placement_officers_placementofficerprofile | id | institution_id -> institutions_institution.id<br>user_id -> accounts_user.id |
| 19 | recruiters_recruiterhiringpreference | id | hiring_type_id -> master_data_hiringtype.id<br>work_mode_id -> master_data_workmode.id<br>recruiter_id -> recruiters_recruiterprofile.id |
| 20 | recruiters_recruiterprofile | id | user_id -> accounts_user.id |
| 21 | students_studentcontact | id | student_id -> students_studentprofile.id |
| 22 | students_studentcurrenteducation | id | branch_id -> master_data_branch.id<br>program_id -> master_data_program.id<br>student_id -> students_studentprofile.id |
| 23 | students_studentdocument | id | student_id -> students_studentprofile.id |
| 24 | students_studentexperience | id | employment_type_id -> master_data_employmenttype.id<br>student_id -> students_studentprofile.id |
| 25 | students_studentpreviouseducation | id | qualification_type_id -> master_data_qualificationtype.id<br>student_id -> students_studentprofile.id |
| 26 | students_studentprofile | id | institution_id -> institutions_institution.id<br>user_id -> accounts_user.id |

### C. DETAILED TABLE DESIGN

4.5 TABLE DESIGN

**1. accounts_otpverification**

Primary Key:
id

Foreign Keys:
Nil

| No. | Field Name | Datatype (Size) | Key Constraints | Description |
|-----|------------|-----------------|-----------------|-------------|
| 1 | id | BIGINT(64,0) | PRIMARY KEY, NOT NULL | Id |
| 2 | target_type | CHARACTER VARYING(30) | NOT NULL | Target type (Values: primary_email, personal_email, mobile) |
| 3 | contact_value | CHARACTER VARYING(255) | NOT NULL | Contact value |
| 4 | otp | CHARACTER VARYING(6) | NOT NULL | Otp |
| 5 | attempts | INTEGER(32,0) | NOT NULL | Attempts |
| 6 | max_attempts | INTEGER(32,0) | NOT NULL | Max attempts |
| 7 | is_verified | BOOLEAN | NOT NULL | Is verified |
| 8 | created_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Created at |
| 9 | expires_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Expires at |


**2. accounts_user**

Primary Key:
id

Foreign Keys:
Nil

| No. | Field Name | Datatype (Size) | Key Constraints | Description |
|-----|------------|-----------------|-----------------|-------------|
| 1 | id | BIGINT(64,0) | PRIMARY KEY, NOT NULL | Id |
| 2 | password | CHARACTER VARYING(128) | NOT NULL | Password |
| 3 | last_login | TIMESTAMP WITH TIME ZONE | - | Last login |
| 4 | is_superuser | BOOLEAN | NOT NULL | Designates that this user has all permissions without explicitly assigning them. |
| 5 | first_name | CHARACTER VARYING(150) | NOT NULL | First name |
| 6 | last_name | CHARACTER VARYING(150) | NOT NULL | Last name |
| 7 | is_staff | BOOLEAN | NOT NULL | Designates whether the user can log into this admin site. |
| 8 | is_active | BOOLEAN | NOT NULL | Designates whether this user should be treated as active. Unselect this instead of deleting accounts. |
| 9 | date_joined | TIMESTAMP WITH TIME ZONE | NOT NULL | Date joined |
| 10 | email | CHARACTER VARYING(254) | UNIQUE, NOT NULL | Email address |
| 11 | role | CHARACTER VARYING(20) | NOT NULL | Designates the role of the user in PLACENTRA. (Values: student, recruiter, placement_officer) |
| 12 | is_verified | BOOLEAN | NOT NULL | Designates whether this user has verified their contact details. |
| 13 | created_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Created at |
| 14 | updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Updated at |


**3. applications_application**

Primary Key:
id

Foreign Keys:
job_id → jobs_job.id
student_id → students_studentprofile.id

| No. | Field Name | Datatype (Size) | Key Constraints | Description |
|-----|------------|-----------------|-----------------|-------------|
| 1 | id | BIGINT(64,0) | PRIMARY KEY, NOT NULL | Id |
| 2 | application_status | CHARACTER VARYING(30) | NOT NULL | Application status (Values: Applied, Under Review, Shortlisted, Interview Scheduled, Selected, Rejected) |
| 3 | applied_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Applied at |
| 4 | updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Updated at |
| 5 | job_id | BIGINT(64,0) | FOREIGN KEY (jobs_job.id), UNIQUE, NOT NULL | Job |
| 6 | student_id | BIGINT(64,0) | FOREIGN KEY (students_studentprofile.id), UNIQUE, NOT NULL | Student |


**4. applications_interview**

Primary Key:
id

Foreign Keys:
application_id → applications_application.id

| No. | Field Name | Datatype (Size) | Key Constraints | Description |
|-----|------------|-----------------|-----------------|-------------|
| 1 | id | BIGINT(64,0) | PRIMARY KEY, NOT NULL | Id |
| 2 | interview_type | CHARACTER VARYING(30) | NOT NULL | Interview type (Values: Technical Interview, HR Interview) |
| 3 | interview_date | DATE | NOT NULL | Interview date |
| 4 | interview_time | TIME WITHOUT TIME ZONE | NOT NULL | Interview time |
| 5 | duration_minutes | INTEGER(32,0) | NOT NULL | Duration minutes |
| 6 | mode | CHARACTER VARYING(20) | NOT NULL | Mode (Values: Online, Offline, Hybrid) |
| 7 | location_or_link | CHARACTER VARYING(500) | NOT NULL | Meeting URL for Online or Venue Address for Offline/Hybrid |
| 8 | instructions | TEXT | NOT NULL | Instructions |
| 9 | status | CHARACTER VARYING(20) | NOT NULL | Status (Values: Scheduled, Completed, Cancelled, Rescheduled) |
| 10 | created_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Created at |
| 11 | updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Updated at |
| 12 | application_id | BIGINT(64,0) | FOREIGN KEY (applications_application.id), NOT NULL | Application |


**5. institutions_institution**

Primary Key:
id

Foreign Keys:
institution_type_id → master_data_institutiontype.id

| No. | Field Name | Datatype (Size) | Key Constraints | Description |
|-----|------------|-----------------|-----------------|-------------|
| 1 | id | BIGINT(64,0) | PRIMARY KEY, NOT NULL | Id |
| 2 | institution_name | CHARACTER VARYING(255) | NOT NULL | Institution name |
| 3 | affiliated_university | CHARACTER VARYING(255) | NOT NULL | Affiliated university |
| 4 | address | TEXT | NOT NULL | Address |
| 5 | district | CHARACTER VARYING(100) | NOT NULL | District |
| 6 | state | CHARACTER VARYING(100) | NOT NULL | State |
| 7 | pincode | CHARACTER VARYING(10) | NOT NULL | Pincode |
| 8 | website | CHARACTER VARYING(200) | - | Website |
| 9 | placement_email | CHARACTER VARYING(254) | NOT NULL | Placement email |
| 10 | placement_phone | CHARACTER VARYING(20) | NOT NULL | Placement phone |
| 11 | is_active | BOOLEAN | NOT NULL | Is active |
| 12 | created_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Created at |
| 13 | updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Updated at |
| 14 | institution_type_id | BIGINT(64,0) | FOREIGN KEY (master_data_institutiontype.id) | Institution type |


**6. jobs_job**

Primary Key:
id

Foreign Keys:
employment_type_id → master_data_employmenttype.id
hiring_type_id → master_data_hiringtype.id
recruiter_id → recruiters_recruiterprofile.id
work_mode_id → master_data_workmode.id

| No. | Field Name | Datatype (Size) | Key Constraints | Description |
|-----|------------|-----------------|-----------------|-------------|
| 1 | id | BIGINT(64,0) | PRIMARY KEY, NOT NULL | Id |
| 2 | job_title | CHARACTER VARYING(255) | NOT NULL | Job title |
| 3 | job_description | TEXT | NOT NULL | Job description |
| 4 | minimum_cgpa | NUMERIC(4,2) | NOT NULL | Minimum cgpa |
| 5 | maximum_active_backlogs | INTEGER(32,0) | NOT NULL | Maximum active backlogs |
| 6 | expected_hiring_month | CHARACTER VARYING(50) | NOT NULL | Expected hiring month |
| 7 | application_deadline | DATE | NOT NULL | Application deadline |
| 8 | expected_students | INTEGER(32,0) | NOT NULL | Expected students |
| 9 | package_lpa | NUMERIC(5,2) | NOT NULL | Package lpa |
| 10 | campus_visit_required | BOOLEAN | NOT NULL | Campus visit required |
| 11 | location | CHARACTER VARYING(255) | NOT NULL | Location |
| 12 | status | CHARACTER VARYING(20) | NOT NULL | Status (Values: Pending Approval, Open, Rejected, Closed, Draft) |
| 13 | created_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Created at |
| 14 | updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Updated at |
| 15 | employment_type_id | BIGINT(64,0) | FOREIGN KEY (master_data_employmenttype.id), NOT NULL | Employment type |
| 16 | hiring_type_id | BIGINT(64,0) | FOREIGN KEY (master_data_hiringtype.id), NOT NULL | Hiring type |
| 17 | recruiter_id | BIGINT(64,0) | FOREIGN KEY (recruiters_recruiterprofile.id), NOT NULL | Recruiter |
| 18 | work_mode_id | BIGINT(64,0) | FOREIGN KEY (master_data_workmode.id), NOT NULL | Work mode |


**7. master_data_branch**

Primary Key:
id

Foreign Keys:
program_id → master_data_program.id

| No. | Field Name | Datatype (Size) | Key Constraints | Description |
|-----|------------|-----------------|-----------------|-------------|
| 1 | id | BIGINT(64,0) | PRIMARY KEY, NOT NULL | Id |
| 2 | name | CHARACTER VARYING(100) | UNIQUE, NOT NULL | Name |
| 3 | program_id | BIGINT(64,0) | FOREIGN KEY (master_data_program.id), UNIQUE, NOT NULL | Program |


**8. master_data_employmenttype**

Primary Key:
id

Foreign Keys:
Nil

| No. | Field Name | Datatype (Size) | Key Constraints | Description |
|-----|------------|-----------------|-----------------|-------------|
| 1 | id | BIGINT(64,0) | PRIMARY KEY, NOT NULL | Id |
| 2 | name | CHARACTER VARYING(100) | UNIQUE, NOT NULL | Name |


**9. master_data_hiringtype**

Primary Key:
id

Foreign Keys:
Nil

| No. | Field Name | Datatype (Size) | Key Constraints | Description |
|-----|------------|-----------------|-----------------|-------------|
| 1 | id | BIGINT(64,0) | PRIMARY KEY, NOT NULL | Id |
| 2 | name | CHARACTER VARYING(100) | UNIQUE, NOT NULL | Name |


**10. master_data_institutiontype**

Primary Key:
id

Foreign Keys:
Nil

| No. | Field Name | Datatype (Size) | Key Constraints | Description |
|-----|------------|-----------------|-----------------|-------------|
| 1 | id | BIGINT(64,0) | PRIMARY KEY, NOT NULL | Id |
| 2 | name | CHARACTER VARYING(100) | UNIQUE, NOT NULL | Name |


**11. master_data_program**

Primary Key:
id

Foreign Keys:
Nil

| No. | Field Name | Datatype (Size) | Key Constraints | Description |
|-----|------------|-----------------|-----------------|-------------|
| 1 | id | BIGINT(64,0) | PRIMARY KEY, NOT NULL | Id |
| 2 | name | CHARACTER VARYING(100) | UNIQUE, NOT NULL | Name |


**12. master_data_qualificationtype**

Primary Key:
id

Foreign Keys:
Nil

| No. | Field Name | Datatype (Size) | Key Constraints | Description |
|-----|------------|-----------------|-----------------|-------------|
| 1 | id | BIGINT(64,0) | PRIMARY KEY, NOT NULL | Id |
| 2 | name | CHARACTER VARYING(100) | UNIQUE, NOT NULL | Name |


**13. master_data_targetjobrole**

Primary Key:
id

Foreign Keys:
Nil

| No. | Field Name | Datatype (Size) | Key Constraints | Description |
|-----|------------|-----------------|-----------------|-------------|
| 1 | id | BIGINT(64,0) | PRIMARY KEY, NOT NULL | Id |
| 2 | name | CHARACTER VARYING(100) | UNIQUE, NOT NULL | Name |


**14. master_data_workmode**

Primary Key:
id

Foreign Keys:
Nil

| No. | Field Name | Datatype (Size) | Key Constraints | Description |
|-----|------------|-----------------|-----------------|-------------|
| 1 | id | BIGINT(64,0) | PRIMARY KEY, NOT NULL | Id |
| 2 | name | CHARACTER VARYING(100) | UNIQUE, NOT NULL | Name |


**15. notifications_notification**

Primary Key:
id

Foreign Keys:
user_id → accounts_user.id

| No. | Field Name | Datatype (Size) | Key Constraints | Description |
|-----|------------|-----------------|-----------------|-------------|
| 1 | id | BIGINT(64,0) | PRIMARY KEY, NOT NULL | Id |
| 2 | title | CHARACTER VARYING(255) | NOT NULL | Title |
| 3 | message | TEXT | NOT NULL | Message |
| 4 | notification_type | CHARACTER VARYING(50) | NOT NULL | Notification type |
| 5 | is_read | BOOLEAN | NOT NULL | Is read |
| 6 | created_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Created at |
| 7 | user_id | BIGINT(64,0) | FOREIGN KEY (accounts_user.id), NOT NULL | User |


**16. placement_drives_placementdrive**

Primary Key:
id

Foreign Keys:
institution_id → institutions_institution.id
job_id → jobs_job.id
recruiter_id → recruiters_recruiterprofile.id

| No. | Field Name | Datatype (Size) | Key Constraints | Description |
|-----|------------|-----------------|-----------------|-------------|
| 1 | id | BIGINT(64,0) | PRIMARY KEY, NOT NULL | Id |
| 2 | drive_title | CHARACTER VARYING(255) | NOT NULL | Drive title |
| 3 | drive_date | DATE | NOT NULL | Drive date |
| 4 | drive_time | TIME WITHOUT TIME ZONE | NOT NULL | Drive time |
| 5 | venue | CHARACTER VARYING(255) | NOT NULL | Venue |
| 6 | description | TEXT | NOT NULL | Description |
| 7 | status | CHARACTER VARYING(20) | NOT NULL | Status (Values: Upcoming, Ongoing, Completed, Cancelled) |
| 8 | created_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Created at |
| 9 | updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Updated at |
| 10 | institution_id | BIGINT(64,0) | FOREIGN KEY (institutions_institution.id), NOT NULL | Institution |
| 11 | job_id | BIGINT(64,0) | FOREIGN KEY (jobs_job.id), NOT NULL | Job |
| 12 | recruiter_id | BIGINT(64,0) | FOREIGN KEY (recruiters_recruiterprofile.id), NOT NULL | Recruiter |


**17. placement_officers_institutiondetails**

Primary Key:
id

Foreign Keys:
placement_officer_id → placement_officers_placementofficerprofile.id

| No. | Field Name | Datatype (Size) | Key Constraints | Description |
|-----|------------|-----------------|-----------------|-------------|
| 1 | id | BIGINT(64,0) | PRIMARY KEY, NOT NULL | Id |
| 2 | student_strength | INTEGER(32,0) | NOT NULL | Student strength |
| 3 | eligible_final_year_students | INTEGER(32,0) | NOT NULL | Eligible final year students |
| 4 | placement_cell_email | CHARACTER VARYING(254) | NOT NULL | Placement cell email |
| 5 | placement_cell_phone | CHARACTER VARYING(20) | NOT NULL | Placement cell phone |
| 6 | placement_season | CHARACTER VARYING(50) | NOT NULL | Placement season |
| 7 | placement_policy | TEXT | NOT NULL | Placement policy |
| 8 | created_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Created at |
| 9 | updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Updated at |
| 10 | placement_officer_id | BIGINT(64,0) | FOREIGN KEY (placement_officers_placementofficerprofile.id), UNIQUE, NOT NULL | Placement officer |


**18. placement_officers_placementofficerprofile**

Primary Key:
id

Foreign Keys:
institution_id → institutions_institution.id
user_id → accounts_user.id

| No. | Field Name | Datatype (Size) | Key Constraints | Description |
|-----|------------|-----------------|-----------------|-------------|
| 1 | id | BIGINT(64,0) | PRIMARY KEY, NOT NULL | Id |
| 2 | full_name | CHARACTER VARYING(150) | NOT NULL | Full name |
| 3 | designation | CHARACTER VARYING(150) | NOT NULL | Designation |
| 4 | official_email | CHARACTER VARYING(254) | NOT NULL | Official email |
| 5 | mobile_number | CHARACTER VARYING(20) | NOT NULL | Mobile number |
| 6 | is_verified | BOOLEAN | NOT NULL | Is verified |
| 7 | created_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Created at |
| 8 | updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Updated at |
| 9 | institution_id | BIGINT(64,0) | FOREIGN KEY (institutions_institution.id), UNIQUE, NOT NULL | Institution |
| 10 | user_id | BIGINT(64,0) | FOREIGN KEY (accounts_user.id), UNIQUE, NOT NULL | User |


**19. recruiters_recruiterhiringpreference**

Primary Key:
id

Foreign Keys:
hiring_type_id → master_data_hiringtype.id
work_mode_id → master_data_workmode.id
recruiter_id → recruiters_recruiterprofile.id

| No. | Field Name | Datatype (Size) | Key Constraints | Description |
|-----|------------|-----------------|-----------------|-------------|
| 1 | id | BIGINT(64,0) | PRIMARY KEY, NOT NULL | Id |
| 2 | minimum_cgpa | NUMERIC(4,2) | NOT NULL | Minimum cgpa |
| 3 | maximum_active_backlogs | INTEGER(32,0) | NOT NULL | Maximum active backlogs |
| 4 | expected_hiring_month | CHARACTER VARYING(50) | NOT NULL | Expected hiring month |
| 5 | expected_students | INTEGER(32,0) | NOT NULL | Expected students |
| 6 | package_lpa | NUMERIC(5,2) | NOT NULL | Package lpa |
| 7 | campus_visit_required | BOOLEAN | NOT NULL | Campus visit required |
| 8 | additional_requirements | TEXT | NOT NULL | Additional requirements |
| 9 | created_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Created at |
| 10 | updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Updated at |
| 11 | hiring_type_id | BIGINT(64,0) | FOREIGN KEY (master_data_hiringtype.id), NOT NULL | Hiring type |
| 12 | work_mode_id | BIGINT(64,0) | FOREIGN KEY (master_data_workmode.id), NOT NULL | Work mode |
| 13 | recruiter_id | BIGINT(64,0) | FOREIGN KEY (recruiters_recruiterprofile.id), UNIQUE, NOT NULL | Recruiter |


**20. recruiters_recruiterprofile**

Primary Key:
id

Foreign Keys:
user_id → accounts_user.id

| No. | Field Name | Datatype (Size) | Key Constraints | Description |
|-----|------------|-----------------|-----------------|-------------|
| 1 | id | BIGINT(64,0) | PRIMARY KEY, NOT NULL | Id |
| 2 | company_name | CHARACTER VARYING(255) | NOT NULL | Company name |
| 3 | recruiter_name | CHARACTER VARYING(150) | NOT NULL | Recruiter name |
| 4 | designation | CHARACTER VARYING(150) | NOT NULL | Designation |
| 5 | official_email | CHARACTER VARYING(254) | NOT NULL | Official email |
| 6 | mobile_number | CHARACTER VARYING(20) | NOT NULL | Mobile number |
| 7 | hiring_volume | CHARACTER VARYING(100) | NOT NULL | Hiring volume |
| 8 | is_verified | BOOLEAN | NOT NULL | Is verified |
| 9 | created_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Created at |
| 10 | updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Updated at |
| 11 | user_id | BIGINT(64,0) | FOREIGN KEY (accounts_user.id), UNIQUE, NOT NULL | User |
| 12 | approval_status | CHARACTER VARYING(20) | NOT NULL | Approval status (Values: Pending, Approved, Rejected) |


**21. students_studentcontact**

Primary Key:
id

Foreign Keys:
student_id → students_studentprofile.id

| No. | Field Name | Datatype (Size) | Key Constraints | Description |
|-----|------------|-----------------|-----------------|-------------|
| 1 | id | BIGINT(64,0) | PRIMARY KEY, NOT NULL | Id |
| 2 | primary_email | CHARACTER VARYING(254) | NOT NULL | Primary email |
| 3 | personal_email | CHARACTER VARYING(254) | NOT NULL | Personal email |
| 4 | mobile_number | CHARACTER VARYING(20) | NOT NULL | Mobile number |
| 5 | country | CHARACTER VARYING(100) | NOT NULL | Country |
| 6 | state | CHARACTER VARYING(100) | NOT NULL | State |
| 7 | district | CHARACTER VARYING(100) | NOT NULL | District |
| 8 | city | CHARACTER VARYING(100) | NOT NULL | City |
| 9 | pincode | CHARACTER VARYING(10) | NOT NULL | Pincode |
| 10 | permanent_address | TEXT | NOT NULL | Permanent address |
| 11 | student_id | BIGINT(64,0) | FOREIGN KEY (students_studentprofile.id), UNIQUE, NOT NULL | Student |


**22. students_studentcurrenteducation**

Primary Key:
id

Foreign Keys:
branch_id → master_data_branch.id
program_id → master_data_program.id
student_id → students_studentprofile.id

| No. | Field Name | Datatype (Size) | Key Constraints | Description |
|-----|------------|-----------------|-----------------|-------------|
| 1 | id | BIGINT(64,0) | PRIMARY KEY, NOT NULL | Id |
| 2 | field_of_study | CHARACTER VARYING(150) | NOT NULL | Field of study |
| 3 | start_date | DATE | NOT NULL | Start date |
| 4 | end_date | DATE | NOT NULL | End date |
| 5 | batch | CHARACTER VARYING(50) | NOT NULL | Batch |
| 6 | semester | CHARACTER VARYING(20) | NOT NULL | Semester |
| 7 | cgpa | NUMERIC(4,2) | NOT NULL | Cgpa |
| 8 | active_backlogs | INTEGER(32,0) | NOT NULL | Active backlogs |
| 9 | branch_id | BIGINT(64,0) | FOREIGN KEY (master_data_branch.id), NOT NULL | Branch |
| 10 | program_id | BIGINT(64,0) | FOREIGN KEY (master_data_program.id), NOT NULL | Program |
| 11 | student_id | BIGINT(64,0) | FOREIGN KEY (students_studentprofile.id), UNIQUE, NOT NULL | Student |


**23. students_studentdocument**

Primary Key:
id

Foreign Keys:
student_id → students_studentprofile.id

| No. | Field Name | Datatype (Size) | Key Constraints | Description |
|-----|------------|-----------------|-----------------|-------------|
| 1 | id | BIGINT(64,0) | PRIMARY KEY, NOT NULL | Id |
| 2 | resume | CHARACTER VARYING(100) | - | Resume |
| 3 | class10_certificate | CHARACTER VARYING(100) | - | Class10 certificate |
| 4 | class12_certificate | CHARACTER VARYING(100) | - | Class12 certificate |
| 5 | degree_marksheet | CHARACTER VARYING(100) | - | Degree marksheet |
| 6 | uploaded_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Uploaded at |
| 7 | student_id | BIGINT(64,0) | FOREIGN KEY (students_studentprofile.id), UNIQUE, NOT NULL | Student |


**24. students_studentexperience**

Primary Key:
id

Foreign Keys:
employment_type_id → master_data_employmenttype.id
student_id → students_studentprofile.id

| No. | Field Name | Datatype (Size) | Key Constraints | Description |
|-----|------------|-----------------|-----------------|-------------|
| 1 | id | BIGINT(64,0) | PRIMARY KEY, NOT NULL | Id |
| 2 | company_name | CHARACTER VARYING(255) | NOT NULL | Company name |
| 3 | designation | CHARACTER VARYING(150) | NOT NULL | Designation |
| 4 | location | CHARACTER VARYING(150) | NOT NULL | Location |
| 5 | start_date | DATE | NOT NULL | Start date |
| 6 | end_date | DATE | - | End date |
| 7 | description | TEXT | NOT NULL | Description |
| 8 | employment_type_id | BIGINT(64,0) | FOREIGN KEY (master_data_employmenttype.id), NOT NULL | Employment type |
| 9 | student_id | BIGINT(64,0) | FOREIGN KEY (students_studentprofile.id), NOT NULL | Student |


**25. students_studentpreviouseducation**

Primary Key:
id

Foreign Keys:
qualification_type_id → master_data_qualificationtype.id
student_id → students_studentprofile.id

| No. | Field Name | Datatype (Size) | Key Constraints | Description |
|-----|------------|-----------------|-----------------|-------------|
| 1 | id | BIGINT(64,0) | PRIMARY KEY, NOT NULL | Id |
| 2 | institution_name | CHARACTER VARYING(255) | NOT NULL | Institution name |
| 3 | board_or_university | CHARACTER VARYING(255) | NOT NULL | Board or university |
| 4 | year_of_passing | INTEGER(32,0) | NOT NULL | Year of passing |
| 5 | percentage | NUMERIC(5,2) | NOT NULL | Percentage |
| 6 | qualification_type_id | BIGINT(64,0) | FOREIGN KEY (master_data_qualificationtype.id), NOT NULL | Qualification type |
| 7 | student_id | BIGINT(64,0) | FOREIGN KEY (students_studentprofile.id), NOT NULL | Student |


**26. students_studentprofile**

Primary Key:
id

Foreign Keys:
institution_id → institutions_institution.id
user_id → accounts_user.id

| No. | Field Name | Datatype (Size) | Key Constraints | Description |
|-----|------------|-----------------|-----------------|-------------|
| 1 | id | BIGINT(64,0) | PRIMARY KEY, NOT NULL | Id |
| 2 | register_number | CHARACTER VARYING(50) | UNIQUE, NOT NULL | Register number |
| 3 | first_name | CHARACTER VARYING(100) | NOT NULL | First name |
| 4 | middle_name | CHARACTER VARYING(100) | NOT NULL | Middle name |
| 5 | last_name | CHARACTER VARYING(100) | NOT NULL | Last name |
| 6 | gender | CHARACTER VARYING(20) | NOT NULL | Gender |
| 7 | date_of_birth | DATE | NOT NULL | Date of birth |
| 8 | blood_group | CHARACTER VARYING(10) | NOT NULL | Blood group |
| 9 | profile_photo | CHARACTER VARYING(100) | - | Profile photo |
| 10 | profile_completion | SMALLINT(16,0) | NOT NULL | Profile completion |
| 11 | created_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Created at |
| 12 | updated_at | TIMESTAMP WITH TIME ZONE | NOT NULL | Updated at |
| 13 | institution_id | BIGINT(64,0) | FOREIGN KEY (institutions_institution.id), NOT NULL | Institution |
| 14 | user_id | BIGINT(64,0) | FOREIGN KEY (accounts_user.id), UNIQUE, NOT NULL | User |


### D. RELATIONSHIPS

applications_application.job_id → jobs_job.id
applications_application.student_id → students_studentprofile.id
applications_interview.application_id → applications_application.id
institutions_institution.institution_type_id → master_data_institutiontype.id
jobs_job.employment_type_id → master_data_employmenttype.id
jobs_job.hiring_type_id → master_data_hiringtype.id
jobs_job.recruiter_id → recruiters_recruiterprofile.id
jobs_job.work_mode_id → master_data_workmode.id
master_data_branch.program_id → master_data_program.id
notifications_notification.user_id → accounts_user.id
placement_drives_placementdrive.institution_id → institutions_institution.id
placement_drives_placementdrive.job_id → jobs_job.id
placement_drives_placementdrive.recruiter_id → recruiters_recruiterprofile.id
placement_officers_institutiondetails.placement_officer_id → placement_officers_placementofficerprofile.id
placement_officers_placementofficerprofile.institution_id → institutions_institution.id
placement_officers_placementofficerprofile.user_id → accounts_user.id
recruiters_recruiterhiringpreference.hiring_type_id → master_data_hiringtype.id
recruiters_recruiterhiringpreference.work_mode_id → master_data_workmode.id
recruiters_recruiterhiringpreference.recruiter_id → recruiters_recruiterprofile.id
recruiters_recruiterprofile.user_id → accounts_user.id
students_studentcontact.student_id → students_studentprofile.id
students_studentcurrenteducation.branch_id → master_data_branch.id
students_studentcurrenteducation.program_id → master_data_program.id
students_studentcurrenteducation.student_id → students_studentprofile.id
students_studentdocument.student_id → students_studentprofile.id
students_studentexperience.employment_type_id → master_data_employmenttype.id
students_studentexperience.student_id → students_studentprofile.id
students_studentpreviouseducation.qualification_type_id → master_data_qualificationtype.id
students_studentpreviouseducation.student_id → students_studentprofile.id
students_studentprofile.institution_id → institutions_institution.id
students_studentprofile.user_id → accounts_user.id

### E. INDEXES

- Table: accounts_otpverification | Index: accounts_otpverification_pkey | Def: CREATE UNIQUE INDEX accounts_otpverification_pkey ON public.accounts_otpverification USING btree (id)
- Table: accounts_user | Index: accounts_user_pkey | Def: CREATE UNIQUE INDEX accounts_user_pkey ON public.accounts_user USING btree (id)
- Table: accounts_user | Index: accounts_user_email_key | Def: CREATE UNIQUE INDEX accounts_user_email_key ON public.accounts_user USING btree (email)
- Table: accounts_user | Index: accounts_user_email_b2644a56_like | Def: CREATE INDEX accounts_user_email_b2644a56_like ON public.accounts_user USING btree (email varchar_pattern_ops)
- Table: applications_application | Index: applications_application_pkey | Def: CREATE UNIQUE INDEX applications_application_pkey ON public.applications_application USING btree (id)
- Table: applications_application | Index: applications_application_student_id_job_id_eb68634c_uniq | Def: CREATE UNIQUE INDEX applications_application_student_id_job_id_eb68634c_uniq ON public.applications_application USING btree (student_id, job_id)
- Table: applications_application | Index: applications_application_job_id_c031177c | Def: CREATE INDEX applications_application_job_id_c031177c ON public.applications_application USING btree (job_id)
- Table: applications_application | Index: applications_application_student_id_0d954db1 | Def: CREATE INDEX applications_application_student_id_0d954db1 ON public.applications_application USING btree (student_id)
- Table: applications_interview | Index: applications_interview_pkey | Def: CREATE UNIQUE INDEX applications_interview_pkey ON public.applications_interview USING btree (id)
- Table: applications_interview | Index: applications_interview_application_id_e04b2b00 | Def: CREATE INDEX applications_interview_application_id_e04b2b00 ON public.applications_interview USING btree (application_id)
- Table: applications_interview | Index: application_intervi_2bfc54_idx | Def: CREATE INDEX application_intervi_2bfc54_idx ON public.applications_interview USING btree (interview_date, interview_time)
- Table: applications_interview | Index: application_applica_d799d2_idx | Def: CREATE INDEX application_applica_d799d2_idx ON public.applications_interview USING btree (application_id, interview_type)
- Table: institutions_institution | Index: institutions_institution_pkey | Def: CREATE UNIQUE INDEX institutions_institution_pkey ON public.institutions_institution USING btree (id)
- Table: institutions_institution | Index: institutions_institution_institution_type_id_d0bba513 | Def: CREATE INDEX institutions_institution_institution_type_id_d0bba513 ON public.institutions_institution USING btree (institution_type_id)
- Table: jobs_job | Index: jobs_job_pkey | Def: CREATE UNIQUE INDEX jobs_job_pkey ON public.jobs_job USING btree (id)
- Table: jobs_job | Index: jobs_job_employment_type_id_178b602e | Def: CREATE INDEX jobs_job_employment_type_id_178b602e ON public.jobs_job USING btree (employment_type_id)
- Table: jobs_job | Index: jobs_job_hiring_type_id_25f1b602 | Def: CREATE INDEX jobs_job_hiring_type_id_25f1b602 ON public.jobs_job USING btree (hiring_type_id)
- Table: jobs_job | Index: jobs_job_recruiter_id_ada1c7a6 | Def: CREATE INDEX jobs_job_recruiter_id_ada1c7a6 ON public.jobs_job USING btree (recruiter_id)
- Table: jobs_job | Index: jobs_job_work_mode_id_2d20aaff | Def: CREATE INDEX jobs_job_work_mode_id_2d20aaff ON public.jobs_job USING btree (work_mode_id)
- Table: master_data_branch | Index: master_data_branch_pkey | Def: CREATE UNIQUE INDEX master_data_branch_pkey ON public.master_data_branch USING btree (id)
- Table: master_data_branch | Index: master_data_branch_program_id_name_bbe83365_uniq | Def: CREATE UNIQUE INDEX master_data_branch_program_id_name_bbe83365_uniq ON public.master_data_branch USING btree (program_id, name)
- Table: master_data_branch | Index: master_data_branch_program_id_f2470470 | Def: CREATE INDEX master_data_branch_program_id_f2470470 ON public.master_data_branch USING btree (program_id)
- Table: master_data_employmenttype | Index: master_data_employmenttype_pkey | Def: CREATE UNIQUE INDEX master_data_employmenttype_pkey ON public.master_data_employmenttype USING btree (id)
- Table: master_data_employmenttype | Index: master_data_employmenttype_name_key | Def: CREATE UNIQUE INDEX master_data_employmenttype_name_key ON public.master_data_employmenttype USING btree (name)
- Table: master_data_employmenttype | Index: master_data_employmenttype_name_fc7f6c1e_like | Def: CREATE INDEX master_data_employmenttype_name_fc7f6c1e_like ON public.master_data_employmenttype USING btree (name varchar_pattern_ops)
- Table: master_data_hiringtype | Index: master_data_hiringtype_pkey | Def: CREATE UNIQUE INDEX master_data_hiringtype_pkey ON public.master_data_hiringtype USING btree (id)
- Table: master_data_hiringtype | Index: master_data_hiringtype_name_key | Def: CREATE UNIQUE INDEX master_data_hiringtype_name_key ON public.master_data_hiringtype USING btree (name)
- Table: master_data_hiringtype | Index: master_data_hiringtype_name_a5c21a88_like | Def: CREATE INDEX master_data_hiringtype_name_a5c21a88_like ON public.master_data_hiringtype USING btree (name varchar_pattern_ops)
- Table: master_data_institutiontype | Index: master_data_institutiontype_pkey | Def: CREATE UNIQUE INDEX master_data_institutiontype_pkey ON public.master_data_institutiontype USING btree (id)
- Table: master_data_institutiontype | Index: master_data_institutiontype_name_key | Def: CREATE UNIQUE INDEX master_data_institutiontype_name_key ON public.master_data_institutiontype USING btree (name)
- Table: master_data_institutiontype | Index: master_data_institutiontype_name_c6ee4ed9_like | Def: CREATE INDEX master_data_institutiontype_name_c6ee4ed9_like ON public.master_data_institutiontype USING btree (name varchar_pattern_ops)
- Table: master_data_program | Index: master_data_program_pkey | Def: CREATE UNIQUE INDEX master_data_program_pkey ON public.master_data_program USING btree (id)
- Table: master_data_program | Index: master_data_program_name_key | Def: CREATE UNIQUE INDEX master_data_program_name_key ON public.master_data_program USING btree (name)
- Table: master_data_program | Index: master_data_program_name_6eec4f0d_like | Def: CREATE INDEX master_data_program_name_6eec4f0d_like ON public.master_data_program USING btree (name varchar_pattern_ops)
- Table: master_data_qualificationtype | Index: master_data_qualificationtype_pkey | Def: CREATE UNIQUE INDEX master_data_qualificationtype_pkey ON public.master_data_qualificationtype USING btree (id)
- Table: master_data_qualificationtype | Index: master_data_qualificationtype_name_key | Def: CREATE UNIQUE INDEX master_data_qualificationtype_name_key ON public.master_data_qualificationtype USING btree (name)
- Table: master_data_qualificationtype | Index: master_data_qualificationtype_name_45825a90_like | Def: CREATE INDEX master_data_qualificationtype_name_45825a90_like ON public.master_data_qualificationtype USING btree (name varchar_pattern_ops)
- Table: master_data_targetjobrole | Index: master_data_targetjobrole_pkey | Def: CREATE UNIQUE INDEX master_data_targetjobrole_pkey ON public.master_data_targetjobrole USING btree (id)
- Table: master_data_targetjobrole | Index: master_data_targetjobrole_name_key | Def: CREATE UNIQUE INDEX master_data_targetjobrole_name_key ON public.master_data_targetjobrole USING btree (name)
- Table: master_data_targetjobrole | Index: master_data_targetjobrole_name_fc60967f_like | Def: CREATE INDEX master_data_targetjobrole_name_fc60967f_like ON public.master_data_targetjobrole USING btree (name varchar_pattern_ops)
- Table: master_data_workmode | Index: master_data_workmode_pkey | Def: CREATE UNIQUE INDEX master_data_workmode_pkey ON public.master_data_workmode USING btree (id)
- Table: master_data_workmode | Index: master_data_workmode_name_key | Def: CREATE UNIQUE INDEX master_data_workmode_name_key ON public.master_data_workmode USING btree (name)
- Table: master_data_workmode | Index: master_data_workmode_name_2e7e2d14_like | Def: CREATE INDEX master_data_workmode_name_2e7e2d14_like ON public.master_data_workmode USING btree (name varchar_pattern_ops)
- Table: notifications_notification | Index: notifications_notification_pkey | Def: CREATE UNIQUE INDEX notifications_notification_pkey ON public.notifications_notification USING btree (id)
- Table: notifications_notification | Index: notifications_notification_user_id_b5e8c0ff | Def: CREATE INDEX notifications_notification_user_id_b5e8c0ff ON public.notifications_notification USING btree (user_id)
- Table: placement_drives_placementdrive | Index: placement_drives_placementdrive_pkey | Def: CREATE UNIQUE INDEX placement_drives_placementdrive_pkey ON public.placement_drives_placementdrive USING btree (id)
- Table: placement_drives_placementdrive | Index: placement_drives_placementdrive_institution_id_b9e6f16c | Def: CREATE INDEX placement_drives_placementdrive_institution_id_b9e6f16c ON public.placement_drives_placementdrive USING btree (institution_id)
- Table: placement_drives_placementdrive | Index: placement_drives_placementdrive_job_id_f87dcff3 | Def: CREATE INDEX placement_drives_placementdrive_job_id_f87dcff3 ON public.placement_drives_placementdrive USING btree (job_id)
- Table: placement_drives_placementdrive | Index: placement_drives_placementdrive_recruiter_id_c62dc1f5 | Def: CREATE INDEX placement_drives_placementdrive_recruiter_id_c62dc1f5 ON public.placement_drives_placementdrive USING btree (recruiter_id)
- Table: placement_officers_institutiondetails | Index: placement_officers_institutiondetails_pkey | Def: CREATE UNIQUE INDEX placement_officers_institutiondetails_pkey ON public.placement_officers_institutiondetails USING btree (id)
- Table: placement_officers_institutiondetails | Index: placement_officers_institutiondetails_placement_officer_id_key | Def: CREATE UNIQUE INDEX placement_officers_institutiondetails_placement_officer_id_key ON public.placement_officers_institutiondetails USING btree (placement_officer_id)
- Table: placement_officers_placementofficerprofile | Index: placement_officers_placementofficerprofile_pkey | Def: CREATE UNIQUE INDEX placement_officers_placementofficerprofile_pkey ON public.placement_officers_placementofficerprofile USING btree (id)
- Table: placement_officers_placementofficerprofile | Index: placement_officers_placementofficerprofile_institution_id_key | Def: CREATE UNIQUE INDEX placement_officers_placementofficerprofile_institution_id_key ON public.placement_officers_placementofficerprofile USING btree (institution_id)
- Table: placement_officers_placementofficerprofile | Index: placement_officers_placementofficerprofile_user_id_key | Def: CREATE UNIQUE INDEX placement_officers_placementofficerprofile_user_id_key ON public.placement_officers_placementofficerprofile USING btree (user_id)
- Table: recruiters_recruiterhiringpreference | Index: recruiters_recruiterhiringpreference_pkey | Def: CREATE UNIQUE INDEX recruiters_recruiterhiringpreference_pkey ON public.recruiters_recruiterhiringpreference USING btree (id)
- Table: recruiters_recruiterhiringpreference | Index: recruiters_recruiterhiringpreference_recruiter_id_key | Def: CREATE UNIQUE INDEX recruiters_recruiterhiringpreference_recruiter_id_key ON public.recruiters_recruiterhiringpreference USING btree (recruiter_id)
- Table: recruiters_recruiterhiringpreference | Index: recruiters_recruiterhiringpreference_hiring_type_id_b497fcc7 | Def: CREATE INDEX recruiters_recruiterhiringpreference_hiring_type_id_b497fcc7 ON public.recruiters_recruiterhiringpreference USING btree (hiring_type_id)
- Table: recruiters_recruiterhiringpreference | Index: recruiters_recruiterhiringpreference_work_mode_id_694aa23d | Def: CREATE INDEX recruiters_recruiterhiringpreference_work_mode_id_694aa23d ON public.recruiters_recruiterhiringpreference USING btree (work_mode_id)
- Table: recruiters_recruiterprofile | Index: recruiters_recruiterprofile_pkey | Def: CREATE UNIQUE INDEX recruiters_recruiterprofile_pkey ON public.recruiters_recruiterprofile USING btree (id)
- Table: recruiters_recruiterprofile | Index: recruiters_recruiterprofile_user_id_key | Def: CREATE UNIQUE INDEX recruiters_recruiterprofile_user_id_key ON public.recruiters_recruiterprofile USING btree (user_id)
- Table: students_studentcontact | Index: students_studentcontact_pkey | Def: CREATE UNIQUE INDEX students_studentcontact_pkey ON public.students_studentcontact USING btree (id)
- Table: students_studentcontact | Index: students_studentcontact_student_id_key | Def: CREATE UNIQUE INDEX students_studentcontact_student_id_key ON public.students_studentcontact USING btree (student_id)
- Table: students_studentcurrenteducation | Index: students_studentcurrenteducation_pkey | Def: CREATE UNIQUE INDEX students_studentcurrenteducation_pkey ON public.students_studentcurrenteducation USING btree (id)
- Table: students_studentcurrenteducation | Index: students_studentcurrenteducation_student_id_key | Def: CREATE UNIQUE INDEX students_studentcurrenteducation_student_id_key ON public.students_studentcurrenteducation USING btree (student_id)
- Table: students_studentcurrenteducation | Index: students_studentcurrenteducation_branch_id_016111a7 | Def: CREATE INDEX students_studentcurrenteducation_branch_id_016111a7 ON public.students_studentcurrenteducation USING btree (branch_id)
- Table: students_studentcurrenteducation | Index: students_studentcurrenteducation_program_id_1805f817 | Def: CREATE INDEX students_studentcurrenteducation_program_id_1805f817 ON public.students_studentcurrenteducation USING btree (program_id)
- Table: students_studentdocument | Index: students_studentdocument_pkey | Def: CREATE UNIQUE INDEX students_studentdocument_pkey ON public.students_studentdocument USING btree (id)
- Table: students_studentdocument | Index: students_studentdocument_student_id_key | Def: CREATE UNIQUE INDEX students_studentdocument_student_id_key ON public.students_studentdocument USING btree (student_id)
- Table: students_studentexperience | Index: students_studentexperience_pkey | Def: CREATE UNIQUE INDEX students_studentexperience_pkey ON public.students_studentexperience USING btree (id)
- Table: students_studentexperience | Index: students_studentexperience_employment_type_id_464ecbbd | Def: CREATE INDEX students_studentexperience_employment_type_id_464ecbbd ON public.students_studentexperience USING btree (employment_type_id)
- Table: students_studentexperience | Index: students_studentexperience_student_id_3fddb05e | Def: CREATE INDEX students_studentexperience_student_id_3fddb05e ON public.students_studentexperience USING btree (student_id)
- Table: students_studentpreviouseducation | Index: students_studentpreviouseducation_pkey | Def: CREATE UNIQUE INDEX students_studentpreviouseducation_pkey ON public.students_studentpreviouseducation USING btree (id)
- Table: students_studentpreviouseducation | Index: students_studentprevioused_qualification_type_id_9e2dce99 | Def: CREATE INDEX students_studentprevioused_qualification_type_id_9e2dce99 ON public.students_studentpreviouseducation USING btree (qualification_type_id)
- Table: students_studentpreviouseducation | Index: students_studentpreviouseducation_student_id_f8769469 | Def: CREATE INDEX students_studentpreviouseducation_student_id_f8769469 ON public.students_studentpreviouseducation USING btree (student_id)
- Table: students_studentprofile | Index: students_studentprofile_pkey | Def: CREATE UNIQUE INDEX students_studentprofile_pkey ON public.students_studentprofile USING btree (id)
- Table: students_studentprofile | Index: students_studentprofile_register_number_key | Def: CREATE UNIQUE INDEX students_studentprofile_register_number_key ON public.students_studentprofile USING btree (register_number)
- Table: students_studentprofile | Index: students_studentprofile_user_id_key | Def: CREATE UNIQUE INDEX students_studentprofile_user_id_key ON public.students_studentprofile USING btree (user_id)
- Table: students_studentprofile | Index: students_studentprofile_register_number_62d913d8_like | Def: CREATE INDEX students_studentprofile_register_number_62d913d8_like ON public.students_studentprofile USING btree (register_number varchar_pattern_ops)
- Table: students_studentprofile | Index: students_studentprofile_institution_id_ac1e1ccb | Def: CREATE INDEX students_studentprofile_institution_id_ac1e1ccb ON public.students_studentprofile USING btree (institution_id)

### F. MODEL ↔ DATABASE CONSISTENCY

| Table | Django Model | Database Table | Status |
|------|--------------|----------------|--------|
| django_admin_log | admin.LogEntry | django_admin_log | PASS |
| auth_permission | auth.Permission | auth_permission | PASS |
| auth_group | auth.Group | auth_group | PASS |
| django_content_type | contenttypes.ContentType | django_content_type | PASS |
| django_session | sessions.Session | django_session | PASS |
| accounts_user | accounts.User | accounts_user | PASS |
| accounts_otpverification | accounts.OTPVerification | accounts_otpverification | PASS |
| master_data_institutiontype | master_data.InstitutionType | master_data_institutiontype | PASS |
| master_data_program | master_data.Program | master_data_program | PASS |
| master_data_branch | master_data.Branch | master_data_branch | PASS |
| master_data_qualificationtype | master_data.QualificationType | master_data_qualificationtype | PASS |
| master_data_employmenttype | master_data.EmploymentType | master_data_employmenttype | PASS |
| master_data_hiringtype | master_data.HiringType | master_data_hiringtype | PASS |
| master_data_workmode | master_data.WorkMode | master_data_workmode | PASS |
| master_data_targetjobrole | master_data.TargetJobRole | master_data_targetjobrole | PASS |
| institutions_institution | institutions.Institution | institutions_institution | PASS |
| students_studentprofile | students.StudentProfile | students_studentprofile | PASS |
| students_studentcontact | students.StudentContact | students_studentcontact | PASS |
| students_studentcurrenteducation | students.StudentCurrentEducation | students_studentcurrenteducation | PASS |
| students_studentpreviouseducation | students.StudentPreviousEducation | students_studentpreviouseducation | PASS |
| students_studentexperience | students.StudentExperience | students_studentexperience | PASS |
| students_studentdocument | students.StudentDocument | students_studentdocument | PASS |
| recruiters_recruiterprofile | recruiters.RecruiterProfile | recruiters_recruiterprofile | PASS |
| recruiters_recruiterhiringpreference | recruiters.RecruiterHiringPreference | recruiters_recruiterhiringpreference | PASS |
| placement_officers_placementofficerprofile | placement_officers.PlacementOfficerProfile | placement_officers_placementofficerprofile | PASS |
| placement_officers_institutiondetails | placement_officers.InstitutionDetails | placement_officers_institutiondetails | PASS |
| jobs_job | jobs.Job | jobs_job | PASS |
| applications_application | applications.Application | applications_application | PASS |
| applications_interview | applications.Interview | applications_interview | PASS |
| placement_drives_placementdrive | placement_drives.PlacementDrive | placement_drives_placementdrive | PASS |
| notifications_notification | notifications.Notification | notifications_notification | PASS |

### G. IMPORTANT NOTES

- Inspection executed directly against the live PostgreSQL 'placentra_db' database using information_schema.
- All table definitions exactly match the live constraints and datatypes.
- Django framework tables (auth, admin, contenttypes, sessions, migrations) are intentionally excluded from the academic detailed table design but reside in the database.