from django.urls import path
from .views import (
    StudentProfileView,
    StudentContactView,
    StudentCurrentEducationView,
    StudentPreviousEducationListCreateView,
    StudentPreviousEducationDetailView,
    StudentExperienceListCreateView,
    StudentExperienceDetailView,
    StudentDocumentView,
    StudentDocumentUploadView,
    DigiLockerFetchView,
    StudentProfileCompletionView,
    StudentResumeView,
    StudentResumeDownloadView
)

urlpatterns = [
    path('profile/', StudentProfileView.as_view(), name='student-profile'),
    path('contact/', StudentContactView.as_view(), name='student-contact'),
    path('current-education/', StudentCurrentEducationView.as_view(), name='student-current-education'),
    path('previous-education/', StudentPreviousEducationListCreateView.as_view(), name='student-previous-education-list'),
    path('previous-education/<int:pk>/', StudentPreviousEducationDetailView.as_view(), name='student-previous-education-detail'),
    path('experience/', StudentExperienceListCreateView.as_view(), name='student-experience-list'),
    path('experience/<int:pk>/', StudentExperienceDetailView.as_view(), name='student-experience-detail'),
    path('documents/', StudentDocumentView.as_view(), name='student-documents'),
    path('documents/upload/', StudentDocumentUploadView.as_view(), name='student-document-upload'),
    path('digilocker/fetch/', DigiLockerFetchView.as_view(), name='student-digilocker-fetch'),
    path('profile-completion/', StudentProfileCompletionView.as_view(), name='student-profile-completion'),
    path('resume/', StudentResumeView.as_view(), name='student-resume'),
    path('resume/download/', StudentResumeDownloadView.as_view(), name='student-resume-download'),
]

