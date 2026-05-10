from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CourseDetailView, CourseListCreateView, InstitutionViewSet, InstitutionSettingsView

router = DefaultRouter()
router.register(r'institutions', InstitutionViewSet)

urlpatterns = [
    path('institutions/settings/', InstitutionSettingsView.as_view()),
    path('', include(router.urls)),
    path('courses/', CourseListCreateView.as_view()),
    path('courses/<int:course_id>/', CourseDetailView.as_view()),
]
