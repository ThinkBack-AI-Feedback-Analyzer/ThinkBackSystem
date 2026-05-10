from django.utils import timezone
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from users.permissions import IsInstitutionAdmin
from students.models import Student
from .models import FeedbackForm, FeedbackQuestion, FormToken, FormResponse, FormAnswer, AnalysisResult
from .serializers import (
    FeedbackFormSerializer, FeedbackFormWriteSerializer,
    FormResponseWriteSerializer,
)


class PublicStatsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        from institutions.models import Institution, Course as CourseModel
        return Response({
            'institutions': Institution.objects.count(),
            'courses':      CourseModel.objects.count(),
            'active_forms': FeedbackForm.objects.filter(status='published').count(),
            'responses':    FormResponse.objects.count(),
        })


class DashboardStatsView(APIView):
    permission_classes = [IsAuthenticated]

    _allowed = ['institution_admin', 'coordinator', 'lecturer']

    def get(self, request):
        if request.user.role not in self._allowed:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        institution = request.user.institution
        from institutions.models import Course as CourseModel
        from users.models import User

        total_courses   = CourseModel.objects.filter(institution=institution).count()
        total_staff     = User.objects.filter(institution=institution).count()
        active_forms    = FeedbackForm.objects.filter(institution=institution, status='published').count()
        total_responses = FormResponse.objects.filter(form__institution=institution).count()

        analysis_qs = AnalysisResult.objects.filter(form__institution=institution)
        sentiment   = {'positive': 0, 'neutral': 0, 'negative': 0}
        topics_agg  = {}

        for ar in analysis_qs:
            sent = ar.results.get('sentiment_distribution', {})
            for k in sentiment:
                sentiment[k] += sent.get(k, 0)
            for t in ar.results.get('topics', []):
                name = t.get('topic', '')
                topics_agg[name] = topics_agg.get(name, 0) + t.get('count', 0)

        top_topics = sorted(
            [{'topic': k, 'count': v} for k, v in topics_agg.items()],
            key=lambda x: x['count'], reverse=True
        )[:5]

        return Response({
            'total_courses':   total_courses,
            'total_staff':     total_staff,
            'active_forms':    active_forms,
            'total_responses': total_responses,
            'sentiment':       sentiment,
            'top_topics':      top_topics,
        })


class FeedbackFormListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        allowed = ['institution_admin', 'coordinator', 'lecturer']
        if request.user.role not in allowed:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)

        if request.user.role == 'lecturer':
            from institutions.models import Course as CourseModel
            lecturer_courses = CourseModel.objects.filter(
                institution=request.user.institution,
                lecturer=request.user.full_name,
            )
            forms = FeedbackForm.objects.filter(
                institution=request.user.institution,
                tokens__student__courses__in=lecturer_courses,
            ).distinct()
        else:
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


class FormAnalyzeView(APIView):
    permission_classes = [IsAuthenticated]

    _allowed = ['institution_admin', 'coordinator', 'lecturer']

    def _get_form(self, form_id, institution):
        try:
            return FeedbackForm.objects.get(id=form_id, institution=institution)
        except FeedbackForm.DoesNotExist:
            return None

    def post(self, request, form_id):
        if request.user.role not in self._allowed:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        if not self._get_form(form_id, request.user.institution):
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        from .tasks import run_ai_analysis
        run_ai_analysis.delay(form_id)
        return Response({'detail': 'Analysis queued.'}, status=status.HTTP_202_ACCEPTED)

    def get(self, request, form_id):
        if request.user.role not in self._allowed:
            return Response({'detail': 'Permission denied.'}, status=status.HTTP_403_FORBIDDEN)
        if not self._get_form(form_id, request.user.institution):
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        results = AnalysisResult.objects.filter(form_id=form_id).order_by('course_name')
        return Response([
            {
                'course_name': r.course_name,
                'results':     r.results,
                'analyzed_at': r.analyzed_at,
            }
            for r in results
        ])
