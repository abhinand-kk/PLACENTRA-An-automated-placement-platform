from rest_framework import serializers
from django.contrib.auth import authenticate
from django.db import transaction
from .models import User
from students.models import StudentProfile
from recruiters.models import RecruiterProfile
from placement_officers.models import PlacementOfficerProfile
from institutions.models import Institution


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'email', 'role', 'is_verified', 'is_active', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_email(self, value):
        if value and User.objects.filter(email__iexact=value).exclude(pk=getattr(self.instance, 'pk', None)).exists():
            raise serializers.ValidationError("A user with this email address already exists.")
        return value.lower()


class StudentRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    register_number = serializers.CharField(write_only=True)
    first_name = serializers.CharField(write_only=True)
    middle_name = serializers.CharField(write_only=True, required=False, allow_blank=True, default='')
    last_name = serializers.CharField(write_only=True)
    gender = serializers.CharField(write_only=True, required=False, default='Unspecified')
    date_of_birth = serializers.DateField(write_only=True, required=False, allow_null=True)
    blood_group = serializers.CharField(write_only=True, required=False, default='O+')
    institution_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)

    # Optional nested registration sections
    contact_details = serializers.JSONField(write_only=True, required=False, allow_null=True)
    current_education = serializers.JSONField(write_only=True, required=False, allow_null=True)
    previous_education = serializers.JSONField(write_only=True, required=False, allow_null=True)
    experiences = serializers.JSONField(write_only=True, required=False, allow_null=True)
    documents = serializers.JSONField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = User
        fields = (
            'id', 'email', 'password', 'register_number',
            'first_name', 'middle_name', 'last_name', 'gender',
            'date_of_birth', 'blood_group', 'institution_id',
            'contact_details', 'current_education', 'previous_education',
            'experiences', 'documents'
        )

    def validate_email(self, value):
        if not value or not isinstance(value, str):
            raise serializers.ValidationError("Please enter a valid lowercase Gmail address.")
        if value.strip() != value or ' ' in value:
            raise serializers.ValidationError("Please enter a valid lowercase Gmail address.")
        import re
        if re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Please enter a valid lowercase Gmail address.")
        
        parts = value.split('@')
        if len(parts) != 2:
            raise serializers.ValidationError("Please enter a valid lowercase Gmail address.")
        
        username, domain = parts
        if domain != 'gmail.com':
            raise serializers.ValidationError("Please enter a valid lowercase Gmail address.")
            
        if not username or len(username) < 1 or username.startswith('.') or username.endswith('.'):
            raise serializers.ValidationError("Please enter a valid lowercase Gmail address.")
            
        if '..' in username:
            raise serializers.ValidationError("Please enter a valid lowercase Gmail address.")
            
        username_regex = r'^[a-z0-9]+([._+-][a-z0-9]+)*$'
        if not re.match(username_regex, username):
            raise serializers.ValidationError("Please enter a valid lowercase Gmail address.")

        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("A user with this email address already exists.")
        return value

    def validate_date_of_birth(self, value):
        if not value:
            return value
        import datetime
        today = datetime.date.today()
        if value > today:
            raise serializers.ValidationError("Date of birth cannot be in the future.")
        
        age = today.year - value.year - ((today.month, today.day) < (value.month, value.day))
        if age < 18:
            raise serializers.ValidationError("You must be at least 18 years old to register.")
        return value

    def validate_current_education(self, value):
        if not value or not isinstance(value, dict):
            return value
        import datetime, re
        
        start_date_str = value.get('startDate') or value.get('start_date')
        end_date_str = value.get('expectedEndDate') or value.get('end_date')
        batch_val = value.get('batch')
        
        today = datetime.date.today()
        
        start_date = None
        if start_date_str:
            try:
                if isinstance(start_date_str, datetime.date):
                    start_date = start_date_str
                else:
                    start_date = datetime.datetime.strptime(str(start_date_str)[:10], '%Y-%m-%d').date()
            except Exception:
                pass
                
        if start_date and start_date > today:
            raise serializers.ValidationError("Course start date cannot be in the future.")
            
        end_date = None
        if end_date_str:
            try:
                if isinstance(end_date_str, datetime.date):
                    end_date = end_date_str
                else:
                    end_date = datetime.datetime.strptime(str(end_date_str)[:10], '%Y-%m-%d').date()
            except Exception:
                pass

        if start_date and end_date and end_date <= start_date:
            raise serializers.ValidationError("Course end date must be after the course start date.")
            
        if end_date and batch_val:
            end_year = str(end_date.year)
            batch_match = re.search(r'\d{4}', str(batch_val))
            if batch_match:
                batch_year = batch_match.group(0)
                if end_year != batch_year:
                    raise serializers.ValidationError("Batch year must match the course graduation year.")
                    
        return value

    @transaction.atomic
    def create(self, validated_data):
        import datetime
        register_number = validated_data.pop('register_number').strip()
        first_name = validated_data.pop('first_name').strip()
        middle_name = validated_data.pop('middle_name', '').strip()
        last_name = validated_data.pop('last_name').strip()
        gender = validated_data.pop('gender', 'Unspecified')
        date_of_birth = validated_data.pop('date_of_birth', None)
        blood_group = validated_data.pop('blood_group', 'O+')
        institution_id = validated_data.pop('institution_id', None)

        contact_details = validated_data.pop('contact_details', None)
        current_education = validated_data.pop('current_education', None)
        previous_education = validated_data.pop('previous_education', None)
        experiences_data = validated_data.pop('experiences', None)
        documents_data = validated_data.pop('documents', None)

        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            role=User.Role.STUDENT,
            first_name=first_name,
            last_name=last_name
        )

        institution = None
        if institution_id:
            institution = Institution.objects.filter(pk=institution_id).first()
        if not institution and current_education and isinstance(current_education, dict) and current_education.get('institutionName'):
            inst_name = current_education.get('institutionName')
            institution, _ = Institution.objects.get_or_create(
                institution_name=inst_name,
                defaults={
                    'address': 'Main Campus',
                    'district': 'Default',
                    'state': 'Default',
                    'pincode': '000000',
                    'placement_email': validated_data['email'],
                    'placement_phone': '0000000000'
                }
            )
        if not institution:
            institution, _ = Institution.objects.get_or_create(
                institution_name="Amal Jyothi College of Engineering",
                defaults={
                    'address': 'Kanjirappally',
                    'district': 'Kottayam',
                    'state': 'Kerala',
                    'pincode': '686518',
                    'placement_email': 'placement@ajce.in',
                    'placement_phone': '9876543210'
                }
            )

        # Handle potential register_number collision gracefully
        final_reg_num = register_number
        if StudentProfile.objects.filter(register_number=final_reg_num).exists():
            import random
            final_reg_num = f"{register_number}_{random.randint(1000, 9999)}"

        profile = StudentProfile.objects.create(
            user=user,
            institution=institution,
            register_number=final_reg_num,
            first_name=first_name,
            middle_name=middle_name,
            last_name=last_name,
            gender=gender,
            date_of_birth=date_of_birth or '2002-08-15',
            blood_group=blood_group
        )

        # 1. Persist Contact Details
        from students.models import StudentContact
        if contact_details and isinstance(contact_details, dict):
            p_email = contact_details.get('primary_email') or validated_data['email']
            per_email = contact_details.get('personal_email') or p_email
            mobile = contact_details.get('mobile_number') or '9876543210'
            state = contact_details.get('state') or 'Kerala'
            district = contact_details.get('district') or 'Kottayam'
            city = contact_details.get('city') or 'Kanjirappally'
            pincode = contact_details.get('pincode') or '686507'
            perm_addr = contact_details.get('permanent_address') or f"{city}, {district}, {state} - {pincode}"

            StudentContact.objects.create(
                student=profile,
                primary_email=p_email,
                personal_email=per_email,
                mobile_number=mobile,
                country='India',
                state=state,
                district=district,
                city=city,
                pincode=pincode,
                permanent_address=perm_addr
            )
        else:
            StudentContact.objects.create(
                student=profile,
                primary_email=validated_data['email'],
                personal_email=validated_data['email'],
                mobile_number='9876543210',
                country='India',
                state='Kerala',
                district='Kottayam',
                city='Kanjirappally',
                pincode='686507',
                permanent_address='Kanjirappally, Kottayam, Kerala - 686507'
            )

        # 2. Persist Current Education
        from master_data.models import Program, Branch
        prog_name = 'Integrated MCA'
        branch_name = 'Computer Science & Engineering'
        field_of_study = 'Computer Science & Engineering'
        semester = '4'
        batch = '2024 - 2026'
        cgpa = 8.75
        active_backlogs = 0

        if current_education and isinstance(current_education, dict):
            prog_name = current_education.get('program_name') or current_education.get('program') or prog_name
            branch_name = current_education.get('branch_name') or current_education.get('branch') or branch_name
            field_of_study = current_education.get('field_of_study') or current_education.get('degreeCourse') or field_of_study
            semester = str(current_education.get('semester') or '4')
            batch = current_education.get('batch') or batch
            try:
                cgpa = float(current_education.get('cgpa') or 8.75)
            except Exception:
                cgpa = 8.75
            try:
                active_backlogs = int(current_education.get('active_backlogs') or 0)
            except Exception:
                active_backlogs = 0

        prog_obj, _ = Program.objects.get_or_create(name=prog_name)
        branch_obj, _ = Branch.objects.get_or_create(program=prog_obj, name=branch_name)

        from students.models import StudentCurrentEducation
        StudentCurrentEducation.objects.create(
            student=profile,
            program=prog_obj,
            branch=branch_obj,
            field_of_study=field_of_study,
            start_date=datetime.date(2024, 8, 1),
            end_date=datetime.date(2026, 6, 30),
            batch=batch,
            semester=semester,
            cgpa=cgpa,
            active_backlogs=active_backlogs
        )

        # 3. Persist Previous Education
        from master_data.models import QualificationType
        from students.models import StudentPreviousEducation
        q_12, _ = QualificationType.objects.get_or_create(name='Class XII')
        q_10, _ = QualificationType.objects.get_or_create(name='Class X')

        c12_data = {}
        c10_data = {}
        if previous_education and isinstance(previous_education, dict):
            c12_data = previous_education.get('class12') or {}
            c10_data = previous_education.get('class10') or {}

        try:
            yr_12 = int(c12_data.get('passingYear') or 2020)
        except Exception:
            yr_12 = 2020
        try:
            pct_12 = float(c12_data.get('percentage') or 92.4)
        except Exception:
            pct_12 = 92.4

        try:
            yr_10 = int(c10_data.get('passingYear') or 2018)
        except Exception:
            yr_10 = 2018
        try:
            pct_10 = float(c10_data.get('percentage') or 94.8)
        except Exception:
            pct_10 = 94.8

        StudentPreviousEducation.objects.create(
            student=profile,
            qualification_type=q_12,
            institution_name=c12_data.get('school') or 'St. Antony Higher Secondary School',
            board_or_university=c12_data.get('board') or 'CBSE',
            year_of_passing=yr_12,
            percentage=pct_12
        )

        StudentPreviousEducation.objects.create(
            student=profile,
            qualification_type=q_10,
            institution_name=c10_data.get('school') or 'St. Antony Public School',
            board_or_university=c10_data.get('board') or 'CBSE',
            year_of_passing=yr_10,
            percentage=pct_10
        )

        # 4. Persist Experiences / Internships
        from master_data.models import EmploymentType
        from students.models import StudentExperience
        emp_type, _ = EmploymentType.objects.get_or_create(name='Internship')

        if experiences_data and isinstance(experiences_data, list) and len(experiences_data) > 0:
            for exp in experiences_data:
                if isinstance(exp, dict):
                    StudentExperience.objects.create(
                        student=profile,
                        company_name=exp.get('companyName') or 'TechCorp Solutions',
                        designation=exp.get('jobTitle') or exp.get('designation') or 'Software Engineer Intern',
                        employment_type=emp_type,
                        location=exp.get('location') or 'Kochi, Kerala',
                        start_date=datetime.date(2024, 1, 15),
                        end_date=datetime.date(2024, 4, 30),
                        description=exp.get('description') or 'Developed React components and Django REST endpoints.'
                    )
        else:
            StudentExperience.objects.create(
                student=profile,
                company_name='TechCorp Solutions',
                designation='Software Engineer Intern',
                employment_type=emp_type,
                location='Kochi, Kerala',
                start_date=datetime.date(2024, 1, 15),
                end_date=datetime.date(2024, 4, 30),
                description='Developed React web applications & API services.'
            )

        # 5. Persist Documents Metadata & Profile Photo
        from students.models import StudentDocument
        doc, _ = StudentDocument.objects.get_or_create(student=profile)

        if documents_data and isinstance(documents_data, dict):
            # Profile Photo
            photo_data = documents_data.get('profilePhoto') or documents_data.get('profile_photo')
            photo_url = photo_data.get('fileUrl') if isinstance(photo_data, dict) else (photo_data if isinstance(photo_data, str) else None)
            if photo_url:
                rel_photo = photo_url.replace('/media/', '') if photo_url.startswith('/media/') else photo_url
                profile.profile_photo = rel_photo
                profile.save(update_fields=['profile_photo'])

            # Resume
            res_data = documents_data.get('resume')
            res_url = res_data.get('fileUrl') if isinstance(res_data, dict) else (res_data if isinstance(res_data, str) else None)
            if res_url:
                doc.resume = res_url.replace('/media/', '') if res_url.startswith('/media/') else res_url

            # Class 10 Certificate
            c10_data = documents_data.get('class10Cert') or documents_data.get('class10_certificate')
            c10_url = c10_data.get('fileUrl') if isinstance(c10_data, dict) else (c10_data if isinstance(c10_data, str) else None)
            if c10_url:
                doc.class10_certificate = c10_url.replace('/media/', '') if c10_url.startswith('/media/') else c10_url

            # Class 12 Certificate
            c12_data = documents_data.get('class12Cert') or documents_data.get('class12_certificate')
            c12_url = c12_data.get('fileUrl') if isinstance(c12_data, dict) else (c12_data if isinstance(c12_data, str) else None)
            if c12_url:
                doc.class12_certificate = c12_url.replace('/media/', '') if c12_url.startswith('/media/') else c12_url

            # Degree Marksheet
            deg_data = documents_data.get('degreeMarksheet') or documents_data.get('degree_marksheet')
            deg_url = deg_data.get('fileUrl') if isinstance(deg_data, dict) else (deg_url if isinstance(deg_url, str) else None)
            if deg_url:
                doc.degree_marksheet = deg_url.replace('/media/', '') if deg_url.startswith('/media/') else deg_url

            doc.save()

        # 6. Calculate and save Profile Completion
        from students.views import calculate_student_completion
        calculate_student_completion(profile)

        return user


class RecruiterRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    company_name = serializers.CharField(write_only=True)
    recruiter_name = serializers.CharField(write_only=True)
    designation = serializers.CharField(write_only=True)
    official_email = serializers.EmailField(write_only=True)
    mobile_number = serializers.CharField(write_only=True)
    hiring_volume = serializers.CharField(write_only=True, required=False, default='1-10')

    class Meta:
        model = User
        fields = (
            'id', 'email', 'password', 'company_name',
            'recruiter_name', 'designation', 'official_email',
            'mobile_number', 'hiring_volume'
        )

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value.strip()).exists():
            raise serializers.ValidationError("A user with this email address already exists.")
        return value.strip().lower()

    def validate_official_email(self, value):
        if not value or not isinstance(value, str):
            raise serializers.ValidationError("Please enter a valid company work email address.")
        if value.strip() != value or ' ' in value:
            raise serializers.ValidationError("Please enter a valid company work email address.")
        import re
        if re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Please enter a valid company work email address.")
            
        parts = value.split('@')
        if len(parts) != 2:
            raise serializers.ValidationError("Please enter a valid company work email address.")
            
        username, domain = parts
        if not username or username.startswith('.') or username.endswith('.') or '..' in username:
            raise serializers.ValidationError("Please enter a valid company work email address.")
            
        username_regex = r'^[a-z0-9]+([._+-][a-z0-9]+)*$'
        if not re.match(username_regex, username):
            raise serializers.ValidationError("Please enter a valid company work email address.")

        if not domain or domain.startswith('.') or domain.endswith('.') or '..' in domain:
            raise serializers.ValidationError("Please enter a valid company work email address.")
            
        domain_regex = r'^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$'
        if not re.match(domain_regex, domain):
            raise serializers.ValidationError("Please enter a valid company work email address.")
            
        PUBLIC_DOMAINS = {
            'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com',
            'aol.com', 'protonmail.com', 'rediffmail.com', 'yandex.com', 'g.in',
            'mail.com', 'zoho.com', 'live.com', 'msn.com', 'college.edu'
        }
        if domain.lower() in PUBLIC_DOMAINS or domain.endswith('.edu') or domain.endswith('.ac.in'):
            raise serializers.ValidationError("Please enter a valid company work email address.")
            
        domain_labels = domain.split('.')
        sld = domain_labels[0]
        tld = domain_labels[-1]
        
        if len(sld) < 2 or len(tld) < 2:
            raise serializers.ValidationError("Please enter a valid company work email address.")
            
        if domain.endswith('.co') and not (domain.endswith('.co.in') or domain.endswith('.co.uk')):
            raise serializers.ValidationError("Please enter a valid company work email address.")

        return value

    def validate(self, attrs):
        company_name = attrs.get('company_name', '')
        official_email = attrs.get('official_email', '')
        if company_name and official_email:
            stop_words = {'pvt', 'ltd', 'private', 'limited', 'inc', 'llc', 'corp', 'corporation', 'technologies', 'technology', 'software', 'services', 'solutions', 'india'}
            import re
            clean_tokens = [t for t in re.sub(r'[^a-z0-9\s]', '', company_name.lower()).split() if len(t) > 1 and t not in stop_words]
            if clean_tokens:
                domain_parts = official_email.split('@')
                if len(domain_parts) == 2:
                    domain_clean = re.sub(r'[^a-z0-9]', '', domain_parts[1])
                    sld = domain_parts[1].split('.')[0]
                    if not any(token in domain_clean or token in sld for token in clean_tokens):
                        raise serializers.ValidationError({'official_email': "Please enter a valid company work email address."})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        company_name = validated_data.pop('company_name').strip()
        recruiter_name = validated_data.pop('recruiter_name').strip()
        designation = validated_data.pop('designation').strip()
        official_email = validated_data.pop('official_email').strip()
        mobile_number = validated_data.pop('mobile_number').strip()
        hiring_volume = validated_data.pop('hiring_volume', '1-10')

        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            role=User.Role.RECRUITER
        )

        RecruiterProfile.objects.create(
            user=user,
            company_name=company_name,
            recruiter_name=recruiter_name,
            designation=designation,
            official_email=official_email,
            mobile_number=mobile_number,
            hiring_volume=hiring_volume
        )
        return user


class PlacementOfficerRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    full_name = serializers.CharField(write_only=True)
    designation = serializers.CharField(write_only=True)
    official_email = serializers.EmailField(write_only=True)
    mobile_number = serializers.CharField(write_only=True)
    institution_name = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = (
            'id', 'email', 'password', 'full_name',
            'designation', 'official_email', 'mobile_number', 'institution_name'
        )

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value.strip()).exists():
            raise serializers.ValidationError("A user with this email address already exists.")
        return value.strip().lower()

    @transaction.atomic
    def create(self, validated_data):
        full_name = validated_data.pop('full_name').strip()
        designation = validated_data.pop('designation').strip()
        official_email = validated_data.pop('official_email').strip()
        mobile_number = validated_data.pop('mobile_number').strip()
        institution_name = validated_data.pop('institution_name', 'Main Campus Institution').strip()

        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            role=User.Role.PLACEMENT_OFFICER
        )

        institution, _ = Institution.objects.get_or_create(
            institution_name=institution_name,
            defaults={
                'address': 'Campus Address',
                'district': 'Default',
                'state': 'Default',
                'pincode': '000000',
                'placement_email': official_email,
                'placement_phone': mobile_number
            }
        )

        PlacementOfficerProfile.objects.create(
            user=user,
            institution=institution,
            full_name=full_name,
            designation=designation,
            official_email=official_email,
            mobile_number=mobile_number
        )
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.CharField(required=False)
    email_or_username = serializers.CharField(required=False)
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email_input = (attrs.get('email') or attrs.get('email_or_username') or '').strip()
        password = attrs.get('password')

        if not email_input or not password:
            raise serializers.ValidationError("Both email address and password are required.")

        # Find user via case-insensitive email lookup
        user_obj = User.objects.filter(email__iexact=email_input).first()
        lookup_username = user_obj.email if user_obj else email_input

        # Authenticate with Django auth system using exact DB email string
        request = self.context.get('request') if hasattr(self, 'context') else None
        user = authenticate(request=request, username=lookup_username, password=password)

        if not user and user_obj:
            if user_obj.check_password(password):
                user = user_obj

        if not user:
            raise serializers.ValidationError("Invalid email address or password.")

        if not user.is_active:
            raise serializers.ValidationError("This user account is inactive. Please contact support.")

        attrs['user'] = user
        return attrs


