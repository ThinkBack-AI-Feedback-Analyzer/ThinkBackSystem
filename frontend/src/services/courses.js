import api from './api'

export const getCourses     = ()           => api.get('/courses/')
export const createCourse   = (data)       => api.post('/courses/', data)
export const updateCourse   = (id, data)   => api.patch(`/courses/${id}/`, data)
export const deleteCourse   = (id)         => api.delete(`/courses/${id}/`)
