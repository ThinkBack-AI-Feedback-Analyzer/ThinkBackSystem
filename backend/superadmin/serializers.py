from rest_framework import serializers
from institutions.models import Institution
from users.models import User
from .models import AuditLog


class SuperAdminInstitutionSerializer(serializers.ModelSerializer):
    admin_name = serializers.SerializerMethodField()
    admin_email = serializers.SerializerMethodField()
    admin_count = serializers.SerializerMethodField()
    total_users = serializers.SerializerMethodField()

    class Meta:
        model = Institution
        fields = [
            'id', 'institution_name', 'institution_type', 'logo',
            'phone_number', 'address', 'country', 'is_active',
            'created_at', 'updated_at',
            'admin_name', 'admin_email', 'admin_count', 'total_users',
        ]

    def get_admin_name(self, obj):
        admin = obj.users.filter(role='institution_admin').first()
        return admin.full_name if admin else None

    def get_admin_email(self, obj):
        admin = obj.users.filter(role='institution_admin').first()
        return admin.email if admin else None

    def get_admin_count(self, obj):
        return obj.users.filter(role='institution_admin').count()

    def get_total_users(self, obj):
        return obj.users.count()


class SuperAdminUserSerializer(serializers.ModelSerializer):
    institution_name = serializers.SerializerMethodField()
    institution_id   = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'full_name', 'email', 'phone_number', 'designation',
            'role', 'institution_name', 'institution_id',
            'is_active', 'last_login', 'created_at',
        ]

    def get_institution_name(self, obj):
        return obj.institution.institution_name if obj.institution else None

    def get_institution_id(self, obj):
        return obj.institution.id if obj.institution else None


class AuditLogSerializer(serializers.ModelSerializer):
    performed_by_name = serializers.SerializerMethodField()

    class Meta:
        model  = AuditLog
        fields = [
            'id', 'action', 'target_type', 'target_id',
            'target_name', 'performed_by_name', 'created_at',
        ]

    def get_performed_by_name(self, obj):
        return obj.performed_by.full_name if obj.performed_by else 'System'


class SuperAdminStatsSerializer(serializers.Serializer):
    total_institutions = serializers.IntegerField()
    active_institutions = serializers.IntegerField()
    inactive_institutions = serializers.IntegerField()
    total_admins = serializers.IntegerField()
    active_admins = serializers.IntegerField()
    total_users = serializers.IntegerField()
    pending_institutions = serializers.IntegerField()
