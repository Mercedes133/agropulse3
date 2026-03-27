const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const {
  listUsers,
  listManualPayments,
  approveManualPayment,
  rejectManualPayment,
  listWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
} = require('../controllers/admin.controller');

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get('/users', listUsers);

router.get('/manual-payments', listManualPayments);
router.post('/manual-payments/:id/approve', approveManualPayment);
router.post('/manual-payments/:id/reject', rejectManualPayment);

router.get('/withdrawals', listWithdrawals);
router.post('/withdrawals/:id/approve', approveWithdrawal);
router.post('/withdrawals/:id/reject', rejectWithdrawal);

module.exports = router;

