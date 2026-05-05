from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseDetailView, CourseListCreateView, InstitutionViewSet

router = DefaultRouter()
router.register(r'institutions', InstitutionViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('courses/', CourseListCreateView.as_view()),
    path('courses/<int:course_id>/', CourseDetailView.as_view()),
]
