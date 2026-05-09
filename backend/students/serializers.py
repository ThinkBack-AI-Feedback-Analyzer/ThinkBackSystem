from rest_framework import serializers
from .models import Student
from institutions.models import Course


class CourseSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Course
        fields = ['id', 'title', 'code', 'academic_year']


class StudentSerializer(serializers.ModelSerializer):
    courses = CourseSimpleSerializer(many=True, read_only=True)

    class Meta:
        model  = Student
        fields = ['id', 'student_id', 'full_name', 'email', 'courses', 'created_at']


class StudentWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Student
        fields = ['student_id', 'full_name', 'email', 'courses']
