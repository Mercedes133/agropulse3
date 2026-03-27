function toKobo(amountGhs) {
  // Paystack expects amount in kobo for GHS too (smallest currency unit)
  return Math.round(Number(amountGhs) * 100);
}

module.exports = { toKobo };

