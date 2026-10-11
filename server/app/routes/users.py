from fastapi import APIRouter, HTTPException
from bson import ObjectId
from app.utils.database import get_db
from app.utils.helpers import serialize_doc

router = APIRouter()


@router.get("/{user_id}")
async def get_user_profile(user_id: str):
    db = get_db()
    if db is None:
        # Standalone mock fallback for demo users
        demo_profiles = {
            "usr-citizen-01": {"id": "usr-citizen-01", "name": "Sundararajan M", "email": "citizen@civitrack.in", "role": "CITIZEN", "ward": "White Town", "eco_score": 380, "level": "PUDUCHERRY DEFENDER", "achievements": ["FIRST_REPORT", "ECO_WARRIOR"]},
            "usr-ngo-01": {"id": "usr-ngo-01", "name": "Pondy Citizen Action Trust", "email": "ngo.whitetown@civitrack.in", "role": "NGO", "ward": "White Town", "eco_score": 1200, "level": "COMMUNITY PILLAR", "achievements": ["FIRST_VERIFY", "COMMUNITY_PILLAR"]},
            "usr-auth-01": {"id": "usr-auth-01", "name": "Puducherry Municipal Commissioner", "email": "authority@civitrack.in", "role": "AUTHORITY", "ward": "All Wards", "eco_score": 2500, "level": "MUNICIPAL CHIEF", "achievements": ["QUICK_DISPATCH", "CITY_CHIEF"]},
        }
        if user_id in demo_profiles:
            return demo_profiles[user_id]
        return {"id": user_id, "name": "Civic User", "email": f"{user_id}@civitrack.in", "role": "CITIZEN", "ward": "White Town", "eco_score": 150, "level": "ACTIVE CITIZEN", "achievements": ["FIRST_REPORT"]}

    user = None
    if ObjectId.is_valid(user_id):
        user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        user = await db.users.find_one({"$or": [{"id": user_id}, {"email": user_id}, {"_id": user_id}]})
    
    if not user:
        # Check if it matches predefined demo IDs
        demo_profiles = {
            "usr-citizen-01": {"id": "usr-citizen-01", "name": "Sundararajan M", "email": "citizen@civitrack.in", "role": "CITIZEN", "ward": "White Town", "eco_score": 380, "level": "PUDUCHERRY DEFENDER", "achievements": ["FIRST_REPORT", "ECO_WARRIOR"]},
            "usr-ngo-01": {"id": "usr-ngo-01", "name": "Pondy Citizen Action Trust", "email": "ngo.whitetown@civitrack.in", "role": "NGO", "ward": "White Town", "eco_score": 1200, "level": "COMMUNITY PILLAR", "achievements": ["FIRST_VERIFY", "COMMUNITY_PILLAR"]},
            "usr-auth-01": {"id": "usr-auth-01", "name": "Puducherry Municipal Commissioner", "email": "authority@civitrack.in", "role": "AUTHORITY", "ward": "All Wards", "eco_score": 2500, "level": "MUNICIPAL CHIEF", "achievements": ["QUICK_DISPATCH", "CITY_CHIEF"]},
        }
        if user_id in demo_profiles:
            return demo_profiles[user_id]
        raise HTTPException(status_code=404, detail="User not found")
        
    doc = serialize_doc(user)
    doc.pop("password_hash", None)
    return doc


@router.get("/{user_id}/issues")
async def get_user_issues(user_id: str, page: int = 1, limit: int = 20):
    db = get_db()
    if db is None:
        return {"issues": [], "total": 0}

    query = {"$or": [{"reporter_id": user_id}, {"reporter_id": str(user_id)}]}
    if ObjectId.is_valid(user_id):
        query["$or"].append({"reporter_id": ObjectId(user_id)})

    skip = (page - 1) * limit
    cursor = db.issues.find(query).sort("created_at", -1).skip(skip).limit(limit)
    issues = await cursor.to_list(limit)
    total = await db.issues.count_documents(query)
    return {"issues": [serialize_doc(i) for i in issues], "total": total}
