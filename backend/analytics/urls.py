"""
URLs for analytics app.
"""
from django.urls import path
from .views import (
    dashboard_stats, skill_trends, engagement_metrics,
    platform_usage, alumni_analytics
)

urlpatterns = [
    path('dashboard/', dashboard_stats, name='dashboard-stats'),
    path('skill-trends/', skill_trends, name='skill-trends'),
    path('engagement/', engagement_metrics, name='engagement-metrics'),
    path('usage/', platform_usage, name='platform-usage'),
    path('alumni/', alumni_analytics, name='alumni-analytics'),
]
