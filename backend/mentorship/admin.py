"""
Admin configuration for mentorship app.
"""
from django.contrib import admin
from .models import MentorshipRequest, ReferralRequest, Message


@admin.register(MentorshipRequest)
class MentorshipRequestAdmin(admin.ModelAdmin):
    list_display = ('student_profile', 'alumni_profile', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('student_profile__user__email', 'alumni_profile__user__email')
    date_hierarchy = 'created_at'


@admin.register(ReferralRequest)
class ReferralRequestAdmin(admin.ModelAdmin):
    list_display = ('student_profile', 'alumni_profile', 'target_company', 'target_role', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('student_profile__user__email', 'alumni_profile__user__email', 'target_company', 'target_role')
    date_hierarchy = 'created_at'


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'receiver', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('sender__email', 'receiver__email', 'content')
    date_hierarchy = 'created_at'
