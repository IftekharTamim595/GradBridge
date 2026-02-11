from rest_framework import permissions

class IsProjectOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of a project to edit it.
    """

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to the owner of the student profile.
        return obj.student_profile.user == request.user
