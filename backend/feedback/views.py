from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from users.permissions import IsInstitutionAdmin
from .models import FeedbackForm
from .serializers import FeedbackFormSerializer, FeedbackFormWriteSerializer


class FeedbackFormListCreateView(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsInstitutionAdmin()]

    def get(self, request):
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
