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

export const getFaculties = () => {
  return api.get('/faculties/');
};

export const getFaculty = (id) => {
  return api.get(`/faculties/${id}/`);
};

export const createFaculty = (data) => {
  return api.post('/faculties/', data);
};

export const getDepartments = () => {
  return api.get('/departments/');
};

export const getDepartment = (id) => {
  return api.get(`/departments/${id}/`);
};

export const createDepartment = (data) => {
  return api.post('/departments/', data);
};
