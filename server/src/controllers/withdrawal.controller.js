const WithdrawalRequest = require('../models/WithdrawalRequest');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

async function requestWithdrawal(req, res, next) {
  try {
    const amt = Number(req.body.amount);
    const momoNumber = String(req.body.momoNumber || '').trim();
    if (!Number.isFinite(amt) || amt <= 0) return res.status(400).json({ message: 'Invalid amount' });
    if (momoNumber.length < 8) return res.status(400).json({ message: 'Invalid MoMo number' });

    const user = await User.findById(req.user.id).select('balance');
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.balance < amt) return res.status(400).json({ message: 'Insufficient balance' });

    // Deduct immediately, then require admin approval to finalize.
    await User.findByIdAndUpdate(req.user.id, { $inc: { balance: -amt } });

    const wr = await WithdrawalRequest.create({
      user: req.user.id,
      amount: amt,
      status: 'pending',
      payoutMethod: 'mtn_momo',
      payoutDetails: { momoNumber },
    });

    await Transaction.create({
      user: req.user.id,
      type: 'withdrawal',
      amount: amt,
      status: 'pending',
      channel: 'internal',
      reference: wr._id.toString(),
      meta: { withdrawalRequestId: wr._id.toString() },
    });

    res.status(201).json({ request: wr });
  } catch (err) {
    next(err);
  }
}

module.exports = { requestWithdrawal };

