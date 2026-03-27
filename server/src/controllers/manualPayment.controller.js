const ManualPaymentRequest = require('../models/ManualPaymentRequest');

async function createManualPayment(req, res, next) {
  try {
    const { username, email, amount } = req.body;
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) return res.status(400).json({ message: 'Invalid amount' });

    const reqDoc = await ManualPaymentRequest.create({
      username: String(username || '').trim(),
      email: String(email || '').trim().toLowerCase(),
      amount: amt,
      status: 'pending',
    });
    res.status(201).json({ request: reqDoc });
  } catch (err) {
    next(err);
  }
}

module.exports = { createManualPayment };

