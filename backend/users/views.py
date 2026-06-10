import logging
import secrets
from datetime import timedelta
from typing import Any, cast

logger = logging.getLogger(__name__)

from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils import timezone

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import User
from .permissions import IsInstitutionAdmin
from .serializers import (
    AcceptInvitationSerializer,
    CustomTokenObtainPairSerializer,
    ForgotPasswordSerializer,
    InstitutionUserSerializer,
    InviteUserSerializer,
    RegisterSerializer,
    ResendInvitationSerializer,
    ResetPasswordSerializer,
    UpdateStaffSerializer,
    UserSerializer,
    UserProfileSerializer,
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


class InviteUserView(APIView):
    permission_classes = [IsAuthenticated, IsInstitutionAdmin]

    def post(self, request: Any) -> Response:
        serializer = InviteUserSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        token = secrets.token_urlsafe(32)
        expires = timezone.now() + timedelta(days=7)

        user = User(
            full_name=data['full_name'],
            email=data['email'],
            role=data['role'],
            institution=request.user.institution,
            is_active=False,
            invitation_token=token,
            invitation_token_expires=expires,
            must_change_password=True,
        )
        user.set_unusable_password()
        user.save()

        frontend_url = getattr(settings, 'FRONTEND_BASE_URL', 'http://localhost:5173')
        invitation_link = f"{frontend_url}/set-password?token={token}"

        html_message = render_to_string('users/invitation_email.html', {
            'full_name': data['full_name'],
            'invitation_link': invitation_link,
            'role': data['role'].capitalize(),
            'inviter_name': request.user.full_name,
        })

        try:
            send_mail(
                subject="You've been invited to ThinkBack",
                message=f"Hi {data['full_name']},\n\nYou have been invited to join ThinkBack. Set your password here:\n{invitation_link}\n\nThis link expires in 7 days.",
                from_email=getattr(settings, 'EMAIL_FROM', 'noreply@thinkback.com'),
                recipient_list=[data['email']],
                html_message=html_message,
                fail_silently=False,
            )
        except Exception as e:
            logger.exception("Invitation email failed: %s", e)
            user.delete()
            return Response(
                {"detail": "Failed to send invitation email. Please try again."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {"message": "Invitation sent.", "user_id": user.id},
            status=status.HTTP_201_CREATED,
        )


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


class InstitutionUsersView(APIView):
    permission_classes = [IsAuthenticated, IsInstitutionAdmin]

    def get(self, request: Any) -> Response:
        users = User.objects.filter(
            institution=request.user.institution,
        ).exclude(role='institution_admin').order_by('-created_at')

        serializer = InstitutionUserSerializer(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ResendInvitationView(APIView):
    permission_classes = [IsAuthenticated, IsInstitutionAdmin]

    def post(self, request: Any) -> Response:
        serializer = ResendInvitationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(
                id=serializer.validated_data['user_id'],
                institution=request.user.institution,
            )
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        if user.is_active:
            return Response({"detail": "User is already active."}, status=status.HTTP_400_BAD_REQUEST)

        token = secrets.token_urlsafe(32)
        user.invitation_token = token
        user.invitation_token_expires = timezone.now() + timedelta(days=7)
        user.save()

        frontend_url = getattr(settings, 'FRONTEND_BASE_URL', 'http://localhost:5173')
        invitation_link = f"{frontend_url}/set-password?token={token}"

        html_message = render_to_string('users/invitation_email.html', {
            'full_name': user.full_name,
            'invitation_link': invitation_link,
            'role': user.role.capitalize(),
            'inviter_name': request.user.full_name,
        })

        try:
            send_mail(
                subject="Your ThinkBack invitation (resent)",
                message=f"Hi {user.full_name},\n\nHere is your updated invitation link:\n{invitation_link}\n\nThis link expires in 7 days.",
                from_email=getattr(settings, 'EMAIL_FROM', 'noreply@thinkback.com'),
                recipient_list=[user.email],
                html_message=html_message,
                fail_silently=False,
            )
        except Exception:
            return Response(
                {"detail": "Failed to resend invitation email."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response({"message": "Invitation resent."}, status=status.HTTP_200_OK)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Any) -> Response:
        return Response(UserProfileSerializer(request.user).data)

    def patch(self, request: Any) -> Response:
        user = request.user
        user.full_name    = request.data.get('full_name',    user.full_name)
        user.phone_number = request.data.get('phone_number', user.phone_number)
        user.save()
        updated = UserProfileSerializer(user).data
        return Response(updated)


class UserChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Any) -> Response:
        user    = request.user
        current = request.data.get('current_password', '')
        new_pw  = request.data.get('new_password', '')
        confirm = request.data.get('confirm_password', '')

        if not user.check_password(current):
            return Response({'error': 'Current password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)
        if len(new_pw) < 8:
            return Response({'error': 'Password must be at least 8 characters.'}, status=status.HTTP_400_BAD_REQUEST)
        if new_pw != confirm:
            return Response({'error': 'Passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_pw)
        user.save()
        return Response({'message': 'Password changed successfully.'})


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


class UpdateStaffView(APIView):
    permission_classes = [IsAuthenticated, IsInstitutionAdmin]

    def patch(self, request: Any, user_id: int) -> Response:
        try:
            user = User.objects.get(
                id=user_id,
                institution=request.user.institution,
            )
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        if user.role == 'institution_admin':
            return Response({"detail": "Cannot edit this user."}, status=status.HTTP_403_FORBIDDEN)

        serializer = UpdateStaffSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        data = serializer.validated_data
        if 'full_name' in data:
            user.full_name = data['full_name']
        if 'role' in data:
            user.role = data['role']
        user.save()

        return Response(InstitutionUserSerializer(user).data, status=status.HTTP_200_OK)


class DeleteStaffView(APIView):
    permission_classes = [IsAuthenticated, IsInstitutionAdmin]

    def delete(self, request: Any, user_id: int) -> Response:
        try:
            user = User.objects.get(
                id=user_id,
                institution=request.user.institution,
            )
        except User.DoesNotExist:
            return Response({"detail": "User not found."}, status=status.HTTP_404_NOT_FOUND)

        if user.role == 'institution_admin':
            return Response({"detail": "Cannot delete this user."}, status=status.HTTP_403_FORBIDDEN)

        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
