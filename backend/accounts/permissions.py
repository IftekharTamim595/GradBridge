"""
Custom permissions for role-based access control.
"""
from rest_framework import permissions


class IsStudent(permissions.BasePermission):
    """
    Permission check for Student role.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_student


class IsAlumni(permissions.BasePermission):
    """
    Permission check for Alumni role.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_alumni


class IsAdmin(permissions.BasePermission):
    """
    Permission check for Admin role.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_admin


class IsStudentOrAlumni(permissions.BasePermission):
    """
    Permission check for Student or Alumni role.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.is_student or request.user.is_alumni
        )
