import authFetch from './authFetch';

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

export const request = async (url, options = {}) => {
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

export const jsonRequest = (url, options = {}) => {
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
