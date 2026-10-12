import { apiRequest, clearSession, setSession } from './client.js';

export const login = async (email, password) => {
  const payload = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  const user = payload?.data?.user;
  const token = payload?.data?.token;

  if (!payload?.success || !user || !token) {
    throw new Error(payload?.message || 'Login response was not valid.');
  }

  setSession({ token, user });
  return user;
};

export const logout = () => {
  clearSession();
};
