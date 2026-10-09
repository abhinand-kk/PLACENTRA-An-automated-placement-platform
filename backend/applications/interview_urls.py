from rest_framework.routers import DefaultRouter
from .views import InterviewViewSet

router = DefaultRouter()
router.register(r'', InterviewViewSet, basename='interview-direct')

urlpatterns = router.urls
