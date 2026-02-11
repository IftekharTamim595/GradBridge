"""
User and authentication models.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model with role-based access control.
    """
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('alumni', 'Alumni'),
        ('external', 'External User'),
        ('admin', 'Admin'),
    ]
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    email = models.EmailField(unique=True)
    profile_photo = models.ImageField(upload_to='profile_photos/', null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    is_approved = models.BooleanField(default=False)  # For recruiter approval
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        db_table = 'users'
        indexes = [
            models.Index(fields=['email']),
            models.Index(fields=['role']),
        ]
    
    def __str__(self):
        return f"{self.email} ({self.role})"
    
    @property
    def is_student(self):
        return self.role == 'student'
    
    @property
    def is_alumni(self):
        return self.role == 'alumni'
    
    @property
    def is_admin(self):
        return self.role == 'admin'
    
    @property
    def is_external(self):
        return self.role == 'external'