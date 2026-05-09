from django.urls import path
from .views import FeedbackFormListCreateView, FeedbackFormDetailView, FormDistributeView, FeedbackRespondView

urlpatterns = [
    path('feedback/forms/',                        FeedbackFormListCreateView.as_view()),
    path('feedback/forms/<int:form_id>/',          FeedbackFormDetailView.as_view()),
    path('feedback/forms/<int:form_id>/distribute/', FormDistributeView.as_view()),
    path('feedback/respond/',                      FeedbackRespondView.as_view()),
]
