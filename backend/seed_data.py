import datetime
from accounts.models import User
from master_data.models import EmploymentType, HiringType, TargetJobRole, Program, Branch, WorkMode
from recruiters.models import RecruiterProfile
from institutions.models import Institution
from jobs.models import Job
from placement_drives.models import PlacementDrive
from notifications.models import Notification

inst, _ = Institution.objects.get_or_create(
    institution_name='Default Institution',
    defaults={
        'address': 'Main Campus',
        'district': 'Default',
        'state': 'Default',
        'pincode': '000000',
        'placement_email': 'placement@default.edu',
        'placement_phone': '9876543210'
    }
)

emp_type, _ = EmploymentType.objects.get_or_create(name='Full Time')
hiring_type, _ = HiringType.objects.get_or_create(name='Direct')
work_mode, _ = WorkMode.objects.get_or_create(name='On-Site')

rec_user, _ = User.objects.get_or_create(email='techrecruiter@innovate.com', defaults={'role': User.Role.RECRUITER})
rec_user.set_password('Password123!')
rec_user.save()

rec_prof, _ = RecruiterProfile.objects.get_or_create(
    user=rec_user,
    defaults={
        'company_name': 'Innovate Software Systems',
        'recruiter_name': 'Sarah Jenkins',
        'designation': 'Talent Acquisition Lead',
        'official_email': 'techrecruiter@innovate.com',
        'mobile_number': '9876543210'
    }
)

rec_user2, _ = User.objects.get_or_create(email='hr@cloudtech.com', defaults={'role': User.Role.RECRUITER})
rec_user2.set_password('Password123!')
rec_user2.save()

rec_prof2, _ = RecruiterProfile.objects.get_or_create(
    user=rec_user2,
    defaults={
        'company_name': 'CloudTech Dynamics',
        'recruiter_name': 'Michael Chang',
        'designation': 'HR Director',
        'official_email': 'hr@cloudtech.com',
        'mobile_number': '9876543211'
    }
)

jobs_data = [
    ('Software Engineer - AI & Backend', 'Develop scalable backend web APIs using Django & React.', 12.50, 'Kochi, Kerala', rec_prof),
    ('Frontend Developer (React.js)', 'Build modern web applications with React and UI design tokens.', 9.80, 'Trivandrum, Kerala', rec_prof),
    ('Data Engineer & Analytics Specialist', 'Design data pipelines and processing models.', 11.00, 'Bangalore, Karnataka', rec_prof2),
    ('Cloud DevOps Engineer', 'Manage Kubernetes clusters and AWS infrastructure.', 14.00, 'Remote / Hybrid', rec_prof2),
    ('Full Stack Software Developer', 'Build end-to-end cloud platforms.', 10.50, 'Kochi, Kerala', rec_prof)
]

jobs = []
for title, desc, pkg, loc, rprof in jobs_data:
    j, created = Job.objects.get_or_create(
        job_title=title,
        recruiter=rprof,
        defaults={
            'job_description': desc,
            'employment_type': emp_type,
            'hiring_type': hiring_type,
            'minimum_cgpa': 7.0,
            'application_deadline': datetime.date(2026, 12, 31),
            'package_lpa': pkg,
            'work_mode': work_mode,
            'location': loc,
            'status': Job.Status.OPEN
        }
    )
    jobs.append(j)

drives_data = [
    ('Innovate Systems Campus Drive 2026', 'On-campus recruitment drive for Software Engineer roles.', datetime.date(2026, 9, 15), 'College Central Auditorium', rec_prof, jobs[0]),
    ('CloudTech Pool Placement Drive', 'Statewide placement drive for MCA & B.Tech students.', datetime.date(2026, 10, 20), 'Main Seminar Hall B', rec_prof2, jobs[2]),
    ('Global Tech Mega Placement Fest', 'Mega placement drive with multiple participating MNCs.', datetime.date(2026, 11, 5), 'Placement Cell Block 3', rec_prof, jobs[4])
]

for title, desc, ddate, venue, rprof, j in drives_data:
    PlacementDrive.objects.get_or_create(
        drive_title=title,
        institution=inst,
        recruiter=rprof,
        defaults={
            'job': j,
            'drive_date': ddate,
            'drive_time': datetime.time(9, 30),
            'venue': venue,
            'description': desc,
            'status': PlacementDrive.DriveStatus.UPCOMING
        }
    )

# Seed Notifications for all registered users
for u in User.objects.all():
    Notification.objects.get_or_create(
        user=u,
        title='Welcome to PLACENTRA Placement Portal!',
        defaults={
            'message': 'Your account profile has been set up successfully. Explore campus job postings & placement drives.',
            'notification_type': 'System',
            'is_read': False
        }
    )
    Notification.objects.get_or_create(
        user=u,
        title='Campus Placement Drive Scheduled',
        defaults={
            'message': 'Innovate Software Systems drive has been scheduled for final year candidates.',
            'notification_type': 'Placement Drive',
            'is_read': False
        }
    )

print("Sample jobs, placement drives, and notifications seeded successfully!")
