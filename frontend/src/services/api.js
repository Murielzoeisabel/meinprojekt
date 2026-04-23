import authFetch from '../../authFetch';

const parseResponse = async (response) => {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  return response.text();
};

const request = async (url, options = {}) => {
  const response = await authFetch(url, options);

  if (!response.ok) {
    const error = new Error('Request failed');
    error.response = response;
    try {
      error.data = await response.clone().json();
    } catch {
      error.data = await response.clone().text();
    }
    throw error;
  }

  return parseResponse(response);
};

const jsonRequest = (url, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  return request(url, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
};

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
export const logoutUser = () => request('/auth/logout', { method: 'POST' });

export const getCats = () => request('/cats');
export const addCat = (catData) => jsonRequest('/cats', { method: 'POST', body: catData });
export const updateCat = (id, catData) => jsonRequest(`/cats/${id}`, { method: 'PUT', body: catData });
export const deleteCat = (id) => request(`/cats/${id}`, { method: 'DELETE' });

export const getWeights = (catId) => request(`/weights/${catId}`);
export const addWeight = (weightData) => jsonRequest('/weights', { method: 'POST', body: weightData });

export const getCalories = (catId) => request(`/calories/${catId}`);
export const addCalories = (calorieData) => jsonRequest('/calories', { method: 'POST', body: calorieData });

export const getCommunityPosts = () => request('/community/posts');
export const addCommunityPost = (payload) => jsonRequest('/community/posts', { method: 'POST', body: payload });
export const deleteCommunityPost = (postId) => request(`/community/posts/${postId}`, { method: 'DELETE' });
export const reactToCommunityPost = (postId, type) => jsonRequest(`/community/posts/${postId}/reactions`, {
  method: 'POST',
  body: { type }
});

export const getCommunityMessages = () => request('/community/messages');
export const addCommunityMessage = (payload) => jsonRequest('/community/messages', { method: 'POST', body: payload });
