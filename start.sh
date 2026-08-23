#!/bin/bash
echo "🚀 Starting CiviTrack V2..."
echo ""
echo "Starting backend on port 8000..."
cd server && pip install -r requirements.txt -q && uvicorn app.main:socket_app --host 0.0.0.0 --port 8000 --reload &
BACK_PID=$!
sleep 3
echo "Starting frontend on port 5173..."
cd ../client && npm install -q && npm run dev &
FRONT_PID=$!
echo ""
echo "✅ CiviTrack V2 is running!"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:8000"
echo "   API docs: http://localhost:8000/docs"
echo ""
echo "Demo accounts (password: password123):"
echo "  citizen@demo.com  → Citizen"
echo "  ngo@demo.com      → NGO (White Town ward)"
echo "  authority@demo.com → Authority"
echo ""
wait $BACK_PID $FRONT_PID
