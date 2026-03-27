const mongoose = require('mongoose');
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

    // All-or-nothing: create withdrawal + transaction + deduct balance in one transaction
    // so we never leave balance reduced without matching records (or vice versa).
    const session = await mongoose.startSession();
    let wrDoc;
    try {
      await session.withTransaction(async () => {
        const created = await WithdrawalRequest.create(
          [
            {
              user: req.user.id,
              amount: amt,
              status: 'pending',
              payoutMethod: 'mtn_momo',
              payoutDetails: { momoNumber },
            },
          ],
          { session }
        );
        wrDoc = created[0];

        await Transaction.create(
          [
            {
              user: req.user.id,
              type: 'withdrawal',
              amount: amt,
              status: 'pending',
              channel: 'internal',
              reference: wrDoc._id.toString(),
              meta: { withdrawalRequestId: wrDoc._id.toString() },
            },
          ],
          { session }
        );

        const updated = await User.findOneAndUpdate(
          { _id: req.user.id, balance: { $gte: amt } },
          { $inc: { balance: -amt } },
          { session, new: true }
        );
        if (!updated) {
          const err = new Error('Insufficient balance');
          err.statusCode = 400;
          throw err;
        }
      });
    } finally {
      session.endSession();
    }

    res.status(201).json({ request: wrDoc });
  } catch (err) {
    if (err.statusCode === 400) return res.status(400).json({ message: err.message });
    next(err);
  }
}

module.exports = { requestWithdrawal };

