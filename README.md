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

## Go live on Render (step by step)

1. **Push this repo to GitHub** (if you have not already):

   ```bash
   cd AgroPulse
   git add .
   git commit -m "Deploy config"
   git push origin main
   ```

2. **MongoDB Atlas**
   - Create a free cluster → **Database** → **Connect** → **Drivers** → copy `MONGODB_URI`.
   - **Network Access** → add **`0.0.0.0/0`** (allow from anywhere) so Render can connect.

3. **Render — New Web Service**
   - Connect the **`agropulse3`** (or your) GitHub repo.
   - **Root Directory:** leave **empty** (repo root has `package.json` + `postinstall` for `server/`).
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - Optional: this repo includes **`render.yaml`** — you can use **Blueprint** / “Apply render.yaml” if Render offers it.

4. **Environment variables** (Render → your service → **Environment**)

   | Key | Required | Notes |
   |-----|----------|--------|
   | `MONGODB_URI` | Yes | Atlas connection string |
   | `JWT_SECRET` | Yes | Long random string (secret) |
   | `JWT_EXPIRES_IN` | No | Default `7d` if unset |
   | `CLIENT_ORIGIN` | No | Your live URL, e.g. `https://agropulse.onrender.com` (helps CORS) |
   | `PAYSTACK_*` | No | When you enable Paystack |

5. **Deploy** → wait for “Live”. Then open:
   - `https://YOUR-SERVICE.onrender.com/health` → should show `{"ok":true,...}`
   - `https://YOUR-SERVICE.onrender.com/register.html` → sign up page

**Free tier:** the service may **sleep** when idle; the first request after sleep can take ~30–60 seconds.

## Render Deployment (details)

**Option A:** **Root Directory** = `server`, build `npm install`, start `npm start`.

**Option B:** **Root Directory** = repo root — root `package.json` runs `postinstall` to install `server/` and `start` runs the API.

See also `server/.env.example` for local development.

