require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { notFoundHandler, errorHandler } = require('./middleware/errors');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const paystackRoutes = require('./routes/paystack.routes');
const manualPaymentRoutes = require('./routes/manualPayment.routes');
const withdrawalRoutes = require('./routes/withdrawal.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',') : '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(morgan('dev'));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 200,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
  })
);

app.get('/health', (_req, res) => res.json({ ok: true, name: 'AgroPulse API' }));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/paystack', paystackRoutes);
app.use('/api/manual-payments', manualPaymentRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/admin', adminRoutes);

// Serve the frontend
const clientDir = path.join(__dirname, '../../client');
app.use(express.static(clientDir));
app.get('/', (_req, res) => {
  res.sendFile(path.join(clientDir, 'index.html'));
});

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

