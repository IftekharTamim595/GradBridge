"""
Serializers for authentication and user management.
"""
from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User
from utils.validators import validate_image


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration.
    """
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = ('email', 'username', 'password', 'password_confirm', 'role', 'first_name', 'last_name')
        extra_kwargs = {
            'email': {'required': True},
            'username': {'required': True},
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for user details.
    """
    class Meta:
        model = User
        fields = ('id', 'email', 'username', 'role', 'first_name', 'last_name', 
                  'is_verified', 'created_at', 'updated_at', 'profile_photo')
        read_only_fields = ('id', 'is_verified', 'created_at', 'updated_at')

    def validate_profile_photo(self, value):
        if value:
            validate_image(value)
        return value


class LoginSerializer(serializers.Serializer):
    """
    Serializer for login.
    """
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)
