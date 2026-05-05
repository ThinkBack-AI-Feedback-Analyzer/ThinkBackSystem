from rest_framework import viewsets, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Course, Institution
from .serializers import CourseSerializer, InstitutionSerializer
from users.permissions import IsInstitutionAdmin


class InstitutionViewSet(viewsets.ModelViewSet):
    queryset = Institution.objects.all()
    serializer_class = InstitutionSerializer
    authentication_classes = []
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)


class CourseListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsInstitutionAdmin]

    def get(self, request):
        courses = Course.objects.filter(institution=request.user.institution)
        return Response(CourseSerializer(courses, many=True).data)

    def post(self, request):
        serializer = CourseSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(institution=request.user.institution)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CourseDetailView(APIView):
    permission_classes = [IsAuthenticated, IsInstitutionAdmin]

    def _get_course(self, course_id, institution):
        try:
            return Course.objects.get(id=course_id, institution=institution)
        except Course.DoesNotExist:
            return None

    def patch(self, request, course_id):
        course = self._get_course(course_id, request.user.institution)
        if not course:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = CourseSerializer(course, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, course_id):
        course = self._get_course(course_id, request.user.institution)
        if not course:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        course.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
