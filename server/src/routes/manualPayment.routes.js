const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { createManualPayment } = require('../controllers/manualPayment.controller');

const router = express.Router();

// This is intentionally public: user submits username/email after off-platform payment.
router.post(
  '/',
  [body('username').trim().isLength({ min: 1, max: 50 }), body('email').trim().isEmail(), body('amount').isFloat({ gt: 0 })],
  validate,
  createManualPayment
);

module.exports = router;

