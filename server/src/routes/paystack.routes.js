const express = require('express');
const { body } = require('express-validator');
const { requireAuth } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { initialize, verify } = require('../controllers/paystack.controller');

const router = express.Router();

router.post(
  '/initialize',
  requireAuth,
  [body('amount').isFloat({ gt: 0 })],
  validate,
  initialize
);

router.get('/verify/:reference', requireAuth, verify);

module.exports = router;

