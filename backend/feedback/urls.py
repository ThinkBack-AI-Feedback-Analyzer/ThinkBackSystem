from django.urls import path
from .views import (
    FeedbackFormListCreateView, FeedbackFormDetailView, FormDistributeView,
    FeedbackRespondView, FormAnalyzeView, DashboardStatsView, PublicStatsView,
    AnalysisJobListView,
)

urlpatterns = [
    path('feedback/public-stats/',                   PublicStatsView.as_view()),
    path('feedback/dashboard-stats/',                DashboardStatsView.as_view()),
    path('feedback/forms/',                          FeedbackFormListCreateView.as_view()),
    path('feedback/forms/<int:form_id>/',            FeedbackFormDetailView.as_view()),
    path('feedback/forms/<int:form_id>/distribute/', FormDistributeView.as_view()),
    path('feedback/forms/<int:form_id>/analyze/',    FormAnalyzeView.as_view()),
    path('feedback/forms/<int:form_id>/jobs/',       AnalysisJobListView.as_view()),
    path('feedback/respond/',                        FeedbackRespondView.as_view()),
]
