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
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from superadmin.utils import log_action
from .models import User
from .permissions import IsInstitutionAdmin
from .serializers import (
    InstitutionUserSerializer,
    InviteUserSerializer,
    ResendInvitationSerializer,
    UpdateStaffSerializer,
    UserProfileSerializer,
)


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

        log_action(request.user, 'invite_user', 'user', user.id, user.full_name)
        return Response(
            {"message": "Invitation sent.", "user_id": user.id},
            status=status.HTTP_201_CREATED,
        )


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
        log_action(request.user, 'update_user', 'user', user.id, user.full_name)
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

        log_action(request.user, 'delete_user', 'user', user.id, user.full_name)
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
