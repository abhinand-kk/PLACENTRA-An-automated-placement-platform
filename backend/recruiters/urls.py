from django.urls import path
from .views import (
    RecruiterProfileView,
    RecruiterHiringPreferenceView,
    RecruiterDashboardView
)

urlpatterns = [
    path('profile/', RecruiterProfileView.as_view(), name='recruiter-profile'),
    path('hiring-preferences/', RecruiterHiringPreferenceView.as_view(), name='recruiter-hiring-preferences'),
    path('dashboard/', RecruiterDashboardView.as_view(), name='recruiter-dashboard'),
]
