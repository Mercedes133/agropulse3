const User = require('../models/User');
const Transaction = require('../models/Transaction');

async function dashboard(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('username email balance totalDeposits totalWithdrawals isAdmin');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({
      username: user.username,
      email: user.email,
      balance: user.balance,
      totalDeposits: user.totalDeposits,
      totalWithdrawals: user.totalWithdrawals,
      isAdmin: user.isAdmin,
    });
  } catch (err) {
    next(err);
  }
}

async function myTransactions(req, res, next) {
  try {
    const txns = await Transaction.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('type amount status reference channel createdAt');
    res.json({ transactions: txns });
  } catch (err) {
    next(err);
  }
}

module.exports = { dashboard, myTransactions };

