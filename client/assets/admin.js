const { api } = window.__agropulse || {};

function el(tag, attrs = {}, text = '') {
  const n = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
  if (text) n.textContent = text;
  return n;
}

function money(n) {
  return `GH₵ ${Number(n || 0).toFixed(2)}`;
}

function renderList(container, items, renderItem) {
  container.innerHTML = '';
  if (!items.length) {
    container.appendChild(el('div', { class: 'row-meta' }, 'No items.'));
    return;
  }
  items.forEach((item) => container.appendChild(renderItem(item)));
}

async function load() {
  const manualList = document.getElementById('manualList');
  const withdrawList = document.getElementById('withdrawList');
  const usersList = document.getElementById('usersList');

  try {
    const [manual, withdrawals, users] = await Promise.all([
      api('/api/admin/manual-payments?status=pending'),
      api('/api/admin/withdrawals?status=pending'),
      api('/api/admin/users'),
    ]);

    renderList(manualList, manual.requests || [], (r) => {
      const row = el('div', { class: 'row' });
      row.appendChild(el('div', { class: 'row-title' }, `${r.username} • ${money(r.amount)}`));
      row.appendChild(el('div', { class: 'row-meta' }, `${r.email} • ${new Date(r.createdAt).toLocaleString()}`));
      const actions = el('div', { class: 'row-actions' });

      const approve = el('button', { class: 'btn btn-primary', type: 'button' }, 'Approve');
      approve.addEventListener('click', async () => {
        await api(`/api/admin/manual-payments/${r._id}/approve`, { method: 'POST' });
        load();
      });
      const reject = el('button', { class: 'btn btn-ghost', type: 'button' }, 'Reject');
      reject.addEventListener('click', async () => {
        await api(`/api/admin/manual-payments/${r._id}/reject`, { method: 'POST' });
        load();
      });
      actions.appendChild(approve);
      actions.appendChild(reject);
      row.appendChild(actions);
      return row;
    });

    renderList(withdrawList, withdrawals.requests || [], (r) => {
      const row = el('div', { class: 'row' });
      row.appendChild(el('div', { class: 'row-title' }, `${money(r.amount)} • ${r.user?.email || ''}`));
      const momo = r.payoutDetails?.momoNumber ? `MoMo: ${r.payoutDetails.momoNumber}` : '';
      row.appendChild(el('div', { class: 'row-meta' }, `${momo} • ${new Date(r.createdAt).toLocaleString()}`));
      const actions = el('div', { class: 'row-actions' });

      const approve = el('button', { class: 'btn btn-primary', type: 'button' }, 'Approve');
      approve.addEventListener('click', async () => {
        await api(`/api/admin/withdrawals/${r._id}/approve`, { method: 'POST' });
        load();
      });
      const reject = el('button', { class: 'btn btn-ghost', type: 'button' }, 'Reject');
      reject.addEventListener('click', async () => {
        await api(`/api/admin/withdrawals/${r._id}/reject`, { method: 'POST' });
        load();
      });
      actions.appendChild(approve);
      actions.appendChild(reject);
      row.appendChild(actions);
      return row;
    });

    renderList(usersList, users.users || [], (u) => {
      const row = el('div', { class: 'row' });
      row.appendChild(el('div', { class: 'row-title' }, `${u.username} • ${u.email}`));
      row.appendChild(el('div', { class: 'row-meta' }, `Balance: ${money(u.balance)} • Admin: ${u.isAdmin ? 'Yes' : 'No'}`));
      return row;
    });
  } catch (_e) {
    manualList.textContent = 'Admin access required.';
  }
}

window.addEventListener('DOMContentLoaded', load);

