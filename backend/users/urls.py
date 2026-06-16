from django.urls import path

from .views import (
    DeleteStaffView,
    InstitutionUsersView,
    InviteUserView,
    ResendInvitationView,
    UpdateStaffView,
    UserChangePasswordView,
    UserProfileView,
)

urlpatterns = [
    path('invite/', InviteUserView.as_view(), name='invite_user'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('profile/change-password/', UserChangePasswordView.as_view(), name='user_change_password'),
    path('institution-users/', InstitutionUsersView.as_view(), name='institution_users'),
    path('resend-invitation/', ResendInvitationView.as_view(), name='resend_invitation'),
    path('staff/<int:user_id>/', UpdateStaffView.as_view(), name='update_staff'),
    path('staff/<int:user_id>/delete/', DeleteStaffView.as_view(), name='delete_staff'),
]
