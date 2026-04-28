"""
Serializers for mentorship app.
"""
from rest_framework import serializers
from .models import MentorshipRequest, ReferralRequest, Message
from profiles.serializers import StudentProfileSerializer, AlumniProfileSerializer
from accounts.serializers import UserSerializer
# Import models at the top to avoid issues with queryset initialization
from profiles.models import StudentProfile, AlumniProfile

class MentorshipRequestSerializer(serializers.ModelSerializer):
    """
    Serializer for MentorshipRequest.
    """
    student_profile = StudentProfileSerializer(read_only=True)
    alumni_profile = AlumniProfileSerializer(read_only=True)
    receiver_id = serializers.PrimaryKeyRelatedField(
        queryset=AlumniProfile.objects.all(),
        source='alumni_profile',
        write_only=True
    )
    
    class Meta:
        model = MentorshipRequest
        fields = (
            'id', 'student_profile', 'alumni_profile', 'receiver_id',
            'message', 'status', 'created_at', 'updated_at', 'responded_at'
        )
        read_only_fields = ('id', 'status', 'created_at', 'updated_at', 'responded_at')


class ReferralRequestSerializer(serializers.ModelSerializer):
    """
    Serializer for ReferralRequest.
    """
    student_profile = StudentProfileSerializer(read_only=True)
    alumni_profile = AlumniProfileSerializer(read_only=True)
    student_profile_id = serializers.PrimaryKeyRelatedField(
        queryset=StudentProfile.objects.none(), # Fixed: changed from None
        source='student_profile',
        write_only=True
    )
    alumni_profile_id = serializers.PrimaryKeyRelatedField(
        queryset=AlumniProfile.objects.none(), # Fixed: changed from None
        source='alumni_profile',
        write_only=True
    )
    
    class Meta:
        model = ReferralRequest
        fields = (
            'id', 'student_profile', 'student_profile_id', 'alumni_profile', 'alumni_profile_id',
            'target_company', 'target_role', 'message', 'status', 'recommendation_letter',
            'created_at', 'updated_at', 'responded_at'
        )
        read_only_fields = ('id', 'status', 'created_at', 'updated_at', 'responded_at')
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get('request')
        if request and request.user:
            if getattr(request.user, 'is_student', False):
                self.fields['student_profile_id'].queryset = StudentProfile.objects.filter(user=request.user)
            self.fields['alumni_profile_id'].queryset = AlumniProfile.objects.all()


class MessageSerializer(serializers.ModelSerializer):
    """
    Serializer for Message.
    """
    sender = UserSerializer(read_only=True)
    receiver = UserSerializer(read_only=True)
    
    class Meta:
        model = Message
        fields = (
            'id', 'mentorship_request', 'sender', 'receiver', 'content',
            'is_read', 'created_at'
        )
        read_only_fields = ('id', 'is_read', 'created_at')