from rest_framework import serializers
from .models import Project
from profiles.serializers import StudentProfileSerializer
from profiles.models import StudentProfile

class ProjectSerializer(serializers.ModelSerializer):
    """
    Serializer for Project model.
    """
    student_profile = StudentProfileSerializer(read_only=True)
    student_profile_id = serializers.PrimaryKeyRelatedField(
        queryset=StudentProfile.objects.all(),
        source='student_profile',
        write_only=True,
        required=False
    )
    
    class Meta:
        model = Project
        fields = (
            'id', 'student_profile', 'student_profile_id', 'title', 'description',
            'tech_stack', 'github_link', 'live_link', 'start_date', 'end_date',
            'is_active', 'is_public', 'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'created_at', 'updated_at')
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Dynamic queryset based on request
        request = self.context.get('request')
        if request and hasattr(request.user, 'is_student') and request.user.is_student:
            self.fields['student_profile_id'].queryset = StudentProfile.objects.filter(user=request.user)

    def create(self, validated_data):
        request = self.context.get('request')
        if request and request.user.is_authenticated and getattr(request.user, 'is_student', False):
            student_profile, _ = StudentProfile.objects.get_or_create(user=request.user)
            validated_data['student_profile'] = student_profile
        
        project = super().create(validated_data)
        
        if project.student_profile:
            project.student_profile.calculate_profile_strength()
        
        return project

    def update(self, instance, validated_data):
        project = super().update(instance, validated_data)
        if project.student_profile:
            project.student_profile.calculate_profile_strength()
        return project