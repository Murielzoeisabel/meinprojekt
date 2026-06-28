import { request, jsonRequest } from '../../shared/lib/apiClient';

export const getCommunityPosts = () => request('/community/posts');
export const addCommunityPost = (payload) => jsonRequest('/community/posts', { method: 'POST', body: payload });
export const deleteCommunityPost = (postId) => request(`/community/posts/${postId}`, { method: 'DELETE' });
export const reactToCommunityPost = (postId, type) => jsonRequest(`/community/posts/${postId}/reactions`, {
  method: 'POST',
  body: { type }
});

export const getCommunityMessages = () => request('/community/messages');
export const addCommunityMessage = (payload) => jsonRequest('/community/messages', { method: 'POST', body: payload });
