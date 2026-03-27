const { api } = window.__agropulse || {};

function show(el, msg) {
  el.textContent = msg;
  el.hidden = false;
}
function hide(el) {
  el.hidden = true;
  el.textContent = '';
}

window.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('manualPayForm');
  const errEl = document.getElementById('manualPayError');
  const okEl = document.getElementById('manualPayOk');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hide(errEl);
    hide(okEl);

    const fd = new FormData(form);
    const username = String(fd.get('username') || '').trim();
    const email = String(fd.get('email') || '').trim();
    const amount = Number(fd.get('amount'));
    if (!username) return show(errEl, 'Username is required.');
    if (!email.includes('@')) return show(errEl, 'Valid email is required.');
    if (!Number.isFinite(amount) || amount <= 0) return show(errEl, 'Enter a valid amount.');

    try {
      await api('/api/manual-payments', { method: 'POST', body: { username, email, amount } });
      form.reset();
      show(okEl, 'Submitted. Your manual payment is pending admin approval.');
    } catch (err) {
      show(errEl, err.message);
    }
  });
});

