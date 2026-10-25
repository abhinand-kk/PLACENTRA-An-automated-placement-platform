from django.urls import path
from .views import InstitutionSearchView

urlpatterns = [
    path('', InstitutionSearchView.as_view(), name='institution-list'),
]
