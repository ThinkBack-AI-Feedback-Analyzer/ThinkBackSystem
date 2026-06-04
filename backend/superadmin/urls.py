from django.urls import path
from . import views

urlpatterns = [
    path('stats/',                          views.SuperAdminStatsView.as_view(),              name='superadmin-stats'),
    path('analytics/',                      views.SuperAdminAnalyticsView.as_view(),           name='superadmin-analytics'),
    path('institutions/',                   views.SuperAdminInstitutionListView.as_view(),    name='superadmin-institutions'),
    path('institutions/<int:pk>/toggle/',   views.SuperAdminInstitutionToggleView.as_view(),  name='superadmin-institution-toggle'),
    path('institutions/<int:pk>/delete/',   views.SuperAdminInstitutionDeleteView.as_view(),  name='superadmin-institution-delete'),
    path('admins/',                         views.SuperAdminAdminListView.as_view(),          name='superadmin-admins'),
    path('admins/<int:pk>/toggle/',         views.SuperAdminAdminToggleView.as_view(),        name='superadmin-admin-toggle'),
    path('users/',                          views.SuperAdminAllUsersView.as_view(),           name='superadmin-users'),
    path('users/<int:pk>/toggle/',          views.SuperAdminUserToggleView.as_view(),         name='superadmin-user-toggle'),
    path('audit/',                          views.SuperAdminAuditLogView.as_view(),           name='superadmin-audit'),
    path('profile/',                        views.SuperAdminProfileView.as_view(),            name='superadmin-profile'),
    path('change-password/',               views.SuperAdminChangePasswordView.as_view(),     name='superadmin-change-password'),
]
