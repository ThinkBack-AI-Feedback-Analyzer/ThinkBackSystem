from django.urls import path
from .views import StudentListView, StudentBulkCreateView, StudentDetailView

urlpatterns = [
    path('students/',              StudentListView.as_view()),
    path('students/bulk/',         StudentBulkCreateView.as_view()),
    path('students/<int:student_id>/', StudentDetailView.as_view()),
]
