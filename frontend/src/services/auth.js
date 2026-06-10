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

export const forgotPassword = (email) => {
  return api.post('/auth/forgot-password/', { email });
};

export const resetPassword = (token, password, passwordConfirm) => {
  return api.post('/auth/reset-password/', { token, password, password_confirm: passwordConfirm });
};
