import { getCurrentUser } from './api/client.js';
import { logoutAndGoToLogin } from './auth-guard.js';

const user = getCurrentUser();
window.CARVO_LOGOUT = logoutAndGoToLogin;
if (user) {
  const mount = document.createElement('div');
  mount.style.cssText = 'position:fixed;top:14px;right:16px;z-index:99999;display:flex;align-items:center;gap:10px;font:12px/1.2 "Source Serif 4",Georgia,serif;color:#6B6A63;background:rgba(252,252,251,.94);border:1px solid #E4E3DC;border-radius:7px;padding:7px 9px;box-shadow:0 2px 10px rgba(46,44,39,.05)';
  const name = document.createElement('span');
  name.textContent = `${user.name || user.email} · ${user.role}`;
  if (user.role === 'MINISTER') {
    const records = document.createElement('a');
    records.href = '/minister/records.html';
    records.textContent = 'Events & outcomes';
    records.style.cssText = 'color:#6B6A63;text-decoration:underline;font:12px "Source Serif 4",Georgia,serif;white-space:nowrap';
    mount.append(name, records);
  } else {
    mount.append(name);
  }
  const btn = document.createElement('button');
  btn.type='button'; btn.textContent='Sign out';
  btn.style.cssText='border:0;background:transparent;color:#C6613F;font:12px "Source Serif 4",Georgia,serif;cursor:pointer;padding:2px 3px';
  btn.addEventListener('click', logoutAndGoToLogin);
  mount.append(btn); document.body.appendChild(mount);
}
