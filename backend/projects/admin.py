"""
Admin configuration for projects app.
"""
from django.contrib import admin
from .models import Project


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('title', 'student_profile', 'is_active', 'is_public', 'created_at')
    list_filter = ('is_active', 'is_public', 'created_at')
    search_fields = ('title', 'description', 'tech_stack', 'student_profile__user__email')
    date_hierarchy = 'created_at'
