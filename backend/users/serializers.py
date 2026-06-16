from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):
    institution_name = serializers.SerializerMethodField()

    def get_institution_name(self, obj):
        if obj.institution:
            return obj.institution.institution_name
        return None

    class Meta:
        model = User
        fields = ('id', 'full_name', 'email', 'phone_number', 'role', 'institution', 'institution_name', 'is_active', 'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at')


class InviteUserSerializer(serializers.Serializer):
    full_name = serializers.CharField(required=True, allow_blank=False)
    email = serializers.EmailField(required=True)
    role = serializers.ChoiceField(choices=['lecturer', 'coordinator'])

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("A user with this email already exists.")
        return value


class InstitutionUserSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'full_name', 'email', 'role', 'is_active', 'status', 'created_at')
        read_only_fields = ('created_at',)

    def get_status(self, obj):
        if not obj.is_active and obj.invitation_token:
            return 'Invited'
        return 'Active'


class ResendInvitationSerializer(serializers.Serializer):
    user_id = serializers.IntegerField(required=True)


class UpdateStaffSerializer(serializers.Serializer):
    full_name = serializers.CharField(required=False, allow_blank=False)
    role = serializers.ChoiceField(choices=['lecturer', 'coordinator'], required=False)

    def validate(self, data):
        if not data:
            raise serializers.ValidationError("Nothing to update.")
        return data


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'full_name', 'email', 'phone_number', 'role', 'is_active', 'last_login', 'created_at')
        read_only_fields = ('id', 'email', 'role', 'is_active', 'last_login', 'created_at')
