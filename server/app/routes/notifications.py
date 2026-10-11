from fastapi import APIRouter, Depends
from bson import ObjectId
from app.utils.database import get_db
from app.utils.helpers import serialize_doc
from app.middleware.auth import get_current_user

router = APIRouter()


@router.get("")
async def get_notifications(current_user=Depends(get_current_user)):
    db = get_db()
    if db is None:
        return {"notifications": [], "unread_count": 0}

    uid_raw = current_user.get("_id") or current_user.get("id")
    query_uids = [uid_raw, str(uid_raw)]
    if ObjectId.is_valid(str(uid_raw)):
        query_uids.append(ObjectId(str(uid_raw)))

    q = {"user_id": {"$in": query_uids}}
    cursor = db.notifications.find(q).sort("created_at", -1).limit(50)
    notifs = await cursor.to_list(50)
    unread_count = await db.notifications.count_documents(
        {"user_id": {"$in": query_uids}, "is_read": False}
    )
    return {"notifications": [serialize_doc(n) for n in notifs], "unread_count": unread_count}


@router.patch("/read-all")
async def mark_all_read(current_user=Depends(get_current_user)):
    db = get_db()
    if db is None:
        return {"success": True}

    uid_raw = current_user.get("_id") or current_user.get("id")
    query_uids = [uid_raw, str(uid_raw)]
    if ObjectId.is_valid(str(uid_raw)):
        query_uids.append(ObjectId(str(uid_raw)))

    await db.notifications.update_many(
        {"user_id": {"$in": query_uids}, "is_read": False},
        {"$set": {"is_read": True}}
    )
    return {"success": True}
