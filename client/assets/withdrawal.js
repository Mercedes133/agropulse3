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
  const form = document.getElementById('withdrawForm');
  const errEl = document.getElementById('withdrawError');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideError(errEl);

    const fd = new FormData(form);
    const amount = Number(fd.get('amount'));
    const momoNumber = String(fd.get('momoNumber') || '').trim();
    if (!Number.isFinite(amount) || amount <= 0) return showError(errEl, 'Enter a valid amount.');
    if (momoNumber.length < 8) return showError(errEl, 'Enter a valid MoMo number.');

    try {
      await api('/api/withdrawals', { method: 'POST', body: { amount, momoNumber } });
      window.location.href = '/dashboard.html';
    } catch (err) {
      showError(errEl, err.message);
    }
  });
});

