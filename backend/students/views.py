from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from institutions.models import Course
from .models import Student
from .serializers import StudentSerializer


class StudentListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        role = request.user.role
        qs   = Student.objects.filter(institution=request.user.institution).prefetch_related('courses')

        if role == 'coordinator':
            courses = Course.objects.filter(
                institution=request.user.institution,
                coordinator=request.user.full_name,
            )
            qs = qs.filter(courses__in=courses)
        elif role == 'lecturer':
            courses = Course.objects.filter(
                institution=request.user.institution,
                lecturer=request.user.full_name,
            )
            qs = qs.filter(courses__in=courses)
        elif role != 'institution_admin':
            return Response([], status=status.HTTP_200_OK)

        course_id = request.query_params.get('course')
        if course_id:
            qs = qs.filter(courses__id=course_id).distinct()

        return Response(StudentSerializer(qs, many=True).data)


class StudentBulkCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        rows      = request.data.get('students', [])
        course_id = request.data.get('course_id') or None

        created = updated = 0
        errors  = []

        for item in rows:
            sid  = str(item.get('student_id', '')).strip()
            name = str(item.get('full_name',  '')).strip()
            if not sid or not name:
                errors.append(f"Skipped row — missing student_id or full_name: {item}")
                continue
            try:
                student, was_created = Student.objects.update_or_create(
                    institution=request.user.institution,
                    student_id=sid,
                    defaults={
                        'full_name': name,
                        'email':     str(item.get('email', '')).strip(),
                    },
                )
                if course_id:
                    student.courses.add(course_id)
                if was_created:
                    created += 1
                else:
                    updated += 1
            except Exception as exc:
                errors.append(str(exc))

        return Response({'created': created, 'updated': updated, 'errors': errors},
                        status=status.HTTP_201_CREATED)


class StudentDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, student_id):
        try:
            student = Student.objects.get(id=student_id, institution=request.user.institution)
            student.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        except Student.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
