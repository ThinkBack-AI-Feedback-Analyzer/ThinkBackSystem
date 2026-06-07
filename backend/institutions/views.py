from rest_framework import viewsets, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.throttling import AnonRateThrottle
from django.db import transaction
from django.contrib.auth.hashers import make_password

from .models import Course, Institution
from .serializers import CourseSerializer, InstitutionSerializer
from users.permissions import IsInstitutionAdmin


class RegistrationThrottle(AnonRateThrottle):
    """Limit public institution registration to 5 attempts per hour per IP."""
    rate = '5/hour'


class InstitutionRegisterAtomicView(APIView):
    """
    Single atomic endpoint: creates Institution + institution_admin User in one
    database transaction. If either step fails, both are rolled back — no orphans.
    """
    authentication_classes = []
    permission_classes = [AllowAny]
    throttle_classes = [RegistrationThrottle]

    def post(self, request):
        from users.serializers import RegisterSerializer
        from users.models import User

        # ── Validate both sets of data before touching the DB ──────────────────
        inst_data = {
            'institution_name': request.data.get('institution_name', ''),
            'institution_type': request.data.get('institution_type', ''),
            'phone_number':     request.data.get('phone_number', ''),
            'address':          request.data.get('address', ''),
            'country':          request.data.get('country', ''),
        }
        inst_serializer = InstitutionSerializer(data=inst_data)
        if not inst_serializer.is_valid():
            return Response({'institution_errors': inst_serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        # Pre-validate admin fields before creating anything
        admin_email = request.data.get('admin_email', '').strip()
        admin_name  = request.data.get('admin_name',  '').strip()
        admin_phone = request.data.get('admin_phone', '').strip() or None
        password    = request.data.get('password', '')
        password_confirm = request.data.get('password_confirm', '')

        errors = {}
        if not admin_name:
            errors['admin_name'] = 'Admin name is required.'
        if not admin_email:
            errors['admin_email'] = 'Admin email is required.'
        if not password or len(password) < 8:
            errors['password'] = 'Password must be at least 8 characters.'
        if password != password_confirm:
            errors['password_confirm'] = 'Passwords do not match.'

        # Allow re-registration if the previous attempt was rejected
        existing_user = User.objects.filter(email=admin_email).first()
        if existing_user:
            inst = getattr(existing_user, 'institution', None)
            if inst and inst.approval_status == 'rejected':
                # Clean up the rejected attempt so the new one can proceed
                inst.delete()   # cascades to the old inactive user via SET_NULL, so delete user explicitly
                existing_user.delete()
            else:
                errors['admin_email'] = 'This email is already registered.'

        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        # ── Create both inside a single transaction ────────────────────────────
        try:
            with transaction.atomic():
                # Handle logo upload
                logo = request.FILES.get('logo')
                institution = inst_serializer.save(
                    is_active=False,
                    approval_status='pending',
                    **({'logo': logo} if logo else {}),
                )

                admin_user = User(
                    full_name=admin_name,
                    email=admin_email,
                    phone_number=admin_phone,
                    role='institution_admin',
                    institution=institution,
                    is_active=False,
                )
                admin_user.set_password(password)
                admin_user.save()

        except Exception as exc:
            import logging
            logging.getLogger(__name__).exception("Atomic registration failed: %s", exc)
            return Response(
                {'detail': 'Registration failed due to a server error. Please try again.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {'message': 'Registration submitted successfully. Your account is pending approval by the system administrator. You will receive an email once your institution has been reviewed.'},
            status=status.HTTP_201_CREATED,
        )


class InstitutionSettingsView(APIView):
    permission_classes = [IsAuthenticated, IsInstitutionAdmin]

    def get(self, request):
        inst = request.user.institution
        if not inst:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(InstitutionSerializer(inst).data)

    def patch(self, request):
        inst = request.user.institution
        if not inst:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = InstitutionSerializer(inst, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


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
    def get_permissions(self):
        if self.request.method == 'GET':
            return [IsAuthenticated()]
        return [IsAuthenticated(), IsInstitutionAdmin()]

    def get(self, request):
        role = request.user.role
        if role == 'institution_admin':
            courses = Course.objects.filter(institution=request.user.institution)
        elif role == 'coordinator':
            courses = Course.objects.filter(
                institution=request.user.institution,
                coordinator=request.user.full_name,
            )
        elif role == 'lecturer':
            courses = Course.objects.filter(
                institution=request.user.institution,
                lecturer=request.user.full_name,
            )
        else:
            return Response([], status=status.HTTP_200_OK)
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
