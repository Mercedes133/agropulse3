const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: { type: String, enum: ['deposit', 'withdrawal'], required: true, index: true },
    amount: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ['pending', 'successful', 'failed', 'rejected'], default: 'pending', index: true },
    reference: { type: String, trim: true, index: true },
    channel: { type: String, enum: ['paystack', 'mtn_momo', 'internal'], default: 'internal' },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transaction', TransactionSchema);

