"""
Views for ML engine endpoints.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import get_object_or_404
from profiles.models import StudentProfile
from .services import (
    ResumeParserService, ProjectRoleMatcherService,
    RecommendationLetterService, StudentSummaryService
)
from accounts.permissions import IsStudent, IsAlumni


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsStudent])
def parse_resume(request):
    """
    Parse resume and extract skills.
    """
    if 'resume' not in request.FILES:
        return Response(
            {'error': 'Resume file is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    resume_file = request.FILES['resume']
    
    parser = ResumeParserService()
    resume_text = parser.extract_text_from_pdf(resume_file)
    
    if not resume_text:
        return Response(
            {'error': 'Could not extract text from resume'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    extracted_skills = parser.extract_skills(resume_text)
    
    return Response({
        'extracted_text_length': len(resume_text),
        'extracted_skills': extracted_skills,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAlumni])
def generate_student_summary(request):
    """
    Generate AI-assisted summary of a student for alumni.
    """
    student_profile_id = request.data.get('student_profile_id')
    if not student_profile_id:
        return Response(
            {'error': 'student_profile_id is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    student_profile = get_object_or_404(StudentProfile, id=student_profile_id)
    
    service = StudentSummaryService()
    summary = service.generate_summary(student_profile)
    
    return Response(summary)


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAlumni])
def match_projects_to_role(request):
    """
    Match student projects to a target role.
    """
    student_profile_id = request.data.get('student_profile_id')
    target_role = request.data.get('target_role', '')
    
    if not student_profile_id:
        return Response(
            {'error': 'student_profile_id is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    student_profile = get_object_or_404(StudentProfile, id=student_profile_id)
    projects = student_profile.projects.all()
    
    projects_data = [
        {
            'id': p.id,
            'title': p.title,
            'description': p.description,
            'tech_stack': p.tech_stack,
        }
        for p in projects
    ]
    
    matcher = ProjectRoleMatcherService()
    matched_projects = matcher.match_projects_to_role(projects_data, target_role)
    
    return Response({
        'target_role': target_role,
        'matched_projects': matched_projects,
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAlumni])
def calculate_resume_score(request):
    """
    Calculate resume score for a target role.
    """
    student_profile_id = request.data.get('student_profile_id')
    target_skills = request.data.get('target_skills', [])
    
    if not student_profile_id:
        return Response(
            {'error': 'student_profile_id is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    student_profile = get_object_or_404(StudentProfile, id=student_profile_id)
    
    if not student_profile.resume:
        return Response(
            {'error': 'Student has not uploaded a resume'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    parser = ResumeParserService()
    resume_text = parser.extract_text_from_pdf(student_profile.resume)
    
    if not resume_text:
        return Response(
            {'error': 'Could not extract text from resume'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    score = parser.calculate_resume_score(resume_text, target_skills)
    
    return Response({
        'resume_score': round(score, 2),
        'target_skills': target_skills,
    })
