"""
URLs for ML engine app.
"""
from django.urls import path
from .views import (
    parse_resume, generate_student_summary,
    match_projects_to_role, calculate_resume_score
)

urlpatterns = [
    path('parse-resume/', parse_resume, name='parse-resume'),
    path('student-summary/', generate_student_summary, name='student-summary'),
    path('match-projects/', match_projects_to_role, name='match-projects'),
    path('resume-score/', calculate_resume_score, name='resume-score'),
]
