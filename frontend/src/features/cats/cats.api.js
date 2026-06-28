import { request, jsonRequest } from '../../shared/lib/apiClient';

export const getCats = () => request('/cats');
export const addCat = (catData) => jsonRequest('/cats', { method: 'POST', body: catData });
export const updateCat = (id, catData) => jsonRequest(`/cats/${id}`, { method: 'PUT', body: catData });
export const deleteCat = (id) => request(`/cats/${id}`, { method: 'DELETE' });

export const getWeights = (catId) => request(`/weights/${catId}`);
export const addWeight = (weightData) => jsonRequest('/weights', { method: 'POST', body: weightData });

export const getCalories = (catId) => request(`/calories/${catId}`);
export const addCalories = (calorieData) => jsonRequest('/calories', { method: 'POST', body: calorieData });
