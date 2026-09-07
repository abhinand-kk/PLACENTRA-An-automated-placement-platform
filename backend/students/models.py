from django.db import models
from django.conf import settings
from institutions.models import Institution
from master_data.models import Program, Branch, QualificationType, EmploymentType


class StudentProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='student_profile'
    )
    institution = models.ForeignKey(
        Institution,
        on_delete=models.CASCADE,
        related_name='students'
    )
    register_number = models.CharField(max_length=50, unique=True)
    first_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100)
    gender = models.CharField(max_length=20)
    date_of_birth = models.DateField()
    blood_group = models.CharField(max_length=10)
    profile_photo = models.ImageField(upload_to='student_photos/', blank=True, null=True)
    profile_completion = models.PositiveSmallIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['first_name', 'last_name']

    def __str__(self):
        full_name = f"{self.first_name} {self.middle_name} {self.last_name}".replace("  ", " ").strip()
        return f"{full_name} ({self.register_number})"


class StudentContact(models.Model):
    student = models.OneToOneField(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='contact'
    )
    primary_email = models.EmailField()
    personal_email = models.EmailField()
    mobile_number = models.CharField(max_length=20)
    country = models.CharField(max_length=100, default='India')
    state = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    city = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    permanent_address = models.TextField()

    def __str__(self):
        return f"Contact for {self.student}"


class StudentCurrentEducation(models.Model):
    student = models.OneToOneField(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='current_education'
    )
    program = models.ForeignKey(Program, on_delete=models.RESTRICT, related_name='student_educations')
    branch = models.ForeignKey(Branch, on_delete=models.RESTRICT, related_name='student_educations')
    field_of_study = models.CharField(max_length=150)
    start_date = models.DateField()
    end_date = models.DateField()
    batch = models.CharField(max_length=50)
    semester = models.CharField(max_length=20)
    cgpa = models.DecimalField(max_digits=4, decimal_places=2)
    active_backlogs = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"Current Education ({self.program.name}) - {self.student}"


class StudentPreviousEducation(models.Model):
    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='previous_educations'
    )
    qualification_type = models.ForeignKey(QualificationType, on_delete=models.RESTRICT)
    institution_name = models.CharField(max_length=255)
    board_or_university = models.CharField(max_length=255)
    year_of_passing = models.PositiveIntegerField()
    percentage = models.DecimalField(max_digits=5, decimal_places=2)

    class Meta:
        ordering = ['-year_of_passing']

    def __str__(self):
        return f"{self.qualification_type.name} - {self.student}"


class StudentExperience(models.Model):
    student = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='experiences'
    )
    company_name = models.CharField(max_length=255)
    designation = models.CharField(max_length=150)
    employment_type = models.ForeignKey(EmploymentType, on_delete=models.RESTRICT)
    location = models.CharField(max_length=150)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return f"{self.designation} at {self.company_name} - {self.student}"


class StudentDocument(models.Model):
    student = models.OneToOneField(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='documents'
    )
    resume = models.FileField(upload_to='student_documents/resumes/', blank=True, null=True)
    class10_certificate = models.FileField(upload_to='student_documents/class10/', blank=True, null=True)
    class12_certificate = models.FileField(upload_to='student_documents/class12/', blank=True, null=True)
    degree_marksheet = models.FileField(upload_to='student_documents/degree/', blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Documents - {self.student}"
