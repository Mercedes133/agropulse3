const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    provider: { type: String, enum: ['paystack'], default: 'paystack', index: true },
    reference: { type: String, required: true, unique: true, trim: true, index: true },
    amount: { type: Number, required: true, min: 1 },
    status: { type: String, enum: ['initialized', 'verified', 'failed'], default: 'initialized', index: true },
    raw: { type: Object, default: {} },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Payment', PaymentSchema);

