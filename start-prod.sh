#!/bin/bash

echo "============================================================"
echo " 🚀 Starting CiviTrack V2 Production Deployment Setup"
echo "============================================================"

# 1. Check Python environment
if [ -d "server/venv" ]; then
    PYTHON_BIN="server/venv/bin/python"
else
    PYTHON_BIN="python3"
fi

echo "[1/4] Retraining ML Classifier & Evaluating Metrics..."
$PYTHON_BIN ml/train_and_eval.py

# 2. Build Frontend
echo "[2/4] Building React TypeScript Frontend..."
cd client && npm run build && cd ..

# 3. Inform User
echo "[3/4] Frontend built in client/dist."
echo "[4/4] Starting FastAPI Server on http://localhost:8000..."

# 4. Start Backend Server
cd server
$PYTHON_BIN -m uvicorn app.main:socket_app --host 0.0.0.0 --port 8000
