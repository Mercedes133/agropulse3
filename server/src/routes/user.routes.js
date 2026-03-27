const express = require('express');
const { requireAuth } = require('../middleware/auth');
const { dashboard, myTransactions } = require('../controllers/user.controller');

const router = express.Router();

router.get('/dashboard', requireAuth, dashboard);
router.get('/transactions', requireAuth, myTransactions);

module.exports = router;

