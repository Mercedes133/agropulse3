# AgroPulse

Full-stack agricultural investment platform (Node.js + Express + MongoDB + JWT) with Paystack deposits, manual MTN MoMo requests, withdrawals, and admin approvals.

## Requirements

- Node.js 18+
- MongoDB (local or MongoDB Atlas)

## Setup

1. Copy env file:

```bash
cd AgroPulse/server
copy .env.example .env
```

2. Edit `server/.env` and set:

- `MONGODB_URI`
- `JWT_SECRET`
- `PAYSTACK_SECRET_KEY` (Paystack secret key)
- `PAYSTACK_CALLBACK_URL` (should point to your deposit page)

## Run Locally

Backend also serves the frontend from `AgroPulse/client`.

```bash
cd AgroPulse/server
npm run dev
```

Open:

- `http://localhost:5000/` (home)
- `http://localhost:5000/register.html` (sign up)

## Admin Access

Admin endpoints require `isAdmin: true` on your user.

Quick local approach:

- Register a user, then set `isAdmin` to `true` in MongoDB for that user document.
- Visit `http://localhost:5000/admin.html`.

## Paystack Notes

- Users are credited **only** after verification (`/api/paystack/verify/:reference`).
- The deposit page auto-verifies if Paystack returns with `?reference=...`.

## Render Deployment (Backend + Static Frontend)

1. Create a new Web Service from the `AgroPulse/server` folder.
2. Set build command: `npm install`
3. Set start command: `npm start`
4. Add environment variables from `.env.example`.

