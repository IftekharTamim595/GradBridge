"""
Views for projects app.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Project
from .serializers import ProjectSerializer
from .permissions import IsProjectOwnerOrReadOnly
from accounts.permissions import IsStudent, IsAlumni


class ProjectViewSet(viewsets.ModelViewSet):
    """
    ViewSet for Project model.
    """
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated, IsProjectOwnerOrReadOnly]
    search_fields = ['title', 'description', 'tech_stack']
    filterset_fields = ['is_active', 'is_public']
    ordering_fields = ['created_at', 'title']
    
    def get_queryset(self):
        queryset = Project.objects.all()
        student_profile_id = self.request.query_params.get('student_profile')
        user = self.request.user

        if student_profile_id:
            # Filter by specific profile
            queryset = queryset.filter(student_profile_id=student_profile_id)
            
            # If not the owner, only show public projects
            from profiles.models import StudentProfile
            try:
                profile = StudentProfile.objects.get(id=student_profile_id)
                if profile.user != user:
                    queryset = queryset.filter(is_public=True)
            except StudentProfile.DoesNotExist:
                return Project.objects.none()
            
            return queryset

        # Default behavior (no filter)
        if user.is_authenticated:
            if user.is_student:
                from profiles.models import StudentProfile
                try:
                    student_profile = StudentProfile.objects.get(user=user)
                    return Project.objects.filter(student_profile=student_profile)
                except StudentProfile.DoesNotExist:
                    return Project.objects.none()
            elif user.is_alumni or user.is_staff:
                return Project.objects.filter(is_public=True)
        
        return Project.objects.filter(is_public=True)
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_create(self, serializer):
        # Only students can create projects
        if not self.request.user.is_student:
            raise PermissionError("Only students can create projects")
        serializer.save()
