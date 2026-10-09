from django.urls import path
from .views import (
    PlacementOfficerProfileView,
    InstitutionDetailsView,
    PlacementOfficerDashboardView,
    PlacementOfficerStudentListView,
    PlacementOfficerStudentDetailView,
    StudentLoginActivityView,
    PlacementOfficerRecruiterListView,
    PlacementOfficerRecruiterDetailView,
    PlacementOfficerRecruiterApprovalView,
    PlacementOfficerJobListView,
    PlacementOfficerJobApprovalView,
    PlacementOfficerRecentActivityView
)

urlpatterns = [
    path('profile/', PlacementOfficerProfileView.as_view(), name='officer-profile'),
    path('institution/', InstitutionDetailsView.as_view(), name='officer-institution'),
    path('dashboard/', PlacementOfficerDashboardView.as_view(), name='officer-dashboard'),
    path('students/', PlacementOfficerStudentListView.as_view(), name='officer-students'),
    path('students/<int:pk>/', PlacementOfficerStudentDetailView.as_view(), name='officer-student-detail'),
    path('students/login-activity/', StudentLoginActivityView.as_view(), name='officer-student-login-activity'),
    path('recruiters/', PlacementOfficerRecruiterListView.as_view(), name='officer-recruiters'),
    path('recruiters/<int:pk>/', PlacementOfficerRecruiterDetailView.as_view(), name='officer-recruiter-detail'),
    path('recruiters/<int:pk>/approval/', PlacementOfficerRecruiterApprovalView.as_view(), name='officer-recruiter-approval'),
    path('jobs/', PlacementOfficerJobListView.as_view(), name='officer-jobs'),
    path('jobs/<int:pk>/approval/', PlacementOfficerJobApprovalView.as_view(), name='officer-job-approval'),
    path('activity/', PlacementOfficerRecentActivityView.as_view(), name='officer-activity'),
]
