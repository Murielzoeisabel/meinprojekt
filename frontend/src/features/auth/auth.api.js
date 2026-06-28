import { request, jsonRequest } from '../../shared/lib/apiClient';

export const registerUser = (payload) => jsonRequest('/auth/register', {
  method: 'POST',
  body: payload,
  skipAuthRedirect: true
});

export const loginUser = (payload) => jsonRequest('/auth/login', {
  method: 'POST',
  body: payload,
  skipAuthRedirect: true
});

export const getCurrentUser = () => request('/auth/me', { skipAuthRedirect: true });
export const updateProfile = (payload) => jsonRequest('/auth/me', {
  method: 'PATCH',
  body: payload
});
export const changePassword = (payload) => jsonRequest('/auth/password', {
  method: 'POST',
  body: payload
});
export const logoutUser = () => request('/auth/logout', { method: 'POST' });
