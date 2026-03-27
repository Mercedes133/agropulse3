const mongoose = require('mongoose');
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
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const r = await ManualPaymentRequest.findOne({
        _id: req.params.id,
        status: 'pending',
      }).session(session);
      if (!r) {
        const err = new Error('NOT_FOUND_OR_PROCESSED');
        err.code = 'MANUAL_PAYMENT_STATE';
        throw err;
      }

      const user = await User.findOne({ email: r.email }).session(session);
      if (!user) {
        const err = new Error('NO_USER');
        err.code = 'MANUAL_PAYMENT_USER';
        throw err;
      }

      // Credit + ledger first; only then mark approved — all commit or rollback together.
      await User.findByIdAndUpdate(
        user._id,
        { $inc: { balance: r.amount, totalDeposits: r.amount } },
        { session }
      );
      await Transaction.create(
        [
          {
            user: user._id,
            type: 'deposit',
            amount: r.amount,
            status: 'successful',
            channel: 'mtn_momo',
            reference: r._id.toString(),
            meta: { manualPaymentRequestId: r._id.toString() },
          },
        ],
        { session }
      );
      r.status = 'approved';
      await r.save({ session });
    });
    res.json({ ok: true });
  } catch (err) {
    if (err.code === 'MANUAL_PAYMENT_STATE') {
      const exists = await ManualPaymentRequest.findById(req.params.id);
      if (!exists) return res.status(404).json({ message: 'Request not found' });
      return res.status(400).json({ message: 'Request already processed' });
    }
    if (err.code === 'MANUAL_PAYMENT_USER') {
      return res.status(404).json({ message: 'No user with this email' });
    }
    next(err);
  } finally {
    session.endSession();
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
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const r = await WithdrawalRequest.findOne({
        _id: req.params.id,
        status: 'pending',
      }).session(session);
      if (!r) {
        const err = new Error('NOT_FOUND_OR_PROCESSED');
        err.code = 'WITHDRAWAL_STATE';
        throw err;
      }

      await User.findByIdAndUpdate(r.user, { $inc: { totalWithdrawals: r.amount } }, { session });
      await Transaction.findOneAndUpdate(
        { 'meta.withdrawalRequestId': r._id.toString(), type: 'withdrawal' },
        { $set: { status: 'successful' } },
        { session, sort: { createdAt: -1 } }
      );
      r.status = 'approved';
      await r.save({ session });
    });
    res.json({ ok: true });
  } catch (err) {
    if (err.code === 'WITHDRAWAL_STATE') {
      const exists = await WithdrawalRequest.findById(req.params.id);
      if (!exists) return res.status(404).json({ message: 'Request not found' });
      return res.status(400).json({ message: 'Request already processed' });
    }
    next(err);
  } finally {
    session.endSession();
  }
}

async function rejectWithdrawal(req, res, next) {
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      const r = await WithdrawalRequest.findOne({
        _id: req.params.id,
        status: 'pending',
      }).session(session);
      if (!r) {
        const err = new Error('NOT_FOUND_OR_PROCESSED');
        err.code = 'WITHDRAWAL_REJECT_STATE';
        throw err;
      }

      await User.findByIdAndUpdate(r.user, { $inc: { balance: r.amount } }, { session });
      await Transaction.findOneAndUpdate(
        { 'meta.withdrawalRequestId': r._id.toString(), type: 'withdrawal' },
        { $set: { status: 'rejected' } },
        { session, sort: { createdAt: -1 } }
      );
      r.status = 'rejected';
      await r.save({ session });
    });
    res.json({ ok: true });
  } catch (err) {
    if (err.code === 'WITHDRAWAL_REJECT_STATE') {
      const exists = await WithdrawalRequest.findById(req.params.id);
      if (!exists) return res.status(404).json({ message: 'Request not found' });
      return res.status(400).json({ message: 'Request already processed' });
    }
    next(err);
  } finally {
    session.endSession();
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

