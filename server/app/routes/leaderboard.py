from fastapi import APIRouter, Depends
from app.utils.database import get_db
from app.utils.helpers import serialize_doc
from app.middleware.auth import get_current_user

router = APIRouter()


@router.get("")
async def get_leaderboard():
    db = get_db()
    cursor = db.users.find(
        {"role": "CITIZEN"},
        {"_id": 1, "name": 1, "eco_score": 1, "level": 1, "ward": 1, "achievements": 1}
    ).sort("eco_score", -1).limit(50)
    users = await cursor.to_list(50)
    result = []
    for i, u in enumerate(users):
        d = serialize_doc(u)
        d["rank"] = i + 1
        result.append(d)
    return result


@router.get("/ward")
async def get_ward_leaderboard():
    db = get_db()
    pipeline = [
        {"$match": {"role": "CITIZEN"}},
        {"$group": {
            "_id": "$ward",
            "total_score": {"$sum": "$eco_score"},
            "citizen_count": {"$sum": 1},
        }},
        {"$sort": {"total_score": -1}},
        {"$limit": 10}
    ]
    results = await db.users.aggregate(pipeline).to_list(10)
    return [
        {"ward": r["_id"], "total_score": r["total_score"], "citizen_count": r["citizen_count"],
         "rank": i + 1}
        for i, r in enumerate(results)
    ]
