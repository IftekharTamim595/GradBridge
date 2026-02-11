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
        user = self.request.user
        
        if user.is_student:
            # Students see their own projects
            from profiles.models import StudentProfile
            try:
                student_profile = StudentProfile.objects.get(user=user)
                return Project.objects.filter(student_profile=student_profile)
            except StudentProfile.DoesNotExist:
                return Project.objects.none()
        
        elif user.is_alumni or user.is_admin:
            # Alumni and admins see all public projects
            return Project.objects.filter(is_public=True)
        
        return Project.objects.none()
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def perform_create(self, serializer):
        # Only students can create projects
        if not self.request.user.is_student:
            raise PermissionError("Only students can create projects")
        serializer.save()
