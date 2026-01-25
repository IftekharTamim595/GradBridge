"""
Admin configuration for profiles app.
"""
from django.contrib import admin
from .models import StudentProfile, AlumniProfile, Skill, SkillGap


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'created_at')
    list_filter = ('category', 'created_at')
    search_fields = ('name', 'category')


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'university', 'degree', 'batch', 'profile_strength', 'created_at')
    list_filter = ('batch', 'graduation_year', 'created_at')
    search_fields = ('user__email', 'user__username', 'university', 'degree')
    filter_horizontal = ('skills',)


@admin.register(AlumniProfile)
class AlumniProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'current_company', 'current_position', 'industry', 
                    'available_for_mentorship', 'available_for_referrals', 'created_at')
    list_filter = ('industry', 'available_for_mentorship', 'available_for_referrals', 'created_at')
    search_fields = ('user__email', 'user__username', 'current_company', 'current_position')
    filter_horizontal = ('skills',)


@admin.register(SkillGap)
class SkillGapAdmin(admin.ModelAdmin):
    list_display = ('student_profile', 'skill', 'priority', 'suggested_by', 'created_at')
    list_filter = ('priority', 'suggested_by', 'created_at')
    search_fields = ('student_profile__user__email', 'skill__name')
