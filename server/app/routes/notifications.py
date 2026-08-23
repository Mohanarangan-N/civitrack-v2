from fastapi import APIRouter, Depends
from app.utils.database import get_db
from app.utils.helpers import serialize_doc
from app.middleware.auth import get_current_user

router = APIRouter()


@router.get("")
async def get_notifications(current_user=Depends(get_current_user)):
    db = get_db()
    cursor = db.notifications.find(
        {"user_id": current_user["_id"]}
    ).sort("created_at", -1).limit(50)
    notifs = await cursor.to_list(50)
    unread_count = await db.notifications.count_documents(
        {"user_id": current_user["_id"], "is_read": False}
    )
    return {"notifications": [serialize_doc(n) for n in notifs], "unread_count": unread_count}


@router.patch("/read-all")
async def mark_all_read(current_user=Depends(get_current_user)):
    db = get_db()
    await db.notifications.update_many(
        {"user_id": current_user["_id"], "is_read": False},
        {"$set": {"is_read": True}}
    )
    return {"success": True}
