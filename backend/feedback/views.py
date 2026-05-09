from django.utils import timezone
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from users.permissions import IsInstitutionAdmin
from students.models import Student
from .models import FeedbackForm, FeedbackQuestion, FormToken, FormResponse, FormAnswer
from .serializers import (
    FeedbackFormSerializer, FeedbackFormWriteSerializer,
    FormResponseWriteSerializer,
)


class FeedbackFormListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        allowed = ['institution_admin', 'coordinator', 'lecturer']
        if request.user.role not in allowed:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        forms = FeedbackForm.objects.filter(institution=request.user.institution)
        return Response(FeedbackFormSerializer(forms, many=True).data)

    def post(self, request):
        allowed = ['institution_admin', 'coordinator', 'lecturer']
        if request.user.role not in allowed:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = FeedbackFormWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(institution=request.user.institution)
        return Response(FeedbackFormSerializer(serializer.instance).data, status=status.HTTP_201_CREATED)


class FeedbackFormDetailView(APIView):
    permission_classes = [IsAuthenticated, IsInstitutionAdmin]

    def _get_form(self, form_id, institution):
        try:
            return FeedbackForm.objects.get(id=form_id, institution=institution)
        except FeedbackForm.DoesNotExist:
            return None

    def get(self, request, form_id):
        form = self._get_form(form_id, request.user.institution)
        if not form:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(FeedbackFormSerializer(form).data)

    def patch(self, request, form_id):
        form = self._get_form(form_id, request.user.institution)
        if not form:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = FeedbackFormWriteSerializer(form, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(FeedbackFormSerializer(serializer.instance).data)

    def delete(self, request, form_id):
        form = self._get_form(form_id, request.user.institution)
        if not form:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        form.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class FormDistributeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, form_id):
        allowed = ['institution_admin', 'coordinator', 'lecturer']
        if request.user.role not in allowed:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        try:
            form = FeedbackForm.objects.get(id=form_id, institution=request.user.institution)
        except FeedbackForm.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        if form.status != 'published':
            return Response({'detail': 'Form must be published before distributing.'}, status=status.HTTP_400_BAD_REQUEST)

        course_ids = request.data.get('course_ids', [])
        send_all   = request.data.get('all', False)

        students = Student.objects.filter(institution=request.user.institution).exclude(email='')
        if not send_all and course_ids:
            students = students.filter(courses__id__in=course_ids).distinct()

        from .tasks import send_feedback_email

        queued = 0
        for student in students:
            token, _ = FormToken.objects.get_or_create(form=form, student=student)
            if not token.is_used and not token.sent_at:
                send_feedback_email.delay(token.id)
                queued += 1

        return Response({'queued': queued, 'total_students': students.count()})


class FeedbackRespondView(APIView):
    permission_classes = [AllowAny]

    def _get_token(self, token_str):
        try:
            return FormToken.objects.select_related('form', 'student').get(token=token_str)
        except (FormToken.DoesNotExist, ValueError):
            return None

    def get(self, request):
        token_str = request.query_params.get('token')
        if not token_str:
            return Response({'detail': 'Token is required.'}, status=status.HTTP_400_BAD_REQUEST)
        ft = self._get_token(token_str)
        if not ft:
            return Response({'detail': 'Invalid token.'}, status=status.HTTP_404_NOT_FOUND)
        if ft.is_used:
            return Response({'detail': 'This form has already been submitted.'}, status=status.HTTP_400_BAD_REQUEST)
        data = FeedbackFormSerializer(ft.form).data
        data['student_name'] = ft.student.full_name
        return Response(data)

    def post(self, request):
        token_str = request.query_params.get('token')
        if not token_str:
            return Response({'detail': 'Token is required.'}, status=status.HTTP_400_BAD_REQUEST)
        ft = self._get_token(token_str)
        if not ft:
            return Response({'detail': 'Invalid token.'}, status=status.HTTP_404_NOT_FOUND)
        if ft.is_used:
            return Response({'detail': 'This form has already been submitted.'}, status=status.HTTP_400_BAD_REQUEST)

        serializer = FormResponseWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        form_response = FormResponse.objects.create(form=ft.form, token=ft)
        for ans in serializer.validated_data['answers']:
            try:
                question = FeedbackQuestion.objects.get(id=ans['question_id'], form=ft.form)
                FormAnswer.objects.create(
                    response=form_response,
                    question=question,
                    answer=ans.get('answer', ''),
                )
            except FeedbackQuestion.DoesNotExist:
                pass

        ft.is_used = True
        ft.used_at = timezone.now()
        ft.save(update_fields=['is_used', 'used_at'])

        return Response({'detail': 'Thank you for your feedback!'}, status=status.HTTP_201_CREATED)
