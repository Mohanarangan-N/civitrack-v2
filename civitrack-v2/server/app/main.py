import os, logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import socketio
from datetime import datetime
from dotenv import load_dotenv
load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")

@sio.event
async def connect(sid, environ, auth): logger.info(f"Socket connected: {sid}")
@sio.event
async def disconnect(sid): logger.info(f"Socket disconnected: {sid}")
@sio.event
async def join_user(sid, user_id): await sio.enter_room(sid, f"user:{user_id}")
@sio.event
async def join_ward(sid, ward_name): await sio.enter_room(sid, f"ward:{ward_name}")
@sio.event
async def join_issue(sid, issue_id): await sio.enter_room(sid, f"issue:{issue_id}")
@sio.event
async def leave_issue(sid, issue_id): await sio.leave_room(sid, f"issue:{issue_id}")

PUDUCHERRY_WARDS = [
    {"name":"White Town","name_ta":"வெள்ளை நகர்","name_fr":"Ville Blanche"},
    {"name":"Lawspet","name_ta":"லாஸ்பேட்","name_fr":"Lawspet"},
    {"name":"Oulgaret","name_ta":"உழவர்கரை","name_fr":"Oulgaret"},
    {"name":"Mudaliarpet","name_ta":"முதலியார்பேட்டை","name_fr":"Mudaliarpet"},
    {"name":"Villianur","name_ta":"வில்லியனூர்","name_fr":"Villianour"},
    {"name":"Ariyankuppam","name_ta":"ஆரியன்குப்பம்","name_fr":"Ariyankuppam"},
    {"name":"Bahour","name_ta":"பாகூர்","name_fr":"Bahour"},
    {"name":"Mannadipet","name_ta":"மண்ணாடிப்பேட்டை","name_fr":"Mannadipet"},
    {"name":"Nettapakkam","name_ta":"நெட்டப்பாக்கம்","name_fr":"Nettapakkam"},
    {"name":"Embalam","name_ta":"எம்பலம்","name_fr":"Embalam"},
]

@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.utils.database import connect_db, disconnect_db, get_db
    await connect_db()
    db = get_db()
    # Seed wards
    if await db["wards"].count_documents({}) == 0:
        now = datetime.utcnow()
        for w in PUDUCHERRY_WARDS:
            await db["wards"].insert_one({**w,"city":"Puducherry","health_score":100.0,"open_issues":0,"resolved_issues":0,"created_at":now,"updated_at":now})
        logger.info("✅ Puducherry wards seeded")
    # Seed demo users
    from passlib.context import CryptContext
    pwd = CryptContext(schemes=["bcrypt"],deprecated="auto")
    demos = [
        {"name":"Citizen Demo","email":"citizen@demo.com","role":"CITIZEN","ward":"White Town"},
        {"name":"NGO Demo","email":"ngo@demo.com","role":"NGO","ward":"White Town"},
        {"name":"Authority Demo","email":"authority@demo.com","role":"AUTHORITY","ward":"White Town"},
    ]
    for d in demos:
        if not await db["users"].find_one({"email":d["email"]}):
            await db["users"].insert_one({**d,"password_hash":pwd.hash("password123"),"city":"Puducherry","language":"en","avatar_url":None,"eco_score":0,"level":"NEWCOMER","achievements":[],"streak_days":0,"last_active":now,"followers_count":0,"following_count":0,"is_verified":False,"report_count":0,"created_at":now,"updated_at":now})
    logger.info("✅ Demo users seeded")
    logger.info("🚀 CiviTrack V2 started!")
    yield
    await disconnect_db()

app = FastAPI(title="CiviTrack V2 API", version="2.0.0", lifespan=lifespan)
app.state.sio = sio
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

from app.routes import auth, issues, map, analytics, leaderboard, notifications, stories, users, wards, ml
app.include_router(auth.router,          prefix="/api/auth",          tags=["Auth"])
app.include_router(issues.router,        prefix="/api/issues",        tags=["Issues"])
app.include_router(map.router,           prefix="/api/map",           tags=["Map"])
app.include_router(analytics.router,     prefix="/api/analytics",     tags=["Analytics"])
app.include_router(leaderboard.router,   prefix="/api/leaderboard",   tags=["Leaderboard"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(stories.router,       prefix="/api/stories",       tags=["Stories"])
app.include_router(users.router,         prefix="/api/users",         tags=["Users"])
app.include_router(wards.router,         prefix="/api/wards",         tags=["Wards"])
app.include_router(ml.router,            prefix="/api/ml",            tags=["ML"])

@app.get("/health")
async def health(): return {"status":"ok","version":"2.0.0","city":"Puducherry"}

socket_app = socketio.ASGIApp(sio, app)
