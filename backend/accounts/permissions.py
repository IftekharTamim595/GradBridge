"""
Custom permissions for GradBridge.
"""
from rest_framework import permissions


class IsApprovedRecruiter(permissions.BasePermission):
    """
    Permission check for recruiter approval.
    Allows access only if user is a recruiter AND is_approved=True.
    """
    message = "Your recruiter account is pending admin approval. Please wait for approval to access this feature."
    
    def has_permission(self, request, view):
        return (
            request.user and
            request.user.is_authenticated and
            request.user.role == 'external' and
            request.user.is_approved
        )


class IsStudent(permissions.BasePermission):
    """Check if user is a student."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'student'


class IsAlumni(permissions.BasePermission):
    """Check if user is an alumni."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.role == 'alumni'


class IsAdmin(permissions.BasePermission):
    """Check if user is an admin (staff/superuser)."""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (request.user.is_staff or request.user.is_superuser)
