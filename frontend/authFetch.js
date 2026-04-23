const API_BASE_URL = 'http://localhost:3001/api';

const buildUrl = (url) => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return `${API_BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
};

const isAuthEndpoint = (url) => /\/auth\/(login|register|logout)$/.test(url);

const clearAuthCookieAndRedirect = async () => {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  } catch {
    // Ignore logout errors during cleanup.
  }

  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.assign('/login');
  }
};

const authFetch = async (url, options = {}) => {
  const requestUrl = buildUrl(url);
  const response = await fetch(requestUrl, {
    ...options,
    credentials: 'include'
  });

  if (response.status === 401 && !options.skipAuthRedirect && !isAuthEndpoint(requestUrl)) {
    await clearAuthCookieAndRedirect();
  }

  return response;
};

export default authFetch;