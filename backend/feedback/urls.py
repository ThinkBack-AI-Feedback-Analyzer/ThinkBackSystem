from django.urls import path
from .views import FeedbackFormListCreateView, FeedbackFormDetailView

urlpatterns = [
    path('feedback/forms/',            FeedbackFormListCreateView.as_view()),
    path('feedback/forms/<int:form_id>/', FeedbackFormDetailView.as_view()),
]
