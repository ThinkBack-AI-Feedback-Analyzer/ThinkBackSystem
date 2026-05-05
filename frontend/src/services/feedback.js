import api from './api'

export const getFeedbackForms  = ()           => api.get('/feedback/forms/')
export const getFeedbackForm   = (id)         => api.get(`/feedback/forms/${id}/`)
export const createFeedbackForm = (data)      => api.post('/feedback/forms/', data)
export const updateFeedbackForm = (id, data)  => api.patch(`/feedback/forms/${id}/`, data)
export const deleteFeedbackForm = (id)        => api.delete(`/feedback/forms/${id}/`)
