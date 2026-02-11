"""
URLs for accounts app.
"""
from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView, TokenBlacklistView
from .views import register, login, me, UserListView

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login, name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', me, name='me'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('logout/', TokenBlacklistView.as_view(), name='token_blacklist'),
]
