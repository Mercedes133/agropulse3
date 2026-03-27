const jwt = require('jsonwebtoken');
const User = require('../models/User');

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Missing token' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload;
    next();
  } catch (_e) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

async function requireAdmin(req, res, next) {
  if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' });
  const user = await User.findById(req.user.id).select('isAdmin');
  if (!user) return res.status(401).json({ message: 'Unauthorized' });
  if (!user.isAdmin) return res.status(403).json({ message: 'Admin only' });
  next();
}

module.exports = { requireAuth, requireAdmin };

