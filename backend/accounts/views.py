import random
import datetime
from django.utils import timezone
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView as BaseTokenRefreshView

from .models import User, OTPVerification
from .serializers import (
    StudentRegistrationSerializer,
    RecruiterRegistrationSerializer,
    PlacementOfficerRegistrationSerializer,
    LoginSerializer,
    UserDetailSerializer
)


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


class StudentRegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = StudentRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens_for_user(user)
            user_data = UserDetailSerializer(user).data
            return Response({
                'message': 'Student registered successfully.',
                'user': user_data,
                'tokens': tokens
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RecruiterRegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RecruiterRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens_for_user(user)
            user_data = UserDetailSerializer(user).data
            return Response({
                'message': 'Recruiter registered successfully.',
                'user': user_data,
                'tokens': tokens
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PlacementOfficerRegisterView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = PlacementOfficerRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens_for_user(user)
            user_data = UserDetailSerializer(user).data
            return Response({
                'message': 'Placement Officer registered successfully.',
                'user': user_data,
                'tokens': tokens
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        print("LOGIN VIEW EXECUTED")
        print("REQUEST:", request.data)

        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():
            print("LOGIN SUCCESS")

            user = serializer.validated_data['user']
            user.last_login = timezone.now()
            user.save(update_fields=['last_login'])
            tokens = get_tokens_for_user(user)

            return Response({
                'access': tokens['access'],
                'refresh': tokens['refresh'],
                'role': user.role,
                'user': UserDetailSerializer(user).data
            })

        print("ERROR:", serializer.errors)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SendOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        target_type = request.data.get('target_type')
        contact_value = request.data.get('contact_value')

        if not target_type or not contact_value:
            return Response({'error': 'Target type and contact value are required.'}, status=status.HTTP_400_BAD_REQUEST)

        contact_value = str(contact_value).strip().lower() if 'email' in target_type else str(contact_value).strip()

        # Check resend cooldown (60 seconds)
        latest_otp = OTPVerification.objects.filter(
            target_type=target_type,
            contact_value=contact_value
        ).order_by('-created_at').first()

        if latest_otp and not latest_otp.is_expired():
            seconds_since_created = (timezone.now() - latest_otp.created_at).total_seconds()
            if seconds_since_created < 60:
                remaining = int(60 - seconds_since_created)
                return Response({
                    'error': f'Please wait {remaining} seconds before requesting a new OTP.',
                    'cooldown_remaining': remaining
                }, status=status.HTTP_429_TOO_MANY_REQUESTS)

        # Generate 6-digit OTP
        generated_otp = f"{random.randint(100000, 999999)}"
        expires_at = timezone.now() + datetime.timedelta(minutes=10)

        # Save to DB
        otp_record = OTPVerification.objects.create(
            target_type=target_type,
            contact_value=contact_value,
            otp=generated_otp,
            expires_at=expires_at
        )

        print(f"[OTP DEV LOG] Target: {target_type} | Contact: {contact_value} | OTP: {generated_otp}")

        return Response({
            'message': f'OTP sent successfully to {contact_value}.',
            'target_type': target_type,
            'contact_value': contact_value,
            'otp': generated_otp,  # Development helper
            'expires_in_minutes': 10
        }, status=status.HTTP_200_OK)


class VerifyOTPView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        target_type = request.data.get('target_type')
        contact_value = request.data.get('contact_value')
        submitted_otp = request.data.get('otp')

        if not target_type or not contact_value or not submitted_otp:
            return Response({'error': 'Target type, contact value, and OTP are required.'}, status=status.HTTP_400_BAD_REQUEST)

        contact_value = str(contact_value).strip().lower() if 'email' in target_type else str(contact_value).strip()
        submitted_otp = str(submitted_otp).strip()

        otp_record = OTPVerification.objects.filter(
            target_type=target_type,
            contact_value=contact_value
        ).order_by('-created_at').first()

        if not otp_record:
            return Response({'error': 'No OTP request found for this contact. Please request an OTP first.'}, status=status.HTTP_400_BAD_REQUEST)

        if otp_record.is_verified:
            return Response({'message': 'Contact is already verified.', 'is_verified': True}, status=status.HTTP_200_OK)

        if otp_record.attempts >= 5:
            return Response({'error': 'Maximum incorrect attempts (5) reached. Please request a new OTP.'}, status=status.HTTP_400_BAD_REQUEST)

        if otp_record.is_expired():
            return Response({'error': 'OTP has expired after 10 minutes. Please request a new OTP.'}, status=status.HTTP_400_BAD_REQUEST)

        if otp_record.otp != submitted_otp:
            otp_record.attempts += 1
            otp_record.save()
            remaining_attempts = 5 - otp_record.attempts
            if remaining_attempts <= 0:
                return Response({'error': 'Maximum incorrect attempts (5) reached. Please request a new OTP.'}, status=status.HTTP_400_BAD_REQUEST)
            return Response({'error': f'Invalid OTP code. {remaining_attempts} attempt(s) remaining.'}, status=status.HTTP_400_BAD_REQUEST)

        # Mark as verified
        otp_record.is_verified = True
        otp_record.save()

        return Response({
            'message': 'Contact verified successfully.',
            'target_type': target_type,
            'contact_value': contact_value,
            'is_verified': True
        }, status=status.HTTP_200_OK)


class CheckContactView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        target_type = request.data.get('target_type')
        contact_value = request.data.get('contact_value')

        if not contact_value:
            return Response({'error': 'Contact value is required.'}, status=status.HTTP_400_BAD_REQUEST)

        contact_value = str(contact_value).strip()

        if 'email' in target_type:
            if User.objects.filter(email__iexact=contact_value).exists():
                return Response({'error': 'This email address is already registered.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response({'message': 'Contact value is available.', 'available': True}, status=status.HTTP_200_OK)


class TokenRefreshView(BaseTokenRefreshView):
    permission_classes = [permissions.AllowAny]


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get('refresh')
        if not refresh_token:
            return Response({'error': 'Refresh token is required.'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'message': 'Successfully logged out.'}, status=status.HTTP_200_OK)
        except Exception:
            return Response({'message': 'Successfully logged out.'}, status=status.HTTP_200_OK)


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserDetailSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        confirm_password = request.data.get('confirm_password')

        if not old_password or not new_password or not confirm_password:
            return Response({
                'error': 'Current password, new password, and confirm password are required.'
            }, status=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(old_password):
            return Response({
                'error': 'Current password is incorrect. Please verify and try again.'
            }, status=status.HTTP_400_BAD_REQUEST)

        if new_password != confirm_password:
            return Response({
                'error': 'New password and confirm password do not match.'
            }, status=status.HTTP_400_BAD_REQUEST)

        if len(new_password) < 6:
            return Response({
                'error': 'New password must be at least 6 characters long.'
            }, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        return Response({
            'message': 'Password changed successfully. Your account security credentials have been updated.'
        }, status=status.HTTP_200_OK)
