"""
Project models for student portfolios.
"""
from django.db import models
from django.conf import settings
from profiles.models import StudentProfile


class Project(models.Model):
    """
    Student project model.
    """
    student_profile = models.ForeignKey(
        StudentProfile,
        on_delete=models.CASCADE,
        related_name='projects'
    )
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    tech_stack = models.CharField(max_length=500)  # Comma-separated or JSON string
    github_link = models.URLField(blank=True)
    live_link = models.URLField(blank=True)
    
    # Project metadata
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    # Visibility
    is_public = models.BooleanField(default=True)  # Visible to alumni
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'projects'
        indexes = [
            models.Index(fields=['student_profile', 'is_public']),
            models.Index(fields=['created_at']),
        ]
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.student_profile.user.email} - {self.title}"
