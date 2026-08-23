# 🏛️ CiviTrack V2 — AI-Powered Urban Decision Support System for Puducherry

**CiviTrack V2** is an advanced, AI-driven civic engagement and urban issue management platform designed specifically for Puducherry, India. It combines Artificial Intelligence & Machine Learning, Real-Time WebSockets, Interactive Leaflet Mapping, EcoScore Gamification, and Zero-Knowledge Anonymous Privacy to empower citizens, ward NGOs, and municipal authorities.

---

## 🚀 Key Highlights & AI/ML Architecture

### 🧠 1. Automatic Issue Text Categorization (95.56% Accuracy)
- **Algorithm**: TF-IDF (Term Frequency - Inverse Document Frequency) Vectorization (Unigrams + Bigrams) combined with a **Random Forest Classifier** (`n_estimators=100`).
- **Categories (8)**: `ROADS`, `WATER`, `WASTE`, `LIGHTING`, `AIR_QUALITY`, `PARKS`, `PUBLIC_PROPERTY`, `OTHER`.
- **Dataset**: Custom Puducherry civic domain dataset with text augmentation (`ml/generate_data.py`).
- **Fallback**: Intelligent keyword-based scoring mechanism ensures 100% uptime even if the ML model is offline.

### 📊 2. Multi-Factor Priority Scoring Engine (0 - 100 Score)
Computes an objective, algorithmic priority score and assigns risk levels (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`):
$$\text{Priority Score} = \text{Location Weight (0-30)} + \text{Crowd Density Weight (0-30)} + \text{Photo Severity (0-40)}$$
- **Location Weight**: `HIGHWAY` (30), `SCHOOL_HOSPITAL` (28), `COMMERCIAL` (25), `INDUSTRIAL` (20), `RESIDENTIAL` (15), `RURAL` (10).
- **Crowd Density**: `EXTREMELY_BUSY` (30), `BUSY` (22), `MODERATE` (15), `LOW` (8), `VERY_LOW` (3).
- **Photo Severity**: Extracted image hazard score (0.0 to 1.0) multiplied by 40 pts.

### 🤖 3. Multilingual CiviBot AI Assistant
- **Languages Supported**: English, Tamil (தமிழ்), French (Français).
- **Intents**: Issue Reporting, Tracking, EcoScore Rules, Anonymous Safety, Ward NGO Info, AI Priority Scoring, and Verification workflows.

---

## 🛠️ Complete Tech Stack

| Layer | Technology Used |
|---|---|
| **Frontend** | React 18, TypeScript, Tailwind CSS, Leaflet Maps, Recharts Analytics, Lucide Icons |
| **Backend** | Python FastAPI, Async Motor (MongoDB Driver), Socket.io ASGI |
| **Database** | MongoDB (Geospatial 2dsphere indexing, Ward boundaries, User collections) |
| **AI / ML** | Scikit-Learn, TF-IDF Vectorizer, Random Forest Classifier, Joblib, NumPy |
| **Security** | JWT Authentication, Role-Based Access Control (RBAC), bcrypt Zero-Knowledge Hashing |

---

## 👥 User Roles & Workflow

1. **Citizen 👤**
   - Submit civic issues via a 5-step interactive wizard.
   - Choose between **Public Report** (+10 EcoScore points) or **Zero-Knowledge Anonymous Report** (receive 6-digit tracking token).
   - Upvote (+5 pts) and comment (+3 pts) on community issues.
   - Confirm issue resolution (+50 pts).

2. **Ward NGO 🤝**
   - Dedicated NGO assigned to each of Puducherry's 10 Wards (White Town, Lawspet, Oulgaret, etc.).
   - Verify or reject pending citizen reports to prevent spam/duplicate posts.
   - Escalate severe emergencies directly to `CRITICAL` priority.

3. **Municipal Authority 🏛️**
   - Manage civic issue lifecycles (`IN_PROGRESS` $\rightarrow$ `RESOLVED`).
   - Monitor city-wide SLA performance, heatmaps, and ward health metrics on the Analytics Dashboard.

---

## ⚡ Quick Start Guide

### 1. Run Backend Server (FastAPI)
```bash
cd server
source venv/bin/activate
uvicorn app.main:socket_app --reload --port 8000
```
*API Documentation available at: `http://localhost:8000/docs`*

### 2. Run Frontend Client (Vite React)
```bash
cd client
npm run dev
```
*App running at: `http://localhost:5173`*

### 3. Evaluate / Retrain ML Models
```bash
cd server
./venv/bin/python ../ml/train_and_eval.py
```

### 4. Docker Production Deployment
```bash
docker-compose up --build -d
```
*See [DEPLOYMENT.md](file:///Users/hari/.gemini/antigravity-ide/scratch/civitrack-v2/DEPLOYMENT.md) for complete Docker, local runner, and cloud hosting (Render + Vercel + MongoDB Atlas) deployment instructions.*

---

## 🔑 Demo Login Credentials

| Role | Email | Password | Ward |
|---|---|---|---|
| **Citizen** | `citizen@civitrack.in` | `citizen123` | White Town |
| **NGO** | `ngo.whitetown@civitrack.in` | `ngo123` | White Town |
| **Authority** | `authority@civitrack.in` | `authority123` | White Town |

---

## 📈 ML Training & Evaluation Summary

- **Total Dataset Size**: 360 labeled samples
- **Accuracy**: **95.56%**
- **Macro Precision / Recall / F1**: 0.97 / 0.95 / 0.96
- **Saved Model Artifact**: `ml/models/classifier.pkl`

