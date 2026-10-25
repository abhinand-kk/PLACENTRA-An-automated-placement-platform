"""
URL configuration for placentra project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/6.0/topics/http/urls/
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse
from django.db import connection
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularSwaggerView,
    SpectacularRedocView,
)

def health_check(request):
    db_status = "healthy"
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1;")
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    status_code = 200 if db_status == "healthy" else 503
    return JsonResponse({
        "status": "healthy" if db_status == "healthy" else "degraded",
        "database": db_status,
        "service": "placentra-api",
    }, status=status_code)

urlpatterns = [
    # System Health Check
    path('health/', health_check, name='health-check-root'),
    path('api/v1/health/', health_check, name='health-check'),

    path('admin/', admin.site.urls),

    # OpenAPI Schema & Interactive API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('api/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # Application API Routes
    path('api/v1/auth/', include('accounts.urls')),
    path('api/v1/students/', include('students.urls')),
    path('api/v1/recruiters/', include('recruiters.urls')),
    path('api/v1/placement-officers/', include('placement_officers.urls')),
    path('api/v1/jobs/', include('jobs.urls')),
    path('api/v1/applications/', include('applications.urls')),
    path('api/v1/interviews/', include('applications.interview_urls')),
    path('api/v1/placement-drives/', include('placement_drives.urls')),
    path('api/v1/institutions/', include('institutions.urls')),

    path('api/v1/notifications/', include('notifications.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
