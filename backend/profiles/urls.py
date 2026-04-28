"""
URLs for profiles app.
"""
from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import StudentProfileViewSet, AlumniProfileViewSet, SkillViewSet, CertificateViewSet, ExperienceViewSet

router = SimpleRouter()
router.register(r'students', StudentProfileViewSet, basename='student-profile')
router.register(r'alumni', AlumniProfileViewSet, basename='alumni-profile')
router.register(r'skills', SkillViewSet, basename='skill')
router.register(r'certificates', CertificateViewSet, basename='certificate')
router.register(r'experiences', ExperienceViewSet, basename='experience')

urlpatterns = [
    path('', include(router.urls)),
]
