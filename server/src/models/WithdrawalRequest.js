const mongoose = require('mongoose');

const WithdrawalRequestSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    amount: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending', index: true },
    payoutMethod: { type: String, enum: ['mtn_momo', 'other'], default: 'mtn_momo' },
    payoutDetails: { type: Object, default: {} },
    adminNote: { type: String, trim: true, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WithdrawalRequest', WithdrawalRequestSchema);

