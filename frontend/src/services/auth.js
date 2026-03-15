import api from './api';

export const login = (email, password) => {
  return api.post('/auth/login/', { email, password });
};

export const register = (data) => {
  return api.post('/auth/register/', data);
};

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};
