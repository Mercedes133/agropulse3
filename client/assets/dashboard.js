const { api, clearToken } = window.__agropulse || {};

function formatMoney(n) {
  const v = Number(n || 0);
  return `GH₵ ${v.toFixed(2)}`;
}

async function loadDashboard() {
  try {
    const data = await api('/api/user/dashboard');
    document.getElementById('balanceValue').textContent = formatMoney(data.balance);
    document.getElementById('depositsValue').textContent = formatMoney(data.totalDeposits);
    document.getElementById('withdrawalsValue').textContent = formatMoney(data.totalWithdrawals);
    document.getElementById('userEmail').textContent = `${data.username} (${data.email})`;
  } catch (_err) {
    window.location.href = '/login.html';
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const logout = document.getElementById('logoutLink');
  if (logout) {
    logout.addEventListener('click', (e) => {
      e.preventDefault();
      clearToken?.();
      window.location.href = '/login.html';
    });
  }
  loadDashboard();
});

