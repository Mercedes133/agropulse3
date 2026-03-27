const express = require('express');
const { body } = require('express-validator');
const { validate } = require('../middleware/validate');
const { register, login, me } = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post(
  '/register',
  [
    body('username').trim().isLength({ min: 3, max: 30 }),
    body('email').trim().isEmail().normalizeEmail(),
    body('password').isLength({ min: 6, max: 100 }),
  ],
  validate,
  register
);

router.post(
  '/login',
  [body('email').trim().isEmail().normalizeEmail(), body('password').isLength({ min: 1 })],
  validate,
  login
);

router.get('/me', requireAuth, me);

module.exports = router;

