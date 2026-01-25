"""
Analytics views for admin dashboard.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Q, Avg
from django.utils import timezone
from datetime import timedelta
from accounts.models import User
from profiles.models import StudentProfile, AlumniProfile, Skill
from projects.models import Project
from mentorship.models import MentorshipRequest, ReferralRequest
from accounts.permissions import IsAdmin


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def dashboard_stats(request):
    """
    Get overall platform statistics.
    """
    total_students = StudentProfile.objects.count()
    total_alumni = AlumniProfile.objects.count()
    total_projects = Project.objects.count()
    total_mentorships = MentorshipRequest.objects.count()
    total_referrals = ReferralRequest.objects.count()
    
    active_mentorships = MentorshipRequest.objects.filter(status='accepted').count()
    active_referrals = ReferralRequest.objects.filter(status='accepted').count()
    
    return Response({
        'total_students': total_students,
        'total_alumni': total_alumni,
        'total_projects': total_projects,
        'total_mentorships': total_mentorships,
        'total_referrals': total_referrals,
        'active_mentorships': active_mentorships,
        'active_referrals': active_referrals,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def skill_trends(request):
    """
    Get skill trend analytics.
    """
    # Most popular skills among students
    popular_skills = Skill.objects.annotate(
        student_count=Count('student_profiles')
    ).order_by('-student_count')[:10]
    
    # Most popular skills among alumni
    alumni_skills = Skill.objects.annotate(
        alumni_count=Count('alumni_profiles')
    ).order_by('-alumni_count')[:10]
    
    return Response({
        'popular_student_skills': [
            {'name': skill.name, 'count': skill.student_count}
            for skill in popular_skills
        ],
        'popular_alumni_skills': [
            {'name': skill.name, 'count': skill.alumni_count}
            for skill in alumni_skills
        ],
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def engagement_metrics(request):
    """
    Get engagement metrics.
    """
    # Recent activity (last 30 days)
    thirty_days_ago = timezone.now() - timedelta(days=30)
    
    new_students = StudentProfile.objects.filter(created_at__gte=thirty_days_ago).count()
    new_alumni = AlumniProfile.objects.filter(created_at__gte=thirty_days_ago).count()
    new_projects = Project.objects.filter(created_at__gte=thirty_days_ago).count()
    new_mentorships = MentorshipRequest.objects.filter(created_at__gte=thirty_days_ago).count()
    new_referrals = ReferralRequest.objects.filter(created_at__gte=thirty_days_ago).count()
    
    # Average profile strength
    avg_profile_strength = StudentProfile.objects.aggregate(
        avg_strength=Avg('profile_strength')
    )['avg_strength'] or 0
    
    # Mentorship acceptance rate
    total_mentorship_requests = MentorshipRequest.objects.count()
    accepted_mentorships = MentorshipRequest.objects.filter(status='accepted').count()
    acceptance_rate = (accepted_mentorships / total_mentorship_requests * 100) if total_mentorship_requests > 0 else 0
    
    return Response({
        'recent_activity': {
            'new_students': new_students,
            'new_alumni': new_alumni,
            'new_projects': new_projects,
            'new_mentorships': new_mentorships,
            'new_referrals': new_referrals,
        },
        'average_profile_strength': round(avg_profile_strength, 2),
        'mentorship_acceptance_rate': round(acceptance_rate, 2),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdmin])
def platform_usage(request):
    """
    Get platform usage statistics.
    """
    # Users by role
    users_by_role = User.objects.values('role').annotate(count=Count('id'))
    
    # Projects by status
    projects_by_status = Project.objects.values('is_active').annotate(count=Count('id'))
    
    # Mentorship requests by status
    mentorships_by_status = MentorshipRequest.objects.values('status').annotate(count=Count('id'))
    
    # Referral requests by status
    referrals_by_status = ReferralRequest.objects.values('status').annotate(count=Count('id'))
    
    return Response({
        'users_by_role': list(users_by_role),
        'projects_by_status': list(projects_by_status),
        'mentorships_by_status': list(mentorships_by_status),
        'referrals_by_status': list(referrals_by_status),
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def alumni_analytics(request):
    """
    Get analytics for alumni (their own stats).
    """
    if not request.user.is_alumni:
        return Response(
            {'error': 'Only alumni can access this endpoint'},
            status=403
        )
    
    try:
        alumni_profile = AlumniProfile.objects.get(user=request.user)
    except AlumniProfile.DoesNotExist:
        return Response(
            {'error': 'Alumni profile not found'},
            status=404
        )
    
    # Top skills discovered (skills that students they mentored have)
    mentored_students = StudentProfile.objects.filter(
        mentorship_requests__alumni_profile=alumni_profile,
        mentorship_requests__status='accepted'
    ).distinct()
    
    top_skills = Skill.objects.filter(
        student_profiles__in=mentored_students
    ).annotate(
        count=Count('student_profiles')
    ).order_by('-count')[:5]
    
    return Response({
        'students_mentored': alumni_profile.students_mentored_count,
        'referrals_made': alumni_profile.referrals_made_count,
        'top_skills_discovered': [
            {'name': skill.name, 'count': skill.count}
            for skill in top_skills
        ],
    })
