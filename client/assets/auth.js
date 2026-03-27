const API_BASE = ''; // same-origin (served by Express)

function setToken(token) {
  localStorage.setItem('agropulse_token', token);
}
function getToken() {
  return localStorage.getItem('agropulse_token');
}
function clearToken() {
  localStorage.removeItem('agropulse_token');
}

async function api(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.message || 'Request failed';
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

function setupPasswordToggles() {
  document.querySelectorAll('[data-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const selector = btn.getAttribute('data-toggle');
      const input = document.querySelector(selector);
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
    });
  });
}

function showError(el, message) {
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
}
function hideError(el) {
  if (!el) return;
  el.hidden = true;
  el.textContent = '';
}

function setupLogin() {
  const form = document.getElementById('loginForm');
  const errEl = document.getElementById('loginError');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError(errEl);

    const fd = new FormData(form);
    const email = String(fd.get('email') || '').trim();
    const password = String(fd.get('password') || '');
    const check = document.getElementById('recaptchaCheck');
    if (check && !check.checked) return showError(errEl, 'Please confirm you are not a robot.');

    try {
      const data = await api('/api/auth/login', { method: 'POST', body: { email, password } });
      setToken(data.token);
      window.location.href = '/dashboard.html';
    } catch (err) {
      showError(errEl, err.message);
    }
  });
}

function setupRegister() {
  const form = document.getElementById('registerForm');
  const errEl = document.getElementById('registerError');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError(errEl);

    const fd = new FormData(form);
    const username = String(fd.get('username') || '').trim();
    const email = String(fd.get('email') || '').trim();
    const password = String(fd.get('password') || '');
    const check = document.getElementById('recaptchaCheck');
    if (check && !check.checked) return showError(errEl, 'Please confirm you are not a robot.');

    try {
      const data = await api('/api/auth/register', {
        method: 'POST',
        body: { username, email, password },
      });
      setToken(data.token);
      window.location.href = '/dashboard.html';
    } catch (err) {
      showError(errEl, err.message);
    }
  });
}

window.__agropulse = { api, getToken, setToken, clearToken };

