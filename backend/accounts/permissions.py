from rest_framework import permissions

class IsApprovedRecruiter(permissions.BasePermission):
    """
    Custom permission to only allow approved recruiters to access the view.
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # If user is admin, allow
        if request.user.is_superuser or request.user.role == 'admin':
            return True
            
        # If user is recruiter (external)
        if request.user.role == 'external':
            return request.user.is_approved
            
        return False

class IsStudent(permissions.BasePermission):
    """
    Custom permission to only allow students to access the view.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'student')

class IsAlumni(permissions.BasePermission):
    """
    Custom permission to only allow alumni to access the view.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'alumni')

class IsAdmin(permissions.BasePermission):
    """
    Custom permission to only allow admins to access the view.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.role == 'admin' or request.user.is_superuser))
