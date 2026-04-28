"""
URLs for mentorship app.
"""
from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import MentorshipRequestViewSet, ReferralRequestViewSet, MessageViewSet, CreateMentorshipRequestView

router = SimpleRouter()
router.register(r'mentorship-requests', MentorshipRequestViewSet, basename='mentorship-request')
router.register(r'referral-requests', ReferralRequestViewSet, basename='referral-request')
router.register(r'messages', MessageViewSet, basename='message')

urlpatterns = [
    path('request/', CreateMentorshipRequestView.as_view(), name='mentorship-request-create'),
    path('', include(router.urls)),
]
