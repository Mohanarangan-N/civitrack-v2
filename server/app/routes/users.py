from fastapi import APIRouter, HTTPException
from bson import ObjectId
from app.utils.database import get_db
from app.utils.helpers import serialize_doc

router = APIRouter()


@router.get("/{user_id}")
async def get_user_profile(user_id: str):
    db = get_db()
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    doc = serialize_doc(user)
    doc.pop("password_hash", None)
    return doc


@router.get("/{user_id}/issues")
async def get_user_issues(user_id: str, page: int = 1, limit: int = 20):
    db = get_db()
    try:
        uid = ObjectId(user_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid user ID")

    skip = (page - 1) * limit
    cursor = db.issues.find({"reporter_id": uid}).sort("created_at", -1).skip(skip).limit(limit)
    issues = await cursor.to_list(limit)
    total = await db.issues.count_documents({"reporter_id": uid})
    return {"issues": [serialize_doc(i) for i in issues], "total": total}
