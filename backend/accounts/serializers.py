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


def resolve_institution(institution_name=None, defaults=None):
    """
    Safely resolves or creates an Institution record, preventing duplicates caused by
    casing differences, whitespace, or naming variations (e.g. 'Autonomous').
    """
    if not institution_name or not str(institution_name).strip():
        institution_name = "Amal Jyothi College of Engineering"
    clean_name = str(institution_name).strip()

    # 1. Exact case-insensitive match
    inst = Institution.objects.filter(institution_name__iexact=clean_name).first()
    if inst:
        return inst

    # 2. Normalized match removing suffixes like 'Autonomous' or punctuation
    norm_name = clean_name.replace('Autonomous', '').replace('autonomous', '').strip()
    if norm_name:
        inst = Institution.objects.filter(institution_name__iexact=norm_name).first()
        if inst:
            return inst
        inst = Institution.objects.filter(institution_name__icontains=norm_name).first()
        if inst:
            return inst

    # 3. Create if truly distinct
    default_vals = {
        'address': 'Main Campus',
        'district': 'Default',
        'state': 'Default',
        'pincode': '000000',
        'placement_email': 'placement@college.edu',
        'placement_phone': '0000000000'
    }
    if defaults:
        default_vals.update(defaults)

    return Institution.objects.create(institution_name=clean_name, **default_vals)


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
        err_msg = "Please enter a valid lowercase email address."
        if not value or not isinstance(value, str):
            raise serializers.ValidationError(err_msg)
        if value.strip() != value or ' ' in value:
            raise serializers.ValidationError(err_msg)
        import re
        if re.search(r'[A-Z]', value):
            raise serializers.ValidationError(err_msg)
        
        parts = value.split('@')
        if len(parts) != 2:
            raise serializers.ValidationError(err_msg)
        
        username, domain = parts
        if not username or len(username) < 1 or username.startswith('.') or username.endswith('.'):
            raise serializers.ValidationError(err_msg)
            
        if '..' in username:
            raise serializers.ValidationError(err_msg)
            
        username_regex = r'^[a-z0-9]+([._+-][a-z0-9]+)*$'
        if not re.match(username_regex, username):
            raise serializers.ValidationError(err_msg)

        if not domain or len(domain) < 3 or domain.startswith('.') or domain.endswith('.'):
            raise serializers.ValidationError(err_msg)

        if '..' in domain:
            raise serializers.ValidationError(err_msg)

        domain_regex = r'^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$'
        if not re.match(domain_regex, domain):
            raise serializers.ValidationError(err_msg)

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
            batch_years = re.findall(r'\d{4}', str(batch_val))
            if batch_years and end_year not in batch_years:
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
        if not institution:
            inst_name = None
            if current_education and isinstance(current_education, dict):
                inst_name = current_education.get('institutionName')
            institution = resolve_institution(
                inst_name or "Amal Jyothi College of Engineering",
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
            mobile = (contact_details.get('mobile_number') or '').strip()
            state = (contact_details.get('state') or '').strip()
            district = (contact_details.get('district') or '').strip()
            city = (contact_details.get('city') or '').strip()
            pincode = (contact_details.get('pincode') or '').strip()
            perm_addr = (contact_details.get('permanent_address') or f"{city}, {district}, {state} - {pincode}").strip()

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
                mobile_number='',
                country='India',
                state='',
                district='',
                city='',
                pincode='',
                permanent_address=''
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

        curr_start_date = None
        curr_end_date = None

        if current_education and isinstance(current_education, dict):
            prog_name = current_education.get('program_name') or current_education.get('program') or prog_name
            branch_name = current_education.get('branch_name') or current_education.get('branch') or branch_name
            field_of_study = current_education.get('field_of_study') or current_education.get('degreeCourse') or field_of_study
            semester = str(current_education.get('semester') or current_education.get('currentSemester') or '4')
            batch = current_education.get('batch') or batch
            try:
                cgpa_val = current_education.get('cgpa')
                if cgpa_val is not None:
                    cgpa = float(cgpa_val)
                elif current_education.get('percentage'):
                    cgpa = round(float(current_education.get('percentage')) / 10.0, 2)
            except Exception:
                cgpa = 8.75
            try:
                active_backlogs = int(current_education.get('active_backlogs') or current_education.get('totalBacklogs') or 0)
            except Exception:
                active_backlogs = 0

            # Parse submitted start and end dates
            start_date_raw = current_education.get('startDate') or current_education.get('start_date')
            if start_date_raw:
                try:
                    if isinstance(start_date_raw, datetime.date):
                        curr_start_date = start_date_raw
                    else:
                        curr_start_date = datetime.datetime.strptime(str(start_date_raw)[:10], '%Y-%m-%d').date()
                except Exception:
                    pass

            end_date_raw = current_education.get('expectedEndDate') or current_education.get('endDate') or current_education.get('end_date')
            if end_date_raw:
                try:
                    if isinstance(end_date_raw, datetime.date):
                        curr_end_date = end_date_raw
                    else:
                        curr_end_date = datetime.datetime.strptime(str(end_date_raw)[:10], '%Y-%m-%d').date()
                except Exception:
                    pass

        prog_obj, _ = Program.objects.get_or_create(name=prog_name)
        branch_obj, _ = Branch.objects.get_or_create(program=prog_obj, name=branch_name)

        from students.models import StudentCurrentEducation
        StudentCurrentEducation.objects.create(
            student=profile,
            program=prog_obj,
            branch=branch_obj,
            field_of_study=field_of_study,
            start_date=curr_start_date or datetime.date(2024, 8, 1),
            end_date=curr_end_date or datetime.date(2026, 6, 30),
            batch=batch,
            semester=semester,
            cgpa=cgpa,
            active_backlogs=active_backlogs
        )

        # 3. Persist Previous Education
        from master_data.models import QualificationType
        from students.models import StudentPreviousEducation

        c12_data = {}
        c10_data = {}
        if previous_education and isinstance(previous_education, dict):
            c12_data = previous_education.get('class12') or {}
            c10_data = previous_education.get('class10') or {}

        if c12_data and (c12_data.get('school') or c12_data.get('schoolName') or c12_data.get('board')):
            q_12, _ = QualificationType.objects.get_or_create(name='Class XII')
            try:
                yr_12 = int(c12_data.get('passingYear') or c12_data.get('yearOfPassing') or 2020)
            except Exception:
                yr_12 = 2020
            try:
                pct_12 = float(c12_data.get('percentage') or 0.0)
            except Exception:
                pct_12 = 0.0

            StudentPreviousEducation.objects.create(
                student=profile,
                qualification_type=q_12,
                institution_name=c12_data.get('schoolName') or c12_data.get('school') or '',
                board_or_university=c12_data.get('board') or '',
                year_of_passing=yr_12,
                percentage=pct_12
            )

        if c10_data and (c10_data.get('school') or c10_data.get('schoolName') or c10_data.get('board')):
            q_10, _ = QualificationType.objects.get_or_create(name='Class X')
            try:
                yr_10 = int(c10_data.get('passingYear') or c10_data.get('yearOfPassing') or 2018)
            except Exception:
                yr_10 = 2018
            try:
                pct_10 = float(c10_data.get('percentage') or 0.0)
            except Exception:
                pct_10 = 0.0

            StudentPreviousEducation.objects.create(
                student=profile,
                qualification_type=q_10,
                institution_name=c10_data.get('schoolName') or c10_data.get('school') or '',
                board_or_university=c10_data.get('board') or '',
                year_of_passing=yr_10,
                percentage=pct_10
            )

        # 4. Persist Experiences / Internships (only if provided by student; no fabricated defaults)
        from master_data.models import EmploymentType
        from students.models import StudentExperience

        if experiences_data and isinstance(experiences_data, list) and len(experiences_data) > 0:
            for exp in experiences_data:
                if not isinstance(exp, dict):
                    continue

                company = (exp.get('company') or exp.get('company_name') or exp.get('companyName') or '').strip()
                designation = (exp.get('jobTitle') or exp.get('designation') or '').strip()

                # Skip completely blank entries rather than inventing data
                if not company and not designation:
                    continue

                emp_type_name = exp.get('type') or exp.get('employmentType') or exp.get('employment_type') or 'Internship'
                if isinstance(emp_type_name, int):
                    emp_type = EmploymentType.objects.filter(pk=emp_type_name).first() or EmploymentType.objects.get_or_create(name='Internship')[0]
                else:
                    emp_type, _ = EmploymentType.objects.get_or_create(name=str(emp_type_name).strip() or 'Internship')

                location = (exp.get('location') or '').strip()

                start_date_raw = exp.get('startDate') or exp.get('start_date')
                end_date_raw = exp.get('endDate') or exp.get('end_date')
                is_current = bool(exp.get('isCurrent') or exp.get('is_current'))

                start_date = None
                if start_date_raw:
                    try:
                        if isinstance(start_date_raw, datetime.date):
                            start_date = start_date_raw
                        else:
                            start_date = datetime.datetime.strptime(str(start_date_raw)[:10], '%Y-%m-%d').date()
                    except Exception:
                        pass
                if not start_date:
                    start_date = datetime.date.today()

                end_date = None
                if not is_current and end_date_raw:
                    try:
                        if isinstance(end_date_raw, datetime.date):
                            end_date = end_date_raw
                        else:
                            end_date = datetime.datetime.strptime(str(end_date_raw)[:10], '%Y-%m-%d').date()
                    except Exception:
                        pass

                description = (exp.get('description') or exp.get('summary') or '').strip()

                # Extract and clean skills
                raw_skills = exp.get('skills') or []
                cleaned_skills = []
                seen_skills = set()
                if isinstance(raw_skills, list):
                    for sk in raw_skills:
                        if isinstance(sk, str) and sk.strip():
                            s_clean = sk.strip()
                            if s_clean.lower() not in seen_skills:
                                seen_skills.add(s_clean.lower())
                                cleaned_skills.append(s_clean)

                StudentExperience.objects.create(
                    student=profile,
                    company_name=company,
                    designation=designation,
                    employment_type=emp_type,
                    location=location,
                    start_date=start_date,
                    end_date=end_date,
                    description=description,
                    skills=cleaned_skills
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
            raise serializers.ValidationError("Please enter a valid email address.")

        value = value.strip().lower()
        if not value or ' ' in value:
            raise serializers.ValidationError("Please enter a valid email address.")

        import re
        parts = value.split('@')
        if len(parts) != 2:
            raise serializers.ValidationError("Please enter a valid email address.")

        username, domain = parts
        if not username or username.startswith('.') or username.endswith('.') or '..' in username:
            raise serializers.ValidationError("Please enter a valid email address.")

        username_regex = r'^[a-z0-9]+([._+-][a-z0-9]+)*$'
        if not re.match(username_regex, username):
            raise serializers.ValidationError("Please enter a valid email address.")

        if not domain or domain.startswith('.') or domain.endswith('.') or '..' in domain:
            raise serializers.ValidationError("Please enter a valid email address.")

        domain_regex = r'^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$'
        if not re.match(domain_regex, domain):
            raise serializers.ValidationError("Please enter a valid email address.")

        domain_labels = domain.split('.')
        sld = domain_labels[0]
        tld = domain_labels[-1]

        if len(sld) < 2 or len(tld) < 2:
            raise serializers.ValidationError("Please enter a valid email address.")

        return value

    def validate(self, attrs):
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
    college_email = serializers.EmailField(write_only=True, required=False, allow_blank=True)
    placement_email = serializers.EmailField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = (
            'id', 'email', 'password', 'full_name',
            'designation', 'official_email', 'mobile_number', 'institution_name',
            'college_email', 'placement_email'
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
        college_email = (
            validated_data.pop('college_email', None) or 
            validated_data.pop('placement_email', None) or 
            official_email
        )
        if isinstance(college_email, str):
            college_email = college_email.strip().lower()

        # User.email is created from validated_data['email'] (Placement Officer Email)
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            role=User.Role.PLACEMENT_OFFICER
        )

        institution = resolve_institution(
            institution_name,
            defaults={
                'address': 'Campus Address',
                'district': 'Default',
                'state': 'Default',
                'pincode': '000000',
                'placement_email': college_email,
                'placement_phone': mobile_number
            }
        )
        if institution and college_email and institution.placement_email != college_email:
            institution.placement_email = college_email
            institution.save(update_fields=['placement_email'])

        profile = PlacementOfficerProfile.objects.create(
            user=user,
            institution=institution,
            full_name=full_name,
            designation=designation,
            official_email=official_email,
            mobile_number=mobile_number
        )

        from placement_officers.models import InstitutionDetails
        InstitutionDetails.objects.get_or_create(
            placement_officer=profile,
            defaults={
                'student_strength': 100,
                'eligible_final_year_students': 100,
                'placement_cell_email': college_email,
                'placement_cell_phone': mobile_number,
                'placement_season': '2026-2027'
            }
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

        # Find user via case-insensitive email lookup across User, StudentContact, RecruiterProfile, and PlacementOfficerProfile
        user_obj = User.objects.filter(email__iexact=email_input).first()
        if not user_obj:
            from django.db.models import Q
            from students.models import StudentContact
            sc = StudentContact.objects.filter(
                Q(primary_email__iexact=email_input) | Q(personal_email__iexact=email_input)
            ).select_related('student__user').first()
            if sc and sc.student and sc.student.user:
                user_obj = sc.student.user

        if not user_obj:
            from recruiters.models import RecruiterProfile
            rp = RecruiterProfile.objects.filter(official_email__iexact=email_input).select_related('user').first()
            if rp and rp.user:
                user_obj = rp.user

        if not user_obj:
            from placement_officers.models import PlacementOfficerProfile
            po = PlacementOfficerProfile.objects.filter(official_email__iexact=email_input).select_related('user').first()
            if po and po.user:
                user_obj = po.user

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
