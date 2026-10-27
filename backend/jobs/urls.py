from rest_framework.routers import DefaultRouter
from .views import JobViewSet, PublicReferenceJobViewSet

router = DefaultRouter()
router.register(r'public-reference', PublicReferenceJobViewSet, basename='public-reference-job')
router.register(r'', JobViewSet, basename='job')

urlpatterns = router.urls
