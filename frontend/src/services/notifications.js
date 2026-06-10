import api from './api'

export const getNotifications = ()   => api.get('/notifications/')
export const getUnreadCount   = ()   => api.get('/notifications/unread-count/')
export const markAsRead       = (id) => api.patch(`/notifications/${id}/read/`)
export const markAllAsRead    = ()   => api.post('/notifications/mark-all-read/')
