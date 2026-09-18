from accounts.models import User
from master_data.models import EmploymentType, HiringType, TargetJobRole, Program, Branch, WorkMode
from institutions.models import Institution
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

# Seed Welcome Notification for registered users if missing
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

print("Master data and system configurations verified successfully!")