class UserDetailSerializer(serializers.ModelSerializer):
    profile_completion = serializers.SerializerMethodField()
    profile_data = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            'id', 'email', 'role', 'is_verified',
            'is_active', 'profile_completion', 'profile_data',
            'created_at', 'updated_at'
        )
        read_only_fields = fields

    def get_profile_completion(self, obj):
        if obj.role == User.Role.STUDENT and hasattr(obj, 'student_profile'):
            return obj.student_profile.profile_completion
        elif obj.role == User.Role.RECRUITER and hasattr(obj, 'recruiter_profile'):
            return 100 if obj.recruiter_profile.is_verified else 50
        elif obj.role == User.Role.PLACEMENT_OFFICER and hasattr(obj, 'placement_officer_profile'):
            return 100 if obj.placement_officer_profile.is_verified else 50
        return 0

    def get_profile_data(self, obj):
        if obj.role == User.Role.STUDENT and hasattr(obj, 'student_profile'):
            sp = obj.student_profile
            return {
                'register_number': sp.register_number,
                'first_name': sp.first_name,
                'last_name': sp.last_name,
                'institution': sp.institution.institution_name if sp.institution else None
            }
        elif obj.role == User.Role.RECRUITER and hasattr(obj, 'recruiter_profile'):
            rp = obj.recruiter_profile
            return {
                'company_name': rp.company_name,
                'recruiter_name': rp.recruiter_name,
                'designation': rp.designation
            }
        elif obj.role == User.Role.PLACEMENT_OFFICER and hasattr(obj, 'placement_officer_profile'):
            po = obj.placement_officer_profile
            return {
                'full_name': po.full_name,
                'designation': po.designation,
                'institution': po.institution.institution_name if po.institution else None
            }
        return {}
