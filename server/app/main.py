import os
import asyncio
import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()

from app.utils.database import connect_db, disconnect_db, get_db
from app.routes import auth, issues, map_routes, ngo, analytics, leaderboard, stories, notifications, users, ml_routes, wards
from app.middleware.error import register_exception_handlers

# Socket.io server
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(","),
    logger=False,
    engineio_logger=False,
)

# Store sio on a module-level so routes can import it
import app.utils.socket_instance as si
si.sio = sio


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    await seed_wards()
    await seed_demo_data()
    await load_ml_models()
    yield
    await disconnect_db()


app = FastAPI(
    title="CiviTrack V2 API",
    description="AI-powered Urban Decision Support System for Puducherry",
    version="2.0.0",
    lifespan=lifespan,
)

register_exception_handlers(app)

origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router, prefix="/api/auth", tags=["Auth"])
app.include_router(issues.router, prefix="/api/issues", tags=["Issues"])
app.include_router(map_routes.router, prefix="/api/map", tags=["Map"])
app.include_router(ngo.router, prefix="/api/ngo", tags=["NGO"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(leaderboard.router, prefix="/api/leaderboard", tags=["Leaderboard"])
app.include_router(stories.router, prefix="/api/stories", tags=["Stories"])
app.include_router(notifications.router, prefix="/api/notifications", tags=["Notifications"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(ml_routes.router, prefix="/api/ml", tags=["ML"])
app.include_router(wards.router, prefix="/api/wards", tags=["Wards"])


@app.get("/")
async def root():
    return {"message": "CiviTrack V2 API", "status": "running"}


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "civitrack-v2"}


# ─── Socket.io Event Handlers ──────────────────────────────────────────────────

@sio.event
async def connect(sid, environ, auth_data):
    print(f"Client connected: {sid}")


@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")


@sio.event
async def join_user(sid, user_id):
    await sio.enter_room(sid, f"user:{user_id}")
    print(f"User {user_id} joined personal room")


@sio.event
async def join_ward(sid, ward_name):
    await sio.enter_room(sid, f"ward:{ward_name}")
    print(f"Client joined ward room: {ward_name}")


@sio.event
async def join_issue(sid, issue_id):
    await sio.enter_room(sid, f"issue:{issue_id}")
    print(f"Client joined issue room: {issue_id}")


@sio.event
async def leave_issue(sid, issue_id):
    await sio.leave_room(sid, f"issue:{issue_id}")


# ─── Seed Functions ─────────────────────────────────────────────────────────────

WARDS_DATA = [
    {"name": "White Town", "name_ta": "வெள்ளை நகர்", "name_fr": "Ville Blanche",
     "center": [11.9340, 79.8296], "health_score": 72},
    {"name": "Lawspet", "name_ta": "லாஸ்பேட்", "name_fr": "Lawspet",
     "center": [11.9513, 79.8149], "health_score": 65},
    {"name": "Oulgaret", "name_ta": "உழவர்கரை", "name_fr": "Oulgaret",
     "center": [11.9671, 79.8012], "health_score": 58},
    {"name": "Mudaliarpet", "name_ta": "முதலியார்பேட்டை", "name_fr": "Mudaliarpet",
     "center": [11.9475, 79.8402], "health_score": 61},
    {"name": "Villianur", "name_ta": "வில்லியனூர்", "name_fr": "Villianour",
     "center": [11.9204, 79.7645], "health_score": 55},
    {"name": "Ariyankuppam", "name_ta": "ஆரியன்குப்பம்", "name_fr": "Ariyankuppam",
     "center": [11.8966, 79.8106], "health_score": 62},
    {"name": "Bahour", "name_ta": "பாகூர்", "name_fr": "Bahour",
     "center": [11.8511, 79.8243], "health_score": 70},
    {"name": "Mannadipet", "name_ta": "மண்ணாடிப்பேட்டை", "name_fr": "Mannadipet",
     "center": [11.9830, 79.7713], "health_score": 67},
    {"name": "Nettapakkam", "name_ta": "நெட்டப்பாக்கம்", "name_fr": "Nettapakkam",
     "center": [11.9920, 79.7980], "health_score": 59},
    {"name": "Embalam", "name_ta": "எம்பலம்", "name_fr": "Embalam",
     "center": [11.9044, 79.7500], "health_score": 64},
]


async def seed_wards():
    db = get_db()
    count = await db.wards.count_documents({})
    if count == 0:
        print("Seeding Puducherry wards...")
        for ward in WARDS_DATA:
            lat, lng = ward["center"]
            d = 0.02  # ~2km box
            ward_doc = {
                "name": ward["name"],
                "name_ta": ward["name_ta"],
                "name_fr": ward["name_fr"],
                "health_score": ward["health_score"],
                "center": {"type": "Point", "coordinates": [lng, lat]},
                "boundary": {
                    "type": "Polygon",
                    "coordinates": [[
                        [lng - d, lat - d], [lng + d, lat - d],
                        [lng + d, lat + d], [lng - d, lat + d],
                        [lng - d, lat - d],
                    ]]
                },
                "primary_ngo_id": None,
                "backup_ngo_id": None,
            }
            await db.wards.insert_one(ward_doc)
        await db.wards.create_index([("name", 1)], unique=True)
        print(f"Seeded {len(WARDS_DATA)} wards.")


async def seed_demo_data():
    from app.utils.security import hash_password
    from datetime import datetime, timezone
    import random

    db = get_db()

    if await db.users.count_documents({}) > 0:
        return

    print("Seeding demo users and issues...")

    # Seed authority
    authority = {
        "name": "Municipal Commissioner",
        "email": "authority@civitrack.in",
        "password_hash": hash_password("authority123"),
        "role": "AUTHORITY",
        "ward": "White Town",
        "language": "en",
        "eco_score": 0,
        "level": "NEWCOMER",
        "streak": 0,
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
        "achievements": [],
    }
    auth_result = await db.users.insert_one(authority)

    # Seed NGOs (one per ward)
    ngo_ids = {}
    for ward_data in WARDS_DATA:
        ward_name = ward_data["name"]
        ngo = {
            "name": f"NGO - {ward_name}",
            "email": f"ngo.{ward_name.lower().replace(' ', '')}@civitrack.in",
            "password_hash": hash_password("ngo123"),
            "role": "NGO",
            "ward": ward_name,
            "language": "en",
            "eco_score": 0,
            "level": "NEWCOMER",
            "streak": 0,
            "is_active": True,
            "created_at": datetime.now(timezone.utc),
            "achievements": [],
        }
        result = await db.users.insert_one(ngo)
        ngo_ids[ward_name] = result.inserted_id
        await db.wards.update_one({"name": ward_name}, {"$set": {"primary_ngo_id": result.inserted_id}})

    # Seed citizen
    citizen = {
        "name": "Ravi Kumar",
        "email": "citizen@civitrack.in",
        "password_hash": hash_password("citizen123"),
        "role": "CITIZEN",
        "ward": "White Town",
        "language": "en",
        "eco_score": 350,
        "level": "OBSERVER",
        "streak": 5,
        "is_active": True,
        "created_at": datetime.now(timezone.utc),
        "achievements": ["FIRST_REPORT", "REPORTS_10"],
    }
    citizen_result = await db.users.insert_one(citizen)
    citizen_id = citizen_result.inserted_id

    # Seed sample issues
    categories = ["ROADS", "WATER", "WASTE", "LIGHTING", "AIR_QUALITY", "PARKS", "PUBLIC_PROPERTY", "OTHER"]
    statuses = ["VERIFIED", "IN_PROGRESS", "RESOLVED"]
    area_types = ["RESIDENTIAL", "COMMERCIAL", "SCHOOL_HOSPITAL", "HIGHWAY"]
    hectic_levels = ["MODERATE", "BUSY", "LOW", "EXTREMELY_BUSY"]

    sample_issues = [
        {"title": "Large pothole on MG Road", "desc": "Deep pothole causing accidents near White Town junction", "cat": "ROADS", "ward": "White Town", "lat": 11.9340, "lng": 79.8296},
        {"title": "Water supply disruption", "desc": "No water supply for 3 days in Lawspet area", "cat": "WATER", "ward": "Lawspet", "lat": 11.9513, "lng": 79.8149},
        {"title": "Garbage pile near school", "desc": "Uncollected waste near primary school for 5 days", "cat": "WASTE", "ward": "Oulgaret", "lat": 11.9671, "lng": 79.8012},
        {"title": "Broken street light", "desc": "3 consecutive street lights not working causing safety issues", "cat": "LIGHTING", "ward": "Mudaliarpet", "lat": 11.9475, "lng": 79.8402},
        {"title": "Factory smoke pollution", "desc": "Industrial smoke affecting residential area air quality", "cat": "AIR_QUALITY", "ward": "Villianur", "lat": 11.9204, "lng": 79.7645},
        {"title": "Park bench damaged", "desc": "Multiple benches in Gandhi Park are broken and unsafe", "cat": "PARKS", "ward": "Ariyankuppam", "lat": 11.8966, "lng": 79.8106},
        {"title": "Public toilet broken", "desc": "Community toilet facility non-functional for a week", "cat": "PUBLIC_PROPERTY", "ward": "Bahour", "lat": 11.8511, "lng": 79.8243},
        {"title": "Drainage overflow", "desc": "Sewage overflowing on main street causing health hazard", "cat": "WASTE", "ward": "Mannadipet", "lat": 11.9830, "lng": 79.7713},
        {"title": "Road waterlogging", "desc": "Severe waterlogging after rain, road impassable", "cat": "ROADS", "ward": "Nettapakkam", "lat": 11.9920, "lng": 79.7980},
        {"title": "Damaged footpath", "desc": "Footpath tiles broken, dangerous for pedestrians especially elderly", "cat": "ROADS", "ward": "Embalam", "lat": 11.9044, "lng": 79.7500},
        {"title": "Water pipe leakage", "desc": "Underground pipe burst, water wasting on street", "cat": "WATER", "ward": "White Town", "lat": 11.9350, "lng": 79.8310},
        {"title": "Illegal dumping site", "desc": "People dumping construction waste in open area", "cat": "WASTE", "ward": "Lawspet", "lat": 11.9520, "lng": 79.8160},
        {"title": "Park light not working", "desc": "Evening park is dark due to non-functional lights", "cat": "LIGHTING", "ward": "Oulgaret", "lat": 11.9680, "lng": 79.8020},
        {"title": "Dustbin overflow", "desc": "Municipal dustbins overflowing for days without collection", "cat": "WASTE", "ward": "Mudaliarpet", "lat": 11.9480, "lng": 79.8410},
        {"title": "Manhole open", "desc": "Open manhole without cover is dangerous especially at night", "cat": "PUBLIC_PROPERTY", "ward": "Villianur", "lat": 11.9210, "lng": 79.7655},
    ]

    from datetime import timedelta
    now = datetime.now(timezone.utc)
    priority_levels = {"LOW": 15, "MEDIUM": 35, "HIGH": 65, "CRITICAL": 85}

    for i, issue_data in enumerate(sample_issues):
        area_type = random.choice(area_types)
        hectic = random.choice(hectic_levels)
        status = random.choice(statuses)
        priority_score = random.randint(10, 95)
        priority = "LOW" if priority_score <= 25 else "MEDIUM" if priority_score <= 50 else "HIGH" if priority_score <= 75 else "CRITICAL"
        created = now - timedelta(days=random.randint(1, 30))

        status_history = [{"status": "PENDING_VERIFICATION", "changed_at": created, "changed_by": None, "note": "Issue submitted"}]
        if status in ["VERIFIED", "IN_PROGRESS", "RESOLVED"]:
            status_history.append({"status": "VERIFIED", "changed_at": created + timedelta(hours=2), "changed_by": str(ngo_ids.get(issue_data["ward"], ngo_ids["White Town"])), "note": "Verified by NGO"})
        if status in ["IN_PROGRESS", "RESOLVED"]:
            status_history.append({"status": "IN_PROGRESS", "changed_at": created + timedelta(hours=8), "changed_by": str(auth_result.inserted_id), "note": "Team assigned"})
        if status == "RESOLVED":
            status_history.append({"status": "RESOLVED", "changed_at": created + timedelta(days=3), "changed_by": str(auth_result.inserted_id), "note": "Issue resolved"})

        issue_doc = {
            "title": issue_data["title"],
            "description": issue_data["desc"],
            "category": issue_data["cat"],
            "status": status,
            "priority": priority,
            "priority_score": priority_score,
            "location": {"type": "Point", "coordinates": [issue_data["lng"], issue_data["lat"]]},
            "ward": issue_data["ward"],
            "area_type": area_type,
            "hectic_level": hectic,
            "reporter_id": citizen_id,
            "is_anonymous": False,
            "anonymous_token_hash": None,
            "ai_category": issue_data["cat"],
            "ai_confidence": round(random.uniform(0.75, 0.98), 2),
            "ai_classified_at": created + timedelta(seconds=2),
            "attachments": [],
            "status_history": status_history,
            "like_count": random.randint(0, 45),
            "comment_count": random.randint(0, 12),
            "share_count": random.randint(0, 8),
            "resolved_at": created + timedelta(days=3) if status == "RESOLVED" else None,
            "citizen_verified_resolved": status == "RESOLVED",
            "created_at": created,
            "updated_at": created,
        }
        await db.issues.insert_one(issue_doc)

    # Create 2dsphere index for geo queries
    await db.issues.create_index([("location", "2dsphere")])
    await db.issues.create_index([("status", 1), ("ward", 1)])
    await db.issues.create_index([("created_at", -1)])

    # Notifications index
    await db.notifications.create_index([("user_id", 1), ("is_read", 1)])
    await db.notifications.create_index([("created_at", -1)])

    print("Demo data seeded successfully.")
    print("Demo accounts: citizen@civitrack.in / citizen123")
    print("              authority@civitrack.in / authority123")
    print("              ngo.whitetown@civitrack.in / ngo123")


async def load_ml_models():
    try:
        from app.ml import classifier, priority, chatbot
        await asyncio.to_thread(classifier.load_or_train)
        await asyncio.to_thread(priority.load_or_train)
        await asyncio.to_thread(chatbot.load_or_train)
        print("ML models ready.")
    except Exception as e:
        print(f"Warning: ML models failed to load: {e}")


# Wrap FastAPI with Socket.io
socket_app = socketio.ASGIApp(sio, other_asgi_app=app, socketio_path="/socket.io")
