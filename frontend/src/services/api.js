import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

export const getCats = () => api.get('/cats').then(res => res.data);
export const addCat = (catData) => api.post('/cats', catData).then(res => res.data);
export const deleteCat = (id) => api.delete(`/cats/${id}`).then(res => res.data);

export const getWeights = (catId) => api.get(`/weights/${catId}`).then(res => res.data);
export const addWeight = (weightData) => api.post('/weights', weightData).then(res => res.data);

export const getCalories = (catId) => api.get(`/calories/${catId}`).then(res => res.data);
export const addCalories = (calorieData) => api.post('/calories', calorieData).then(res => res.data);

export default api;
