from django.urls import path
from .views import (
    PlacementOfficerProfileView,
    InstitutionDetailsView,
    PlacementOfficerDashboardView,
    PlacementOfficerStudentListView
)

urlpatterns = [
    path('profile/', PlacementOfficerProfileView.as_view(), name='officer-profile'),
    path('institution/', InstitutionDetailsView.as_view(), name='officer-institution'),
    path('dashboard/', PlacementOfficerDashboardView.as_view(), name='officer-dashboard'),
    path('students/', PlacementOfficerStudentListView.as_view(), name='officer-students'),
]
