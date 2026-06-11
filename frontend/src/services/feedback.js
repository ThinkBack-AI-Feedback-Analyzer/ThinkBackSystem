import api from './api'

export const getFeedbackForms   = ()           => api.get('/feedback/forms/')
export const getFeedbackForm    = (id)         => api.get(`/feedback/forms/${id}/`)
export const createFeedbackForm = (data)       => api.post('/feedback/forms/', data)
export const updateFeedbackForm = (id, data)   => api.patch(`/feedback/forms/${id}/`, data)
export const deleteFeedbackForm = (id)         => api.delete(`/feedback/forms/${id}/`)
export const distributeForm     = (id, data)   => api.post(`/feedback/forms/${id}/distribute/`, data)

export const getFormByToken     = (token)      => api.get(`/feedback/respond/?token=${token}`)
export const submitFormResponse = (token, data) => api.post(`/feedback/respond/?token=${token}`, data)

export const analyzeForm        = (id) => api.post(`/feedback/forms/${id}/analyze/`)
export const getAnalysis        = (id) => api.get(`/feedback/forms/${id}/analyze/`)
export const getAnalysisJobs    = (id) => api.get(`/feedback/forms/${id}/jobs/`)
export const getDashboardStats  = ()   => api.get('/feedback/dashboard-stats/')
export const getPublicStats     = ()   => api.get('/feedback/public-stats/')
export const exportForm         = (id, format) => api.get(`/feedback/forms/${id}/export/?format=${format}`, { responseType: 'blob' })
