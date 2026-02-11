"""
Serializers for profile models.
"""
from rest_framework import serializers
from .models import StudentProfile, AlumniProfile, Skill, SkillGap, Certificate
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


class StudentProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for StudentProfile.
    """
    user = UserSerializer(read_only=True)
    skills = SkillSerializer(many=True, read_only=True)
    certificates = CertificateSerializer(many=True, read_only=True)
    skill_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Skill.objects.all(),
        source='skills',
        write_only=True,
        required=False
    )
    
    class Meta:
        model = StudentProfile
        fields = (
            'id', 'user', 'university', 'degree', 'batch', 'gpa', 'graduation_year',
            'skills', 'skill_ids', 'certificates', 'resume', 'profile_strength', 'profile_completion_percentage',
            'bio', 'linkedin_url', 'github_url', 'portfolio_url', 'visibility',
            'city', 'country', 'latitude', 'longitude', 'available_for_hire',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'profile_strength', 'profile_completion_percentage', 'created_at', 'updated_at')
    
    def update(self, instance, validated_data):
        # Handle skills separately
        skills = validated_data.pop('skills', None)
        instance = super().update(instance, validated_data)
        
        if skills is not None:
            instance.skills.set(skills)
        
        # Recalculate profile strength
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
    skills = SkillSerializer(many=True, read_only=True)
    skill_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Skill.objects.all(),
        source='skills',
        write_only=True,
        required=False
    )
    
    class Meta:
        model = AlumniProfile
        fields = (
            'id', 'user', 'current_company', 'current_position', 'industry',
            'years_of_experience', 'university', 'degree', 'graduation_year', 'batch',
            'skills', 'skill_ids', 'expertise_areas', 'available_for_mentorship',
            'available_for_referrals', 'linkedin_url', 'bio', 'students_mentored_count',
            'referrals_made_count', 'city', 'country', 'latitude', 'longitude',
            'visibility',
            'created_at', 'updated_at'
        )
        read_only_fields = (
            'id', 'students_mentored_count', 'referrals_made_count',
            'created_at', 'updated_at'
        )
    
    def update(self, instance, validated_data):
        skills = validated_data.pop('skills', None)
        instance = super().update(instance, validated_data)
        
        if skills is not None:
            instance.skills.set(skills)
        
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
