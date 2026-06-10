import api from './api';

export const getSuperAdminStats = () =>
  api.get('/superadmin/stats/');

export const getInstitutions = (params = {}) =>
  api.get('/superadmin/institutions/', { params });

export const toggleInstitution = (id) =>
  api.patch(`/superadmin/institutions/${id}/toggle/`);

export const getInstitutionDetails = (id) =>
  api.get(`/superadmin/institutions/${id}/`);

export const deleteInstitution = (id) =>
  api.delete(`/superadmin/institutions/${id}/delete/`);

export const getPendingInstitutions = () =>
  api.get('/superadmin/institutions/pending/');

export const approveInstitution = (id) =>
  api.post(`/superadmin/institutions/${id}/approve/`);

export const rejectInstitution = (id) =>
  api.post(`/superadmin/institutions/${id}/reject/`);

export const getAdmins = (params = {}) =>
  api.get('/superadmin/admins/', { params });

export const toggleAdmin = (id) =>
  api.patch(`/superadmin/admins/${id}/toggle/`);

export const getAllUsers = (params = {}) =>
  api.get('/superadmin/users/', { params });

export const toggleUser = (id) =>
  api.patch(`/superadmin/users/${id}/toggle/`);

export const getAnalytics = () =>
  api.get('/superadmin/analytics/');

export const getAuditLog = (params = {}) =>
  api.get('/superadmin/audit/', { params });

export const getProfile = () =>
  api.get('/superadmin/profile/');

export const updateProfile = (data) =>
  api.patch('/superadmin/profile/', data);

export const changePassword = (data) =>
  api.post('/superadmin/change-password/', data);

export const getContactMessages = () =>
  api.get('/superadmin/contact-messages/');

export const markMessageRead = (id) =>
  api.patch(`/superadmin/contact-messages/${id}/read/`);

export const deleteContactMessage = (id) =>
  api.delete(`/superadmin/contact-messages/${id}/delete/`);
