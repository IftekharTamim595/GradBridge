"""
URLs for mentorship app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MentorshipRequestViewSet, ReferralRequestViewSet, MessageViewSet

router = DefaultRouter()
router.register(r'mentorship-requests', MentorshipRequestViewSet, basename='mentorship-request')
router.register(r'referral-requests', ReferralRequestViewSet, basename='referral-request')
router.register(r'messages', MessageViewSet, basename='message')

urlpatterns = [
    path('', include(router.urls)),
]
