from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import NotificationViewSet, ReportProblemView

router = SimpleRouter()
router.register(r'', NotificationViewSet, basename='notification')

urlpatterns = [
    path('report-problem/', ReportProblemView.as_view(), name='report-problem'),
    path('', include(router.urls)),
]
