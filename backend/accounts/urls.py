from django.urls import path
from .views import (
    StudentRegisterView,
    RecruiterRegisterView,
    PlacementOfficerRegisterView,
    LoginView,
    SendOTPView,
    VerifyOTPView,
    CheckContactView,
    TokenRefreshView,
    LogoutView,
    CurrentUserView,
    ChangePasswordView
)

urlpatterns = [
    path('student/register/', StudentRegisterView.as_view(), name='student-register'),
    path('recruiter/register/', RecruiterRegisterView.as_view(), name='recruiter-register'),
    path('placement-officer/register/', PlacementOfficerRegisterView.as_view(), name='placement-officer-register'),
    path('login/', LoginView.as_view(), name='auth-login'),
    path('otp/send/', SendOTPView.as_view(), name='otp-send'),
    path('otp/verify/', VerifyOTPView.as_view(), name='otp-verify'),
    path('otp/check-contact/', CheckContactView.as_view(), name='otp-check-contact'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('logout/', LogoutView.as_view(), name='auth-logout'),
    path('me/', CurrentUserView.as_view(), name='auth-me'),
    path('change-password/', ChangePasswordView.as_view(), name='auth-change-password'),
]
