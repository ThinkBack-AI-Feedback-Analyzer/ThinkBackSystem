import calendar
from datetime import date

from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Count

from feedback.models import FormResponse
from institutions.models import Institution
from users.models import User
from users.permissions import IsSystemAdmin
from .models import AuditLog
from .serializers import (
    AuditLogSerializer,
    SuperAdminInstitutionSerializer,
    SuperAdminUserSerializer,
    SuperAdminStatsSerializer,
)


def _log(user, action, target_type, target_id, target_name):
    AuditLog.objects.create(
        performed_by=user,
        action=action,
        target_type=target_type,
        target_id=target_id,
        target_name=target_name,
    )


# ── Stats ────────────────────────────────────────────────────────────────────

class SuperAdminStatsView(APIView):
    permission_classes = [IsAuthenticated, IsSystemAdmin]

    def get(self, request):
        total_institutions  = Institution.objects.count()
        active_institutions = Institution.objects.filter(is_active=True).count()
        inactive_institutions = Institution.objects.filter(is_active=False).count()
        pending_count = Institution.objects.filter(approval_status='pending').count()
        total_admins  = User.objects.filter(role='institution_admin').count()
        active_admins = User.objects.filter(role='institution_admin', is_active=True).count()
        total_users   = User.objects.exclude(role='system_admin').count()

        data = {
            'total_institutions':   total_institutions,
            'active_institutions':  active_institutions,
            'inactive_institutions': inactive_institutions,
            'total_admins':  total_admins,
            'active_admins': active_admins,
            'total_users':   total_users,
            'pending_institutions': pending_count,
        }
        return Response(SuperAdminStatsSerializer(data).data)


# ── Analytics (growth + roles + feedback volume) ─────────────────────────────

class SuperAdminAnalyticsView(APIView):
    permission_classes = [IsAuthenticated, IsSystemAdmin]

    def get(self, request):
        today = timezone.now().date()

        # Growth: institutions registered per month, last 12 months
        growth = []
        for i in range(11, -1, -1):
            m = today.month - i
            y = today.year
            while m <= 0:
                m += 12
                y -= 1
            first = date(y, m, 1)
            last  = date(y, m, calendar.monthrange(y, m)[1])
            count = Institution.objects.filter(
                created_at__date__gte=first,
                created_at__date__lte=last,
            ).count()
            growth.append({'month': first.strftime('%b'), 'year': y, 'count': count})

        # Role distribution
        roles = {
            'institution_admin': User.objects.filter(role='institution_admin').count(),
            'lecturer':          User.objects.filter(role='lecturer').count(),
            'coordinator':       User.objects.filter(role='coordinator').count(),
        }

        # Feedback volume per institution (top 10 by response count)
        volume = list(
            Institution.objects
            .annotate(
                response_count=Count('feedback_forms__responses', distinct=True),
                form_count=Count('feedback_forms', distinct=True),
            )
            .filter(response_count__gt=0)
            .order_by('-response_count')
            .values('id', 'institution_name', 'response_count', 'form_count')[:10]
        )

        return Response({'growth': growth, 'roles': roles, 'feedback_volume': volume})


# ── Institutions ─────────────────────────────────────────────────────────────

class SuperAdminInstitutionListView(APIView):
    permission_classes = [IsAuthenticated, IsSystemAdmin]

    def get(self, request):
        search        = request.query_params.get('search', '')
        status_filter = request.query_params.get('status', '')
        qs = Institution.objects.all().order_by('-created_at')
        if search:
            qs = qs.filter(institution_name__icontains=search)
        if status_filter == 'active':
            qs = qs.filter(is_active=True)
        elif status_filter == 'inactive':
            qs = qs.filter(is_active=False)
        return Response(SuperAdminInstitutionSerializer(qs, many=True, context={'request': request}).data)


class SuperAdminInstitutionToggleView(APIView):
    permission_classes = [IsAuthenticated, IsSystemAdmin]

    def patch(self, request, pk):
        institution = get_object_or_404(Institution, pk=pk)
        institution.is_active = not institution.is_active
        institution.save()
        action = 'activate_institution' if institution.is_active else 'deactivate_institution'
        _log(request.user, action, 'institution', pk, institution.institution_name)
        return Response(SuperAdminInstitutionSerializer(institution, context={'request': request}).data)


class SuperAdminInstitutionDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsSystemAdmin]

    def delete(self, request, pk):
        institution = get_object_or_404(Institution, pk=pk)
        name = institution.institution_name
        institution.delete()
        _log(request.user, 'delete_institution', 'institution', pk, name)
        return Response(status=status.HTTP_204_NO_CONTENT)


# ── Pending / Approve / Reject ────────────────────────────────────────────────

class SuperAdminPendingInstitutionsView(APIView):
    """Return all institutions still awaiting approval (in-app notification source)."""
    permission_classes = [IsAuthenticated, IsSystemAdmin]

    def get(self, request):
        qs = Institution.objects.filter(approval_status='pending').order_by('-created_at')
        return Response(
            SuperAdminInstitutionSerializer(qs, many=True, context={'request': request}).data
        )


class SuperAdminApproveInstitutionView(APIView):
    """Approve a pending institution — activates the institution and its admin account."""
    permission_classes = [IsAuthenticated, IsSystemAdmin]

    def post(self, request, pk):
        institution = get_object_or_404(Institution, pk=pk)

        if institution.approval_status == 'approved':
            return Response({'detail': 'Institution is already approved.'}, status=status.HTTP_400_BAD_REQUEST)

        institution.is_active = True
        institution.approval_status = 'approved'
        institution.save()

        admin_users = list(institution.users.filter(role='institution_admin'))
        institution.users.filter(role='institution_admin').update(is_active=True)

        try:
            from users.emails import send_institution_approved_email
            for admin in admin_users:
                send_institution_approved_email(admin)
        except Exception:
            import logging
            logging.getLogger(__name__).exception("Failed to send approval email")

        _log(request.user, 'approve_institution', 'institution', pk, institution.institution_name)
        return Response(
            SuperAdminInstitutionSerializer(institution, context={'request': request}).data
        )


class SuperAdminRejectInstitutionView(APIView):
    """Reject a pending institution registration."""
    permission_classes = [IsAuthenticated, IsSystemAdmin]

    def post(self, request, pk):
        institution = get_object_or_404(Institution, pk=pk)

        if institution.approval_status == 'rejected':
            return Response({'detail': 'Institution is already rejected.'}, status=status.HTTP_400_BAD_REQUEST)

        institution_name = institution.institution_name
        institution.approval_status = 'rejected'
        institution.is_active = False
        institution.save()

        # Collect pending admin users before deleting them
        pending_admins = list(institution.users.filter(role='institution_admin', is_active=False))

        # Send rejection email BEFORE deleting the accounts
        try:
            from users.emails import send_institution_rejected_email
            for admin in pending_admins:
                send_institution_rejected_email(admin, institution_name)
        except Exception:
            import logging
            logging.getLogger(__name__).exception("Failed to send rejection email")

        # Delete the inactive admin accounts so their email is free for re-registration
        for admin in pending_admins:
            admin.delete()

        _log(request.user, 'reject_institution', 'institution', pk, institution_name)
        return Response(
            SuperAdminInstitutionSerializer(institution, context={'request': request}).data
        )


# ── Institution Admins ────────────────────────────────────────────────────────

class SuperAdminAdminListView(APIView):
    permission_classes = [IsAuthenticated, IsSystemAdmin]

    def get(self, request):
        search        = request.query_params.get('search', '')
        status_filter = request.query_params.get('status', '')
        qs = User.objects.filter(role='institution_admin').select_related('institution').order_by('-created_at')
        if search:
            qs = qs.filter(full_name__icontains=search) | qs.filter(email__icontains=search)
        if status_filter == 'active':
            qs = qs.filter(is_active=True)
        elif status_filter == 'inactive':
            qs = qs.filter(is_active=False)
        return Response(SuperAdminUserSerializer(qs, many=True).data)


