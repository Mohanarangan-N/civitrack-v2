# CiviTrack V2 — AI-Powered Urban Decision Support System

> Not a complaint app. An Urban Decision Support System that converts citizen-generated data into actionable intelligence for municipal planning and operations in Puducherry.

## Quick Start

```bash
# Make sure MongoDB is running first
mongod &

# Start both frontend and backend
./start.sh
```

Or run separately:

```bash
# Backend (port 8000)
cd server
pip install -r requirements.txt
uvicorn app.main:socket_app --host 0.0.0.0 --port 8000 --reload

# Frontend (port 5173)
cd client
npm install
npm run dev
```

## Demo Accounts (password: password123)
- citizen@demo.com → Citizen
- ngo@demo.com → NGO (White Town ward)
- authority@demo.com → Authority

## Tech Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Leaflet.js + Recharts
- **Backend**: Python FastAPI + MongoDB + Socket.io
- **Auth**: JWT + bcrypt
- **Maps**: Leaflet.js + OpenStreetMap (free)
- **ML**: scikit-learn (text + image + priority classifiers)
- **i18n**: Tamil + English + French

## Pages
1. Landing page (public)
2. Login / Register
3. Community Feed (Instagram-style)
4. Puducherry Map (emoji markers + heatmap + ward boundaries)
5. Report Issue (4-step form + anonymous toggle)
6. Issue Detail (AI badge + comments + status timeline)
7. Profile (EcoScore + badges)
8. Leaderboard (citizens + wards)
9. Analytics (charts + KPIs)
10. NGO Dashboard (verify/reject/escalate)
11. Authority Dashboard (assign/resolve)
12. Notifications
13. Anonymous Tracking (6-digit code)

## Key Features
- Zero-knowledge anonymous reporting (DPDP Act 2023)
- Ward-specific NGO verification
- Multi-modal AI priority scoring
- EcoScore gamification (5 levels, 14 badges)
- Real-time Socket.io updates
- Tamil + English + French UI
- 10 Puducherry wards seeded on startup
