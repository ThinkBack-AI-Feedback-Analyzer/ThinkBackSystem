import api from './api'

export const inviteUser = (data) => api.post('/auth/invite/', data)

export const getInstitutionUsers = () => api.get('/auth/institution-users/')

export const resendInvitation = (userId) =>
  api.post('/auth/resend-invitation/', { user_id: userId })

export const acceptInvitation = (token, password, passwordConfirm) =>
  api.post('/auth/accept-invitation/', {
    token,
    password,
    password_confirm: passwordConfirm,
  })

export const updateStaff = (userId, data) =>
  api.patch(`/auth/staff/${userId}/`, data)

export const deleteStaff = (userId) =>
  api.delete(`/auth/staff/${userId}/delete/`)

export const getMyProfile = () =>
  api.get('/auth/profile/')

export const updateMyProfile = (data) =>
  api.patch('/auth/profile/', data)

export const changeMyPassword = (data) =>
  api.post('/auth/profile/change-password/', data)
