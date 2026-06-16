import logging
import secrets
from datetime import timedelta
from typing import Any

logger = logging.getLogger(__name__)

from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils import timezone

from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from users.models import User
from users.serializers import UserSerializer
from .serializers import (
    AcceptInvitationSerializer,
    CustomTokenObtainPairSerializer,
    ForgotPasswordSerializer,
    RegisterSerializer,
    ResetPasswordSerializer,
)


class RegisterView(APIView):
    """Register a new institution admin — account starts inactive until super admin approves."""
    permission_classes = [AllowAny]

    def post(self, request: Any) -> Response:
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({
                'message': 'Registration submitted successfully. Your account is pending approval by the system administrator. You will receive an email once your institution has been reviewed.'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom login view that uses email instead of username"""
    serializer_class = CustomTokenObtainPairSerializer


class AcceptInvitationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request: Any) -> Response:
        serializer = AcceptInvitationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        try:
            user = User.objects.get(invitation_token=data['token'])
        except User.DoesNotExist:
            return Response(
                {"detail": "Invalid or expired invitation link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user.invitation_token_expires and timezone.now() > user.invitation_token_expires:
            return Response(
                {"detail": "This invitation link has expired. Please ask your administrator to resend the invitation."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(data['password'])
        user.invitation_token = None
        user.invitation_token_expires = None
        user.must_change_password = False
        user.is_active = True
        user.save()

        refresh = RefreshToken.for_user(user)

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': UserSerializer(user).data,
        }, status=status.HTTP_200_OK)


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request: Any) -> Response:
        serializer = ForgotPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        email = serializer.validated_data['email']
        generic_response = Response(
            {"message": "If an account with that email exists, a password reset link has been sent."},
            status=status.HTTP_200_OK,
        )

        try:
            user = User.objects.get(email=email, is_active=True)
        except User.DoesNotExist:
            return generic_response

        token = secrets.token_urlsafe(32)
        user.invitation_token = token
        user.invitation_token_expires = timezone.now() + timedelta(hours=1)
        user.save()

        frontend_url = getattr(settings, 'FRONTEND_BASE_URL', 'http://localhost:5173')
        reset_link = f"{frontend_url}/reset-password?token={token}"

        html_message = render_to_string('users/password_reset_email.html', {
            'full_name': user.full_name,
            'reset_link': reset_link,
        })

        try:
            send_mail(
                subject="Reset your ThinkBack password",
                message=f"Hi {user.full_name},\n\nReset your password here:\n{reset_link}\n\nThis link expires in 1 hour. If you didn't request this, you can ignore this email.",
                from_email=getattr(settings, 'EMAIL_FROM', 'noreply@thinkback.com'),
                recipient_list=[email],
                html_message=html_message,
                fail_silently=True,
            )
        except Exception as e:
            logger.exception("Password reset email failed: %s", e)

        return generic_response


class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request: Any) -> Response:
        serializer = ResetPasswordSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data

        try:
            user = User.objects.get(invitation_token=data['token'], is_active=True)
        except User.DoesNotExist:
            return Response(
                {"detail": "Invalid or expired reset link."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if user.invitation_token_expires and timezone.now() > user.invitation_token_expires:
            user.invitation_token = None
            user.invitation_token_expires = None
            user.save()
            return Response(
                {"detail": "This password reset link has expired. Please request a new one."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.set_password(data['password'])
        user.invitation_token = None
        user.invitation_token_expires = None
        user.save()

        return Response({"message": "Password reset successfully. You can now log in."}, status=status.HTTP_200_OK)
