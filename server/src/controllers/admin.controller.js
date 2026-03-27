const User = require('../models/User');
const ManualPaymentRequest = require('../models/ManualPaymentRequest');
const WithdrawalRequest = require('../models/WithdrawalRequest');
const Transaction = require('../models/Transaction');

async function listUsers(_req, res, next) {
  try {
    const users = await User.find().sort({ createdAt: -1 }).limit(200).select('username email balance isAdmin createdAt');
    res.json({ users });
  } catch (err) {
    next(err);
  }
}

async function listManualPayments(req, res, next) {
  try {
    const status = req.query.status ? String(req.query.status) : 'pending';
    const q = status ? { status } : {};
    const requests = await ManualPaymentRequest.find(q).sort({ createdAt: -1 }).limit(200);
    res.json({ requests });
  } catch (err) {
    next(err);
  }
}

async function approveManualPayment(req, res, next) {
  try {
    const r = await ManualPaymentRequest.findById(req.params.id);
    if (!r) return res.status(404).json({ message: 'Request not found' });
    if (r.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });

    const user = await User.findOne({ email: r.email });
    if (!user) return res.status(404).json({ message: 'No user with this email' });

    r.status = 'approved';
    await r.save();

    await User.findByIdAndUpdate(user._id, { $inc: { balance: r.amount, totalDeposits: r.amount } });
    await Transaction.create({
      user: user._id,
      type: 'deposit',
      amount: r.amount,
      status: 'successful',
      channel: 'mtn_momo',
      reference: r._id.toString(),
      meta: { manualPaymentRequestId: r._id.toString() },
    });

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

async function rejectManualPayment(req, res, next) {
  try {
    const r = await ManualPaymentRequest.findById(req.params.id);
    if (!r) return res.status(404).json({ message: 'Request not found' });
    if (r.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });
    r.status = 'rejected';
    await r.save();
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

async function listWithdrawals(req, res, next) {
  try {
    const status = req.query.status ? String(req.query.status) : 'pending';
    const q = status ? { status } : {};
    const requests = await WithdrawalRequest.find(q)
      .populate('user', 'email username')
      .sort({ createdAt: -1 })
      .limit(200);
    res.json({ requests });
  } catch (err) {
    next(err);
  }
}

async function approveWithdrawal(req, res, next) {
  try {
    const r = await WithdrawalRequest.findById(req.params.id);
    if (!r) return res.status(404).json({ message: 'Request not found' });
    if (r.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });

    r.status = 'approved';
    await r.save();

    await User.findByIdAndUpdate(r.user, { $inc: { totalWithdrawals: r.amount } });
    await Transaction.findOneAndUpdate(
      { 'meta.withdrawalRequestId': r._id.toString(), type: 'withdrawal' },
      { $set: { status: 'successful' } },
      { sort: { createdAt: -1 } }
    );

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

async function rejectWithdrawal(req, res, next) {
  try {
    const r = await WithdrawalRequest.findById(req.params.id);
    if (!r) return res.status(404).json({ message: 'Request not found' });
    if (r.status !== 'pending') return res.status(400).json({ message: 'Request already processed' });

    // On rejection, refund the user.
    r.status = 'rejected';
    await r.save();

    await User.findByIdAndUpdate(r.user, { $inc: { balance: r.amount } });
    await Transaction.findOneAndUpdate(
      { 'meta.withdrawalRequestId': r._id.toString(), type: 'withdrawal' },
      { $set: { status: 'rejected' } },
      { sort: { createdAt: -1 } }
    );

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listUsers,
  listManualPayments,
  approveManualPayment,
  rejectManualPayment,
  listWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
};

