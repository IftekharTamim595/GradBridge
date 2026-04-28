"""
Serializers for profile models.
"""
from rest_framework import serializers
from .models import StudentProfile, AlumniProfile, Skill, SkillGap, Certificate, Experience
from projects.models import Project
from accounts.serializers import UserSerializer
from utils.validators import validate_resume


class SkillSerializer(serializers.ModelSerializer):
    """
    Serializer for Skill model.
    """
    class Meta:
        model = Skill
        fields = ('id', 'name', 'category', 'created_at')
        read_only_fields = ('id', 'created_at')


class CertificateSerializer(serializers.ModelSerializer):
    """
    Serializer for Certificate model.
    """
    class Meta:
        model = Certificate
        fields = ('id', 'student_profile', 'name', 'issuing_organization', 'issue_date', 'expiration_date', 'credential_id', 'credential_url', 'created_at')
        read_only_fields = ('id', 'created_at', 'student_profile')


class ProjectSnippetSerializer(serializers.ModelSerializer):
    """
    Minimal project serializer for nesting.
    """
    class Meta:
        model = Project
        fields = ('id', 'title', 'description', 'tech_stack', 'github_link', 'live_link', 'is_public', 'created_at')


class ExperienceSerializer(serializers.ModelSerializer):
    """
    Serializer for Experience model.
    """
    class Meta:
        model = Experience
        fields = ('id', 'student_profile', 'title', 'company', 'exp_type', 'location', 'start_date', 'end_date', 'is_current', 'description', 'created_at')
        read_only_fields = ('id', 'created_at', 'student_profile')


class StudentProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for StudentProfile.
    """
    user = UserSerializer(read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    certificates = CertificateSerializer(many=True, read_only=True)
    projects = ProjectSnippetSerializer(many=True, read_only=True)
    experiences = ExperienceSerializer(many=True, read_only=True)
    skill_names = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False
    )
    
    city = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    country = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    class Meta:
        model = StudentProfile
        fields = (
            'id', 'user', 'university', 'degree', 'batch', 'gpa', 'graduation_year',
            'skills', 'skill_names', 'resume', 'profile_strength', 'profile_completion_percentage',
            'bio', 'linkedin_url', 'github_url', 'portfolio_url', 'visibility',
            'city', 'country', 'latitude', 'longitude', 'available_for_hire',
            'certificates', 'projects', 'experiences', 'profile_breakdown',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'profile_strength', 'profile_completion_percentage', 'profile_breakdown', 'created_at', 'updated_at')
    
    def update(self, instance, validated_data):
        skill_names = validated_data.pop('skill_names', None)
        instance = super().update(instance, validated_data)
        
        if skill_names is not None:
            skill_objs = []
            for name in skill_names:
                skill, _ = Skill.objects.get_or_create(name=name)
                skill_objs.append(skill)
            instance.skills.set(skill_objs)
        
        instance.calculate_profile_strength()
        return instance

    def validate_resume(self, value):
        if value:
            validate_resume(value)
        return value


class AlumniProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for AlumniProfile.
    """
    user = UserSerializer(read_only=True)
    name = serializers.SerializerMethodField()
    company = serializers.CharField(source='current_company', read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    skill_names = serializers.ListField(
        child=serializers.CharField(),
        write_only=True,
        required=False
    )
    
    city = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    country = serializers.CharField(required=False, allow_null=True, allow_blank=True)

    class Meta:
        model = AlumniProfile
        fields = (
            'id', 'user', 'name', 'company', 'profile_picture', 'current_company', 'current_position', 'industry',
            'years_of_experience', 'university', 'degree', 'graduation_year', 'batch',
            'skills', 'skill_names', 'expertise_areas', 'available_for_mentorship',
            'available_for_referrals', 'linkedin_url', 'bio', 'students_mentored_count',
            'referrals_made_count', 'city', 'country', 'latitude', 'longitude',
            'visibility',
            'created_at', 'updated_at'
        )
        read_only_fields = (
            'id', 'students_mentored_count', 'referrals_made_count',
            'created_at', 'updated_at'
        )

    def get_name(self, obj):
        if obj.user.first_name or obj.user.last_name:
            return f"{obj.user.first_name} {obj.user.last_name}".strip()
        return obj.user.username

    def update(self, instance, validated_data):
        skill_names = validated_data.pop('skill_names', None)
        instance = super().update(instance, validated_data)
        
        if skill_names is not None:
            skill_objs = []
            for name in skill_names:
                skill, _ = Skill.objects.get_or_create(name=name)
                skill_objs.append(skill)
            instance.skills.set(skill_objs)
        
        return instance
    



class SkillGapSerializer(serializers.ModelSerializer):
    """
    Serializer for SkillGap.
    """
    skill = SkillSerializer(read_only=True)
    skill_id = serializers.PrimaryKeyRelatedField(
        queryset=Skill.objects.all(),
        source='skill',
        write_only=True
    )
    
    class Meta:
        model = SkillGap
        fields = ('id', 'student_profile', 'skill', 'skill_id', 'suggested_by', 'priority', 'reason', 'created_at')
        read_only_fields = ('id', 'created_at')
