from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone
import datetime


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class User(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = 'student', 'Student'
        RECRUITER = 'recruiter', 'Recruiter'
        PLACEMENT_OFFICER = 'placement_officer', 'Placement Officer'

    username = None
    email = models.EmailField(unique=True, verbose_name='email address')

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.STUDENT,
        help_text='Designates the role of the user in PLACENTRA.'
    )
    is_verified = models.BooleanField(
        default=False,
        help_text='Designates whether this user has verified their contact details.'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    objects = UserManager()

    def __str__(self):
        return f"{self.email} ({self.get_role_display()})"


class OTPVerification(models.Model):
    TARGET_TYPES = (
        ('primary_email', 'Primary Email'),
        ('personal_email', 'Personal Email'),
        ('mobile', 'Mobile Number'),
    )

    target_type = models.CharField(max_length=30, choices=TARGET_TYPES)
    contact_value = models.CharField(max_length=255)
    otp = models.CharField(max_length=6)
    attempts = models.IntegerField(default=0)
    max_attempts = models.IntegerField(default=5)
    is_verified = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()

    class Meta:
        ordering = ['-created_at']

    def is_expired(self):
        return timezone.now() > self.expires_at

    def __str__(self):
        return f"{self.target_type}: {self.contact_value} - {self.otp} (Verified: {self.is_verified})"
