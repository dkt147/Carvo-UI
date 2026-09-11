import { clearSession, getCurrentUser, getToken } from './api/client.js';

const path = window.location.pathname;
const user = getCurrentUser();
const token = getToken();

const isAdminArea = /\/admin(?:\/|$)/.test(path);
const isMinisterArea = /\/minister(?:\/|$)/.test(path);
const isLogin = /\/login\.html$/.test(path) || path.endsWith('/login');

const roleHome = (role) => role === 'MINISTER' ? '/minister/index.html' : '/admin/index.html';

if (!token || !user?.role) {
  if (!isLogin) window.location.replace('/login.html');
} else if (isLogin) {
  window.location.replace(roleHome(user.role));
} else if (isAdminArea && !['ADMIN', 'REVIEWER'].includes(user.role)) {
  window.location.replace('/minister/index.html');
} else if (isMinisterArea && user.role !== 'MINISTER') {
  window.location.replace('/admin/index.html');
}

export const logoutAndGoToLogin = () => {
  clearSession();
  window.location.replace('/login.html');
};
