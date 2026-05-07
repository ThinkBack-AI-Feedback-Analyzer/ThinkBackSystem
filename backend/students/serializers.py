from rest_framework import serializers
from .models import Student


class StudentSerializer(serializers.ModelSerializer):
    course_title = serializers.CharField(source='course.title', read_only=True, default='')
    course_code  = serializers.CharField(source='course.code',  read_only=True, default='')

    class Meta:
        model  = Student
        fields = ['id', 'student_id', 'full_name', 'email', 'course', 'course_title', 'course_code', 'created_at']


class StudentWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Student
        fields = ['student_id', 'full_name', 'email', 'course']
