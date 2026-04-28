"""
Serializers for search functionality.
"""
from rest_framework import serializers
from profiles.models import AlumniProfile, Skill


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ['id', 'name', 'category']


class AlumniSearchSerializer(serializers.ModelSerializer):
    """
    Serializer for alumni search results.
    Returns minimal card data for search results.
    """
    id = serializers.IntegerField(source='user.id', read_only=True)
    name = serializers.SerializerMethodField()
    email = serializers.EmailField(source='user.email', read_only=True)
    profile_photo = serializers.SerializerMethodField()
    headline = serializers.SerializerMethodField()
    skills = SkillSerializer(many=True, read_only=True)
    location = serializers.SerializerMethodField()
    
    class Meta:
        model = AlumniProfile
        fields = [
            'id', 'name', 'email', 'profile_photo', 'headline',
            'current_company', 'current_position', 'industry',
            'skills', 'location', 'university', 'batch',
            'available_for_mentorship', 'available_for_referrals',
            'years_of_experience'
        ]
    
    def get_name(self, obj):
        """Get full name."""
        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.email
    
    def get_profile_photo(self, obj):
        """Get profile photo URL."""
        if hasattr(obj.user, 'profile_photo') and obj.user.profile_photo:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.user.profile_photo.url)
        return None
    
    def get_headline(self, obj):
        """Create a headline from position and company."""
        parts = []
        if obj.current_position:
            parts.append(obj.current_position)
        if obj.current_company:
            parts.append(f"at {obj.current_company}")
        return " ".join(parts) if parts else "Alumni"
    
    def get_location(self, obj):
        """Get location string."""
        parts = []
        if obj.city:
            parts.append(obj.city)
        if obj.country:
            parts.append(obj.country)
        return ", ".join(parts) if parts else None
