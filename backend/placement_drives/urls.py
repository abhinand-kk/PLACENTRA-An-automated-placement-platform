from rest_framework.routers import DefaultRouter
from .views import PlacementDriveViewSet

router = DefaultRouter()
router.register(r'', PlacementDriveViewSet, basename='placement-drive')

urlpatterns = router.urls
