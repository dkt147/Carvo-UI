const configuredUrl = String(import.meta.env.VITE_API_URL || '').trim();

if (!configuredUrl) {
  console.warn('[CARVO] VITE_API_URL is not configured.');
}

export const API_URL = configuredUrl.replace(/\/+$/, '');

export const getToken = () => localStorage.getItem('carvo_token');

export const getCurrentUser = () => {
  try {
    const raw = localStorage.getItem('carvo_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setSession = ({ token, user }) => {
  localStorage.setItem('carvo_token', token);
  localStorage.setItem('carvo_user', JSON.stringify(user));
};

export const clearSession = () => {
  localStorage.removeItem('carvo_token');
  localStorage.removeItem('carvo_user');
};

export const apiRequest = async (path, options = {}) => {
  if (!API_URL) throw new Error('CARVO API URL is not configured. Set VITE_API_URL in .env.');

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const headers = new Headers(options.headers || {});
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');

  if (options.body !== undefined && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getToken();
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${normalizedPath}`, {
    ...options,
    headers,
  });

  let payload = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try { payload = await response.json(); } catch { payload = null; }
  } else {
    try { payload = await response.text(); } catch { payload = null; }
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearSession();
    }
    const message = payload?.message || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
};
