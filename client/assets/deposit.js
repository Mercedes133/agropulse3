const { api } = window.__agropulse || {};

function showError(el, msg) {
  el.textContent = msg;
  el.hidden = false;
}
function hideError(el) {
  el.hidden = true;
  el.textContent = '';
}

window.addEventListener('DOMContentLoaded', () => {
  // If user returns from Paystack, verify reference before showing anything else.
  const params = new URLSearchParams(window.location.search);
  const ref = params.get('reference');
  if (ref) {
    // Replace URL so refresh doesn't re-verify.
    history.replaceState({}, '', '/deposit.html');
    api(`/api/paystack/verify/${encodeURIComponent(ref)}`)
      .then(() => {
        window.location.href = '/dashboard.html';
      })
      .catch(() => {
        // keep user on deposit page; backend already refused to credit if not verified.
      });
  }

  const form = document.getElementById('depositForm');
  const errEl = document.getElementById('depositError');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError(errEl);

    const fd = new FormData(form);
    const amount = Number(fd.get('amount'));
    if (!Number.isFinite(amount) || amount <= 0) return showError(errEl, 'Enter a valid amount.');

    try {
      const data = await api('/api/paystack/initialize', { method: 'POST', body: { amount } });
      if (!data?.authorizationUrl) return showError(errEl, 'Payment initialization failed.');
      window.location.href = data.authorizationUrl;
    } catch (err) {
      showError(errEl, err.message);
    }
  });
});

