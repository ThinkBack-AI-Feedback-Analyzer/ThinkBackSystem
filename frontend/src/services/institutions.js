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

/** Single atomic endpoint — creates institution + admin in one transaction */
export const registerInstitutionAtomic = (data) => {
  return api.post('/institutions/register/', data);
};

export const getInstitutionSettings = ()       => api.get('/institutions/settings/');
export const updateInstitutionSettings = (data) => api.patch('/institutions/settings/', data);






