"""
URLs for search app.
"""
from django.urls import path
from .views import AlumniSearchView

app_name = 'search'

urlpatterns = [
    path('alumni/', AlumniSearchView.as_view(), name='alumni-search'),
]
