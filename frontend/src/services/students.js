import api from './api'

export const getStudents    = (params) => api.get('/students/', { params })
export const bulkCreate     = (data)   => api.post('/students/bulk/', data)
export const deleteStudent  = (id)     => api.delete(`/students/${id}/`)
