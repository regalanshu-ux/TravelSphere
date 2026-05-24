# Travel MERN App (Minimal scaffold)

This workspace contains a minimal MERN scaffold for a travel & itinerary platform.

Backend (Express + MongoDB): e:/travel 3.0/backend
Frontend (React + Vite): e:/travel 3.0/frontend

Quick start (requires Node.js and MongoDB):

Backend:

```powershell
cd "e:/travel 3.0/backend"
npm install
copy .env.example .env
# Edit .env with your MONGO_URI and JWT_SECRET
npm run dev
```

Frontend:

```powershell
cd "e:/travel 3.0/frontend"
npm install
npm run dev
```

Notes:
- Google OAuth flow is left as a placeholder in `backend/routes/auth.js` (configure passport and credentials).
- Phone OTP is implemented as a development mock that returns the code in the API response; replace with an SMS provider for production.
- Role-based middleware is in `backend/middleware/auth.js`.

Next steps:
- Implement Google OAuth with Passport and a client ID/secret.
- Integrate a real SMS provider for OTP.
- Add travel/itinerary models and agent/admin features.
