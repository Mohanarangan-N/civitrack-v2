import os
import asyncio
import socketio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()

from app.utils.database import connect_db, disconnect_db, get_db
from app.routes import auth, issues, map_routes, ngo, analytics, leaderboard, stories, notifications, users, ml_routes, wards, developer
from app.middleware.error import register_exception_handlers

# Socket.io server
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
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

raw_origins = os.getenv("CORS_ORIGINS", "*")
origins = ["*"] if raw_origins == "*" or "*" in raw_origins.split(",") else raw_origins.split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
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
app.include_router(developer.router, prefix="/api/developer", tags=["Developer"])


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

    user_exists = await db.users.find_one({"email": "citizen@civitrack.in"})
    if not user_exists:
        print("Seeding demo users...")

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
        auth_id = auth_result.inserted_id

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
    else:
        citizen_id = user_exists["_id"]
        auth_user = await db.users.find_one({"email": "authority@civitrack.in"})
        auth_id = auth_user["_id"] if auth_user else citizen_id
        ngo_users = await db.users.find({"role": "NGO"}).to_list(20)
        ngo_ids = {u.get("ward", "White Town"): u["_id"] for u in ngo_users}

    if await db.issues.count_documents({}) > 0:
        return
    categories = ["ROADS", "WATER", "WASTE", "LIGHTING", "AIR_QUALITY", "PARKS", "PUBLIC_PROPERTY", "OTHER"]
    statuses = ["VERIFIED", "IN_PROGRESS", "RESOLVED"]
    area_types = ["RESIDENTIAL", "COMMERCIAL", "SCHOOL_HOSPITAL", "HIGHWAY"]
    hectic_levels = ["MODERATE", "BUSY", "LOW", "EXTREMELY_BUSY"]

    CATEGORY_PHOTOS = {
        "ROADS": "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80",
        "WATER": "https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?auto=format&fit=crop&w=800&q=80",
        "WASTE": "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&w=800&q=80",
        "LIGHTING": "https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80",
        "AIR_QUALITY": "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=800&q=80",
        "PARKS": "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=800&q=80",
        "PUBLIC_PROPERTY": "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80",
        "OTHER": "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    }

    sample_issues = [
        # White Town (Ville Blanche)
        {"title": "Heritage Stormwater Drain Clogged on Rue Suffren near French Consulate", "desc": "French-era stone masonry drain blocked by silt and fallen tropical leaves after evening rain. Water pooling is causing dampness in heritage residential facades.", "cat": "WATER", "ward": "White Town", "lat": 11.9338, "lng": 79.8324, "area": "COMMERCIAL", "hectic": "BUSY", "priority": "HIGH", "score": 78},
        {"title": "Sea-Spray Railing Fracture on Promenade Beach near Gandhi Statue", "desc": "Severe saline atmospheric corrosion has compromised the structural welds on 15 meters of pedestrian safety railings facing the Bay of Bengal, creating fall risk for tourists.", "cat": "PUBLIC_PROPERTY", "ward": "White Town", "lat": 11.9315, "lng": 79.8354, "area": "COMMERCIAL", "hectic": "EXTREMELY_BUSY", "priority": "HIGH", "score": 82},
        {"title": "Sub-Base Settling and Pothole Cluster on Rue Dumas near Alliance Française", "desc": "Underground utility trenching settling has caused deep 8-inch potholes directly at the intersection. Tourist auto-rickshaws and two-wheelers frequently bottom out.", "cat": "ROADS", "ward": "White Town", "lat": 11.9302, "lng": 79.8335, "area": "RESIDENTIAL", "hectic": "MODERATE", "priority": "MEDIUM", "score": 48},

        # Lawspet
        {"title": "Severe Monsoon Crater Potholes on Airport Road opposite Tagore Arts College", "desc": "Bitumen surface stripped across both lanes over a 60-meter stretch following heavy rainfall. Multiple students on two-wheelers suffered skidding injuries during morning hours.", "cat": "ROADS", "ward": "Lawspet", "lat": 11.9542, "lng": 79.8135, "area": "SCHOOL_HOSPITAL", "hectic": "EXTREMELY_BUSY", "priority": "CRITICAL", "score": 94},
        {"title": "High-Mast Luminaire Short-Circuit at ECR-Lawspet Junction", "desc": "Main rotary high-mast lighting tower non-operational due to underground junction box moisture ingress. Heavy transit vehicles crossing in pitch dark.", "cat": "LIGHTING", "ward": "Lawspet", "lat": 11.9580, "lng": 79.8162, "area": "COMMERCIAL", "hectic": "BUSY", "priority": "HIGH", "score": 76},
        {"title": "Commercial Waste and Single-Use Plastic Overflow near Cluny School Boundary", "desc": "Community dumpsters overflowing onto the sidewalk for 4 consecutive days. Stray cattle and dogs scattering waste across the school pedestrian entry gate.", "cat": "WASTE", "ward": "Lawspet", "lat": 11.9510, "lng": 79.8150, "area": "SCHOOL_HOSPITAL", "hectic": "BUSY", "priority": "HIGH", "score": 79},

        # Oulgaret
        {"title": "Decomposed Organic Waste Accumulation near Oulgaret Municipal Market", "desc": "Post-market vegetable and poultry biological waste decomposing in open street corners without municipal compactor pickup, creating intolerable bio-hazard and foul odor.", "cat": "WASTE", "ward": "Oulgaret", "lat": 11.9685, "lng": 79.8015, "area": "COMMERCIAL", "hectic": "EXTREMELY_BUSY", "priority": "CRITICAL", "score": 92},
        {"title": "Underground Drinking Water Main Burst on Vazhudavur Road", "desc": "Pressurized 200mm municipal feeder pipeline fractured, releasing high-velocity clean drinking water across 100 meters of road and causing acute low pressure in 400 households.", "cat": "WATER", "ward": "Oulgaret", "lat": 11.9650, "lng": 79.7990, "area": "RESIDENTIAL", "hectic": "BUSY", "priority": "HIGH", "score": 81},
        {"title": "Broken Children's Swings and Unpruned Foliage in Dr. Abdul Kalam Park", "desc": "Play equipment chains severed and rusty metal edges exposed. Overgrown thorny bushes encroaching onto the children's walking circuit.", "cat": "PARKS", "ward": "Oulgaret", "lat": 11.9695, "lng": 79.8030, "area": "RESIDENTIAL", "hectic": "MODERATE", "priority": "LOW", "score": 24},

        # Mudaliarpet
        {"title": "Sewage Backflow and Drainage Siltation near Railway Level Crossing", "desc": "Sewage overflow inundating railway crossing pedestrian approaches with black stagnant effluent. Vector breeding risk and extreme commuter disruption.", "cat": "WASTE", "ward": "Mudaliarpet", "lat": 11.9460, "lng": 79.8385, "area": "RESIDENTIAL", "hectic": "EXTREMELY_BUSY", "priority": "CRITICAL", "score": 95},
        {"title": "Heavy Freight Asphalt Rutting on Cuddalore Main Road", "desc": "Longitudinal depressions and asphalt shearing caused by multi-axle freight containers heading towards the port. Two-wheelers losing balance over track grooves.", "cat": "ROADS", "ward": "Mudaliarpet", "lat": 11.9480, "lng": 79.8410, "area": "HIGHWAY", "hectic": "EXTREMELY_BUSY", "priority": "HIGH", "score": 86},
        {"title": "Missing Concrete Stormwater Slab near Mudaliarpet Girls School", "desc": "Reinforced slab shattered and fell into deep 6-foot drain channel. School children and pedestrians navigating around unbarricaded opening.", "cat": "PUBLIC_PROPERTY", "ward": "Mudaliarpet", "lat": 11.9472, "lng": 79.8395, "area": "SCHOOL_HOSPITAL", "hectic": "BUSY", "priority": "CRITICAL", "score": 91},

        # Villianur
        {"title": "Water Hyacinth Choking in Sri Gokilambal Thirukameshwara Sacred Tank", "desc": "Dense invasive water hyacinth bloom covering 85% of ancient temple tank water surface, causing biological deoxygenation and dead fish washup.", "cat": "WATER", "ward": "Villianur", "lat": 11.9215, "lng": 79.7650, "area": "RESIDENTIAL", "hectic": "BUSY", "priority": "HIGH", "score": 75},
        {"title": "Industrial Fugitive Particulate Emission along Villianur Bypass Corridor", "desc": "Dense white boiler dust and unscrubbed flue emissions settling on nearby residential colonies, causing chronic pediatric coughing and respiratory distress.", "cat": "AIR_QUALITY", "ward": "Villianur", "lat": 11.9190, "lng": 79.7620, "area": "INDUSTRIAL", "hectic": "MODERATE", "priority": "HIGH", "score": 78},
        {"title": "Low-Hanging 440V Cable Sagging across Villianur Market Footpath", "desc": "Overhead three-phase power line sagging to less than 7 feet above pedestrian pathway due to snapped cross-arm insulator, presenting lethal electrocution danger.", "cat": "LIGHTING", "ward": "Villianur", "lat": 11.9228, "lng": 79.7665, "area": "COMMERCIAL", "hectic": "EXTREMELY_BUSY", "priority": "CRITICAL", "score": 97},

        # Ariyankuppam
        {"title": "Unauthorized Construction Debris Dumped at Chunnambar Mangrove Edge", "desc": "Concrete demolition blocks and non-biodegradable debris systematically dumped into coastal wetland mangrove zone along Chunnambar backwaters.", "cat": "WASTE", "ward": "Ariyankuppam", "lat": 11.8950, "lng": 79.8090, "area": "COMMERCIAL", "hectic": "BUSY", "priority": "HIGH", "score": 80},
        {"title": "Solar Photovoltaic Streetlight Battery Theft on Ariyankuppam River Bridge", "desc": "Four consecutive standalone solar street fixtures stripped of lithium storage packs, leaving the coastal link bridge pitch dark at night.", "cat": "LIGHTING", "ward": "Ariyankuppam", "lat": 11.8975, "lng": 79.8115, "area": "HIGHWAY", "hectic": "BUSY", "priority": "MEDIUM", "score": 52},

        # Bahour
        {"title": "Irrigation Feeder Canal Siltation and Broken Sluice at Bahour Lake", "desc": "Primary silt gate jammed with sediment and vegetative debris, choking gravity irrigation flow to 200 hectares of downstream agricultural paddy fields.", "cat": "WATER", "ward": "Bahour", "lat": 11.8520, "lng": 79.8235, "area": "RURAL", "hectic": "MODERATE", "priority": "HIGH", "score": 74},
        {"title": "Motor Burnout in Community Sanitation Block near Bahour Bus Terminus", "desc": "Borewell submersible pump burned out for 6 days. Rural commuters and daily market vendors left without running sanitation water.", "cat": "PUBLIC_PROPERTY", "ward": "Bahour", "lat": 11.8505, "lng": 79.8250, "area": "COMMERCIAL", "hectic": "BUSY", "priority": "HIGH", "score": 72},

        # Mannadipet
        {"title": "Sugarcane Tractor Spillage and Shoulder Collapse on Thirukanur Link Road", "desc": "Sugar harvest season heavy trailer traffic has crumbled the asphalt road shoulder into agricultural ditches, creating blind turn overturning hazard.", "cat": "ROADS", "ward": "Mannadipet", "lat": 11.9840, "lng": 79.7725, "area": "RURAL", "hectic": "MODERATE", "priority": "MEDIUM", "score": 55},
        {"title": "Open Biomass and Plastic Burning near Residential Agricultural Boundary", "desc": "Unregulated evening field trash fires emitting dense smoke plumes across the primary school and rural health sub-centre.", "cat": "AIR_QUALITY", "ward": "Mannadipet", "lat": 11.9815, "lng": 79.7700, "area": "RURAL", "hectic": "LOW", "priority": "MEDIUM", "score": 46},

        # Nettapakkam
        {"title": "Severe Rain Waterlogging at Nettapakkam Primary Health Centre Entrance", "desc": "Knee-deep water stagnation blocking ambulance access ramp and outpatient entry following rainfall due to unmaintained culvert.", "cat": "ROADS", "ward": "Nettapakkam", "lat": 11.9930, "lng": 79.7975, "area": "SCHOOL_HOSPITAL", "hectic": "BUSY", "priority": "CRITICAL", "score": 93},
        {"title": "High Turbidity and Rust Sediment in Madagadipet Community Tap Water", "desc": "Tap water running cloudy brown with metallic odor for 3 days; suspected sub-surface pipe corrosion in 30-year-old distribution loop.", "cat": "WATER", "ward": "Nettapakkam", "lat": 11.9910, "lng": 79.7990, "area": "RESIDENTIAL", "hectic": "BUSY", "priority": "HIGH", "score": 83},

        # Embalam
        {"title": "Collapsed Footpath Tiles and Danger to School Pedestrians near Embalam GHSS", "desc": "Footpath pavers cave-in over 25 meters directly fronting Embalam Government Higher Secondary School, forcing elementary students into bus traffic.", "cat": "ROADS", "ward": "Embalam", "lat": 11.9050, "lng": 79.7495, "area": "SCHOOL_HOSPITAL", "hectic": "EXTREMELY_BUSY", "priority": "HIGH", "score": 87},
        {"title": "Defunct RO Drinking Water Purification Plant in Embalam Village Centre", "desc": "Membrane fouling and power trip in community water plant leaving 250 rural families without affordable purified drinking water.", "cat": "WATER", "ward": "Embalam", "lat": 11.9035, "lng": 79.7510, "area": "RURAL", "hectic": "MODERATE", "priority": "HIGH", "score": 76}
    ]

    from datetime import timedelta
    now = datetime.now(timezone.utc)

    for i, issue_data in enumerate(sample_issues):
        area_type = issue_data.get("area", random.choice(area_types))
        hectic = issue_data.get("hectic", random.choice(hectic_levels))
        status = statuses[i % len(statuses)]
        priority = issue_data.get("priority", "HIGH")
        priority_score = issue_data.get("score", 75)
        created = now - timedelta(days=(i * 1.2 + 1))

        status_history = [{"status": "PENDING_VERIFICATION", "changed_at": created, "changed_by": None, "note": "Issue submitted"}]
        if status in ["VERIFIED", "IN_PROGRESS", "RESOLVED"]:
            status_history.append({"status": "VERIFIED", "changed_at": created + timedelta(hours=2), "changed_by": str(ngo_ids.get(issue_data["ward"], ngo_ids["White Town"])), "note": "Verified by Ward NGO"})
        if status in ["IN_PROGRESS", "RESOLVED"]:
            status_history.append({"status": "IN_PROGRESS", "changed_at": created + timedelta(hours=8), "changed_by": str(auth_id), "note": "Assigned to Municipal Engineering Team"})
        if status == "RESOLVED":
            status_history.append({"status": "RESOLVED", "changed_at": created + timedelta(days=2.5), "changed_by": str(auth_id), "note": "Field repairs completed and audited"})

        issue_photo = CATEGORY_PHOTOS.get(issue_data["cat"], CATEGORY_PHOTOS["OTHER"])

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
            "ai_confidence": round(random.uniform(0.91, 0.99), 2),
            "ai_classified_at": created + timedelta(seconds=2),
            "attachments": [issue_photo],
            "status_history": status_history,
            "like_count": random.randint(8, 64),
            "comment_count": random.randint(2, 18),
            "share_count": random.randint(1, 14),
            "resolved_at": created + timedelta(days=2.5) if status == "RESOLVED" else None,
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
