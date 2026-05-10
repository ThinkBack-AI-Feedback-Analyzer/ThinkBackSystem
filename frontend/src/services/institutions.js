import api from './api';

export const getInstitutions = () => {
  return api.get('/institutions/');
};

export const getInstitution = (id) => {
  return api.get(`/institutions/${id}/`);
};

export const createInstitution = (data) => {
  return api.post('/institutions/', data);
};

export const getInstitutionSettings = ()       => api.get('/institutions/settings/');
export const updateInstitutionSettings = (data) => api.patch('/institutions/settings/', data);






