from typing import Any, Dict
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, required=True, min_length=8)
    email = serializers.EmailField(required=True, allow_blank=False)
    full_name = serializers.CharField(required=True, allow_blank=False)

    class Meta:
        model = User
        fields = ('full_name', 'email', 'password', 'password_confirm', 'phone_number', 'designation', 'role', 'institution')

    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords do not match."})
        
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({"email": "This email is already registered."})
        
        return data

    def create(self, validated_data: Dict[str, Any]) -> User:
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        user: User = User.objects.create(**validated_data)
        user.set_password(password)
        user.save()
        
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'full_name', 'email', 'phone_number', 'designation', 'role', 'institution', 'is_active', 'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at')


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom serializer that allows login with email instead of username"""
    email = serializers.EmailField(write_only=True, required=True)
    password = serializers.CharField(write_only=True, required=True)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Remove username from required fields
        self.fields.pop('username', None)

    def validate(self, attrs: Dict[str, Any]) -> Dict[str, Any]:
        email = attrs.get('email')
        password = attrs.get('password')

        if not email or not password:
            raise serializers.ValidationError({
                "detail": "Email and password are required."
            })

        # Find user by email
        try:
            user: User = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({"email": "User not found."})

        # Verify password
        if not user.check_password(password):
            raise serializers.ValidationError({"password": "Invalid password."})
        
        if not user.is_active:
            raise serializers.ValidationError({"detail": "User account is inactive."})

        # Generate tokens
        refresh = RefreshToken.for_user(user)
        
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        }


