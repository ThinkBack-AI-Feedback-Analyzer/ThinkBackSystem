from rest_framework import serializers
from .models import Institution


class InstitutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institution
        fields = ('id', 'institution_name', 'institution_type', 'logo', 'phone_number', 'address', 'country', 'is_active', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

    def validate_institution_name(self, value):
        if not value or value.strip() == '':
            raise serializers.ValidationError("Institution name cannot be empty.")
        return value

    def create(self, validated_data):
        institution = Institution.objects.create(**validated_data)
        return institution
