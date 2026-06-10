from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    AcceptInvitationView,
    CustomTokenObtainPairView,
    DeleteStaffView,
    ForgotPasswordView,
    InstitutionUsersView,
    InviteUserView,
    RegisterView,
    ResendInvitationView,
    ResetPasswordView,
    UpdateStaffView,
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('invite/', InviteUserView.as_view(), name='invite_user'),
    path('accept-invitation/', AcceptInvitationView.as_view(), name='accept_invitation'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    path('institution-users/', InstitutionUsersView.as_view(), name='institution_users'),
    path('resend-invitation/', ResendInvitationView.as_view(), name='resend_invitation'),
    path('staff/<int:user_id>/', UpdateStaffView.as_view(), name='update_staff'),
    path('staff/<int:user_id>/delete/', DeleteStaffView.as_view(), name='delete_staff'),
]
