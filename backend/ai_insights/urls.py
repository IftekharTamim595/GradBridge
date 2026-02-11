from django.urls import path
from .views import AnalyzeResumeView

urlpatterns = [
    path('resume/analyze/', AnalyzeResumeView.as_view(), name='analyze-resume'),
    # path('resume/score/', ScoreResumeView.as_view(), name='score-resume'), # Todo: if needed
]
