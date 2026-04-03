import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

export const getCats = () => api.get('/cats').then(res => res.data);
export const addCat = (catData) => api.post('/cats', catData).then(res => res.data);
export const updateCat = (id, catData) => api.put(`/cats/${id}`, catData).then(res => res.data);
export const deleteCat = (id) => api.delete(`/cats/${id}`).then(res => res.data);

export const getWeights = (catId) => api.get(`/weights/${catId}`).then(res => res.data);
export const addWeight = (weightData) => api.post('/weights', weightData).then(res => res.data);

export const getCalories = (catId) => api.get(`/calories/${catId}`).then(res => res.data);
export const addCalories = (calorieData) => api.post('/calories', calorieData).then(res => res.data);

export const getCommunityPosts = () => api.get('/community/posts').then(res => res.data);
export const addCommunityPost = (payload) => api.post('/community/posts', payload).then(res => res.data);
export const deleteCommunityPost = (postId) => api.delete(`/community/posts/${postId}`).then(res => res.data);
export const reactToCommunityPost = (postId, type) =>
  api.post(`/community/posts/${postId}/reactions`, { type }).then(res => res.data);

export const getCommunityMessages = () => api.get('/community/messages').then(res => res.data);
export const addCommunityMessage = (payload) => api.post('/community/messages', payload).then(res => res.data);

export default api;
