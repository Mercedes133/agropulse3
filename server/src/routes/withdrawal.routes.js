const express = require('express');
const { body } = require('express-validator');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { requestWithdrawal } = require('../controllers/withdrawal.controller');

const router = express.Router();

router.post(
  '/',
  requireAuth,
  [body('amount').isFloat({ gt: 0 }), body('momoNumber').trim().isLength({ min: 8, max: 30 })],
  validate,
  requestWithdrawal
);

module.exports = router;

