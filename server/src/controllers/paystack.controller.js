const Payment = require('../models/Payment');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const { paystackClient } = require('../utils/paystack');
const { toKobo } = require('../utils/money');

async function initialize(req, res, next) {
  try {
    const { amount } = req.body;
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) return res.status(400).json({ message: 'Invalid amount' });

    const user = await User.findById(req.user.id).select('email');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const client = paystackClient();
    const callback_url = process.env.PAYSTACK_CALLBACK_URL || process.env.CLIENT_ORIGIN || undefined;
    const initRes = await client.post('/transaction/initialize', {
      email: user.email,
      amount: toKobo(amt),
      currency: 'GHS',
      callback_url,
      metadata: { userId: req.user.id },
    });

    const ref = initRes?.data?.data?.reference;
    const authorizationUrl = initRes?.data?.data?.authorization_url;
    if (!ref || !authorizationUrl) return res.status(502).json({ message: 'Paystack initialization failed' });

    await Payment.create({
      user: req.user.id,
      provider: 'paystack',
      reference: ref,
      amount: amt,
      status: 'initialized',
      raw: initRes.data,
    });

    // Record a pending deposit transaction (credits only on verify)
    await Transaction.create({
      user: req.user.id,
      type: 'deposit',
      amount: amt,
      status: 'pending',
      reference: ref,
      channel: 'paystack',
    });

    res.json({ reference: ref, authorizationUrl });
  } catch (err) {
    next(err);
  }
}

async function verify(req, res, next) {
  try {
    const reference = String(req.params.reference || '').trim();
    if (!reference) return res.status(400).json({ message: 'Missing reference' });

    const payment = await Payment.findOne({ reference });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    // Idempotent: if already verified, do not re-credit.
    if (payment.status === 'verified') {
      return res.json({ status: 'verified' });
    }

    const client = paystackClient();
    const verifyRes = await client.get(`/transaction/verify/${encodeURIComponent(reference)}`);
    const ps = verifyRes?.data?.data;
    const success = ps?.status === 'success';

    payment.raw = verifyRes.data;
    payment.status = success ? 'verified' : 'failed';
    await payment.save();

    const txn = await Transaction.findOne({ reference, type: 'deposit' }).sort({ createdAt: -1 });
    if (!txn) return res.status(404).json({ message: 'Transaction not found' });

    if (!success) {
      txn.status = 'failed';
      await txn.save();
      return res.status(400).json({ message: 'Payment not successful', status: 'failed' });
    }

    // Ensure amount matches (Paystack amount is in kobo)
    const verifiedAmount = Number(ps.amount) / 100;
    if (!Number.isFinite(verifiedAmount) || verifiedAmount <= 0) {
      return res.status(502).json({ message: 'Invalid verification payload' });
    }

    // Update txn and credit user (single credit point)
    txn.status = 'successful';
    txn.amount = verifiedAmount;
    await txn.save();

    await User.findByIdAndUpdate(payment.user, {
      $inc: { balance: verifiedAmount, totalDeposits: verifiedAmount },
    });

    res.json({ status: 'verified', amount: verifiedAmount });
  } catch (err) {
    next(err);
  }
}

module.exports = { initialize, verify };

