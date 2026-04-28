"""
Admin configuration for accounts app.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'username', 'role', 'is_verified', 'is_approved', 'is_active', 'created_at')
    list_filter = ('role', 'is_verified', 'is_approved', 'is_active', 'created_at')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('-created_at',)
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Custom Fields', {'fields': ('role', 'is_verified', 'is_approved')}),
    )
    
    actions = ['approve_recruiters']
    
    @admin.action(description='Approve selected recruiters')
    def approve_recruiters(self, request, queryset):
        """Approve selected recruiter accounts."""
        # Filter for external/recruiter users only
        recruiters = queryset.filter(role='external', is_approved=False)
        count = recruiters.count()
        
        if count == 0:
            self.message_user(request, "No unapproved recruiters selected.")
            return
        
        # Approve recruiters
        recruiters.update(is_approved=True)
        
        # Send email notifications (optional, in console for dev)
        for user in recruiters:
            # TODO: Send email notification
            # For now, just log it
            print(f"Recruiter approved: {user.email}")
        
        self.message_user(
            request,
            f"Successfully approved {count} recruiter(s)."
        )

