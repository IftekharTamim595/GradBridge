from django.urls import path
from .views import AnalyzeResumeView, AnalyzeResumeTextView, ChatWithAIView

urlpatterns = [
    path('resume/analyze/', AnalyzeResumeView.as_view(), name='analyze-resume'),
    path('resume-insights/', AnalyzeResumeTextView.as_view(), name='resume-insights'),
    path('chat/', ChatWithAIView.as_view(), name='chat'),
]