class SuperAdminAdminToggleView(APIView):
    permission_classes = [IsAuthenticated, IsSystemAdmin]

    def patch(self, request, pk):
        user = get_object_or_404(User, pk=pk, role='institution_admin')
        user.is_active = not user.is_active
        user.save()
        action = 'activate_user' if user.is_active else 'deactivate_user'
        _log(request.user, action, 'user', pk, user.full_name)
        return Response(SuperAdminUserSerializer(user).data)


class SuperAdminInstitutionDetailView(APIView):
    permission_classes = [IsAuthenticated, IsSystemAdmin]

    def get(self, request, pk):
        institution = get_object_or_404(Institution, pk=pk)
        from .serializers import SuperAdminInstitutionDetailSerializer
        serializer = SuperAdminInstitutionDetailSerializer(institution)
        return Response(serializer.data)


# ── Admins ────────────────────────────────────────────────────────────────────

class SuperAdminAllUsersView(APIView):
    permission_classes = [IsAuthenticated, IsSystemAdmin]

    def get(self, request):
        search         = request.query_params.get('search', '')
        role_filter    = request.query_params.get('role', '')
        status_filter  = request.query_params.get('status', '')
        institution_id = request.query_params.get('institution', '')
        qs = User.objects.exclude(role='system_admin').select_related('institution').order_by('-created_at')
        if search:
            qs = qs.filter(full_name__icontains=search) | qs.filter(email__icontains=search)
        if role_filter:
            qs = qs.filter(role=role_filter)
        if status_filter == 'active':
            qs = qs.filter(is_active=True)
        elif status_filter == 'inactive':
            qs = qs.filter(is_active=False)
        if institution_id:
            qs = qs.filter(institution_id=institution_id)
        return Response(SuperAdminUserSerializer(qs, many=True).data)


class SuperAdminUserToggleView(APIView):
    permission_classes = [IsAuthenticated, IsSystemAdmin]

    def patch(self, request, pk):
        user = get_object_or_404(User.objects.exclude(role='system_admin'), pk=pk)
        user.is_active = not user.is_active
        user.save()
        action = 'activate_user' if user.is_active else 'deactivate_user'
        _log(request.user, action, 'user', pk, user.full_name)
        return Response(SuperAdminUserSerializer(user).data)


# ── Audit Log ─────────────────────────────────────────────────────────────────

class SuperAdminAuditLogView(APIView):
    permission_classes = [IsAuthenticated, IsSystemAdmin]

    def get(self, request):
        action_filter = request.query_params.get('action', '')
        qs = AuditLog.objects.select_related('performed_by').order_by('-created_at')
        if action_filter:
            qs = qs.filter(action=action_filter)
        return Response(AuditLogSerializer(qs[:200], many=True).data)


# ── Profile & Change Password ─────────────────────────────────────────────────

class SuperAdminProfileView(APIView):
    permission_classes = [IsAuthenticated, IsSystemAdmin]

    def get(self, request):
        return Response(SuperAdminUserSerializer(request.user).data)

    def patch(self, request):
        user = request.user
        user.full_name    = request.data.get('full_name',    user.full_name)
        user.phone_number = request.data.get('phone_number', user.phone_number)
        user.save()
        _log(user, 'update_profile', 'profile', user.id, user.full_name)
        return Response(SuperAdminUserSerializer(user).data)


class SuperAdminChangePasswordView(APIView):
    permission_classes = [IsAuthenticated, IsSystemAdmin]

    def post(self, request):
        user        = request.user
        current     = request.data.get('current_password', '')
        new_pw      = request.data.get('new_password', '')
        confirm     = request.data.get('confirm_password', '')

        if not user.check_password(current):
            return Response({'error': 'Current password is incorrect'}, status=status.HTTP_400_BAD_REQUEST)
        if len(new_pw) < 8:
            return Response({'error': 'Password must be at least 8 characters'}, status=status.HTTP_400_BAD_REQUEST)
        if new_pw != confirm:
            return Response({'error': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_pw)
        user.save()
        _log(user, 'change_password', 'profile', user.id, user.full_name)
        return Response({'message': 'Password changed successfully'})
