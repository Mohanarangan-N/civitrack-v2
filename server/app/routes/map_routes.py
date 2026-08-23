from fastapi import APIRouter
from app.utils.database import get_db
from app.utils.helpers import serialize_doc

router = APIRouter()


@router.get("/pins")
async def get_map_pins():
    db = get_db()
    cursor = db.issues.find(
        {"status": {"$in": ["VERIFIED", "IN_PROGRESS", "RESOLVED"]}},
        {"_id": 1, "title": 1, "category": 1, "priority": 1, "priority_score": 1,
         "status": 1, "location": 1, "ward": 1, "like_count": 1}
    )
    pins = await cursor.to_list(length=1000)
    return [serialize_doc(p) for p in pins]


@router.get("/heatmap")
async def get_heatmap():
    db = get_db()
    cursor = db.issues.find(
        {"status": {"$in": ["VERIFIED", "IN_PROGRESS", "RESOLVED"]}},
        {"location": 1}
    )
    issues = await cursor.to_list(length=2000)
    points = []
    for issue in issues:
        loc = issue.get("location", {})
        coords = loc.get("coordinates", [])
        if len(coords) == 2:
            points.append({"lat": coords[1], "lng": coords[0], "intensity": 1})
    return points


@router.get("/wards")
async def get_ward_boundaries():
    db = get_db()
    wards = await db.wards.find({}).to_list(length=50)
    features = []
    for w in wards:
        features.append({
            "type": "Feature",
            "properties": {
                "name": w["name"],
                "name_ta": w.get("name_ta", w["name"]),
                "name_fr": w.get("name_fr", w["name"]),
                "health_score": w.get("health_score", 50),
            },
            "geometry": w.get("boundary", {}),
        })
    return {"type": "FeatureCollection", "features": features}
