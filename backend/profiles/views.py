"""
Views for profile management.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import StudentProfile, AlumniProfile, Skill, SkillGap
from .serializers import (
    StudentProfileSerializer, AlumniProfileSerializer,
    SkillSerializer, SkillGapSerializer
)
from accounts.permissions import IsStudent, IsAlumni


class SkillViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for Skills (read-only for all authenticated users).
    """
    queryset = Skill.objects.all()
    serializer_class = SkillSerializer
    permission_classes = [IsAuthenticated]
    search_fields = ['name', 'category']
    ordering_fields = ['name', 'created_at']


class StudentProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for StudentProfile.
    """
    serializer_class = StudentProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_student:
            # Students can only see/edit their own profile
            return StudentProfile.objects.filter(user=user)
        elif user.is_alumni or user.is_admin:
            # Alumni and admins can see all student profiles
            return StudentProfile.objects.all()
        return StudentProfile.objects.none()
    
    def get_object(self):
        queryset = self.get_queryset()
        obj = get_object_or_404(queryset, pk=self.kwargs['pk'])
        self.check_object_permissions(self.request, obj)
        return obj
    
    def perform_create(self, serializer):
        # Only students can create their own profile
        if self.request.user.is_student:
            serializer.save(user=self.request.user)
        else:
            raise PermissionError("Only students can create student profiles")
    
    @action(detail=True, methods=['get'])
    def skill_gaps(self, request, pk=None):
        """
        Get skill gap suggestions for a student.
        """
        profile = self.get_object()
        skill_gaps = SkillGap.objects.filter(student_profile=profile).order_by('-priority')
        serializer = SkillGapSerializer(skill_gaps, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def recalculate_strength(self, request, pk=None):
        """
        Recalculate profile strength.
        """
        profile = self.get_object()
        strength = profile.calculate_profile_strength()
        return Response({'profile_strength': strength})


class AlumniProfileViewSet(viewsets.ModelViewSet):
    """
    ViewSet for AlumniProfile.
    """
    serializer_class = AlumniProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_alumni:
            # Alumni can see/edit their own profile and view all alumni profiles
            return AlumniProfile.objects.all()
        elif user.is_student or user.is_admin:
            # Students and admins can see all alumni profiles
            return AlumniProfile.objects.all()
        return AlumniProfile.objects.none()
    
    def perform_create(self, serializer):
        # Only alumni can create their own profile
        if self.request.user.is_alumni:
            serializer.save(user=self.request.user)
        else:
            raise PermissionError("Only alumni can create alumni profiles")
    
    @action(detail=False, methods=['get'])
    def available_mentors(self, request):
        """
        Get alumni available for mentorship.
        """
        queryset = AlumniProfile.objects.filter(available_for_mentorship=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def available_referrers(self, request):
        """
        Get alumni available for referrals.
        """
        queryset = AlumniProfile.objects.filter(available_for_referrals=True)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)
