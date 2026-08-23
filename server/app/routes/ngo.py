from fastapi import APIRouter, Depends
from app.utils.database import get_db
from app.utils.helpers import serialize_doc
from app.middleware.auth import require_ngo

router = APIRouter()


@router.get("/pending")
async def get_pending(current_user=Depends(require_ngo)):
    db = get_db()
    query = {"status": "PENDING_VERIFICATION"}
    if current_user["role"] == "NGO":
        query["ward"] = current_user["ward"]

    cursor = db.issues.find(query).sort("priority_score", -1)
    issues = await cursor.to_list(length=100)
    return [serialize_doc(i) for i in issues]


@router.get("/stats")
async def get_ward_stats(current_user=Depends(require_ngo)):
    db = get_db()
    ward = current_user["ward"] if current_user["role"] == "NGO" else None
    match = {"ward": ward} if ward else {}

    pipeline = [
        {"$match": match},
        {"$group": {
            "_id": "$status",
            "count": {"$sum": 1}
        }}
    ]
    results = await db.issues.aggregate(pipeline).to_list(length=20)
    return {r["_id"]: r["count"] for r in results}
