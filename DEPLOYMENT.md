# 🚀 CiviTrack V2 — Comprehensive Deployment Guide

This guide provides step-by-step instructions to deploy **CiviTrack V2** using **Docker Compose (Recommended)**, **Local Production Runner**, or **Free Cloud Hosting (Render + Vercel + MongoDB Atlas)**.

---

## 🐳 Option 1: Docker Compose Deployment (Recommended)

Docker Compose containerizes all three services: **MongoDB**, **FastAPI Backend (with ML models)**, and **Nginx Frontend**.

### Prerequisites
- Install [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Commands
```bash
# 1. Clone/navigate to project directory
cd civitrack-v2

# 2. Build and start containers in detached mode
docker-compose up --build -d

# 3. Check running services status
docker-compose ps

# 4. View backend logs (including automatic ML training & DB seeding)
docker-compose logs -f backend
```

### Access URLs
- **Web Application**: `http://localhost` (or `http://localhost:80`)
- **FastAPI REST API Docs**: `http://localhost:8000/docs`
- **MongoDB Connection**: `mongodb://localhost:27017`

### Stop Application
```bash
docker-compose down
```

---

## 💻 Option 2: Local Production Script (`start-prod.sh`)

If you want to run the app directly on your local system without Docker:

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB installed locally OR MongoDB Atlas Connection URI

### Script Execution
Run the automated production runner script:
```bash
chmod +x start-prod.sh
./start-prod.sh
```

---

## ⚡ Quick Deployment Guide: Vercel + Render + MongoDB Atlas

### 🌐 1. Deploy Frontend to Vercel (1-Click)
The `client/` React Vite app is 100% ready for **Vercel**. We have pre-configured `client/vercel.json` for seamless client-side routing.

1. Push your code to **GitHub**.
2. Go to **[Vercel Dashboard](https://vercel.com/new)** $\rightarrow$ **Import Repository**.
3. Configure the deployment settings:
   * **Framework Preset**: `Vite`
   * **Root Directory**: `client`
   * **Build Command**: `npm run build`
   * **Output Directory**: `dist`
4. Add Environment Variable:
   * `VITE_API_URL` = `https://your-backend-api.onrender.com/api` *(Your backend URL on Render/Railway)*
5. Click **Deploy**.

---

### 🐍 2. Host Backend (Python FastAPI + ML Models)
Because CiviTrack V2 runs **Scikit-Learn ML Models** and **Socket.io WebSockets**, host the backend on a Python container platform like **[Render.com](https://render.com)** or **[Railway.app](https://railway.app)**:

1. Create a **Web Service** on Render.
2. Connect your GitHub repository with Root Directory = `server`.
3. Set **Build Command**: `pip install -r requirements.txt && python ../ml/train_and_eval.py`
4. Set **Start Command**: `uvicorn app.main:socket_app --host 0.0.0.0 --port $PORT`

---

### 🗄️ 3. Database Choice: MongoDB Atlas vs Supabase

| Database Provider | Compatibility | Setup Effort |
|---|---|---|
| **MongoDB Atlas (Recommended)** | 🟢 **100% Native Plug & Play** | **Zero code changes**. Paste URI into `MONGODB_URI` environment variable. Free tier available. |
| **Supabase** | 🟡 Uses PostgreSQL | Requires refactoring MongoDB queries (`db.issues.find()`, `$near` 2dsphere) to PostgreSQL SQL. |

> 💡 **Recommendation**: Use **MongoDB Atlas Free Tier** for database hosting. It works out-of-the-box with your current FastAPI codebase without rewriting queries.

---

## 🔑 Default Demo Accounts


Once deployed, the database automatically seeds with default accounts:

| Role | Email | Password |
|---|---|---|
| **Citizen** | `citizen@civitrack.in` | `citizen123` |
| **Ward NGO** | `ngo.whitetown@civitrack.in` | `ngo123` |
| **Municipal Authority** | `authority@civitrack.in` | `authority123` |
