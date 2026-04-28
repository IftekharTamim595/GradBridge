"""
URL configuration for GradBridge project.
"""
from django.contrib import admin
from django.urls import path, include
from accounts.social_auth import GoogleLogin
from django.conf import settings
from django.conf.urls.static import static
from profiles.views import ProfileScoreView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/auth/dj-rest-auth/', include('dj_rest_auth.urls')),
    path('api/auth/registration/', include('dj_rest_auth.registration.urls')),
    path('accounts/', include('allauth.urls')),
    path('api/auth/google/', GoogleLogin.as_view(), name='google_login'),
    path('api/profiles/', include('profiles.urls')),
    path('api/profile/score/', ProfileScoreView.as_view(), name='profile_score'),
    path('api/projects/', include('projects.urls')),
    path('api/mentorship/', include('mentorship.urls')),
    path('api/analytics/', include('analytics.urls')),
    path('api/ml/', include('ml_engine.urls')),
    path('api/community/', include('community.urls')),
    path('api/chat/', include('chat.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/ai/', include('ai_insights.urls')),
    path('api/search/', include('search.urls')),
    path('api/jobs/', include('jobs.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
