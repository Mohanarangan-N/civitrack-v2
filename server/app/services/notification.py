from app.utils.database import get_db
from app.utils.helpers import now_utc
from app.utils import socket_instance as si
from bson import ObjectId


async def create_notification(user_id: str, notif_type: str, title: str, message: str, issue_id: str = None):
    db = get_db()
    if db is None:
        return None

    uid = ObjectId(user_id) if ObjectId.is_valid(user_id) else str(user_id)
    iid = ObjectId(issue_id) if (issue_id and ObjectId.is_valid(issue_id)) else (str(issue_id) if issue_id else None)

    doc = {
        "user_id": uid,
        "type": notif_type,
        "title": title,
        "message": message,
        "is_read": False,
        "issue_id": iid,
        "created_at": now_utc(),
    }
    result = await db.notifications.insert_one(doc)

    # Emit real-time notification via Socket.io
    if si.sio:
        await si.sio.emit("notification:new", {
            "id": str(result.inserted_id),
            "type": notif_type,
            "title": title,
            "message": message,
            "issue_id": issue_id,
        }, room=f"user:{user_id}")

    return result.inserted_id


async def notify_role(role: str, notif_type: str, title: str, message: str, issue_id: str = None, ward: str = None):
    """Notify all users with a specific role (e.g. NGO in ward, or AUTHORITY for the city)."""
    db = get_db()
    if db is None:
        return

    query = {"role": role}
    if ward and role == "NGO":
        query["ward"] = ward

    cursor = db.users.find(query)
    users = await cursor.to_list(100)
    for u in users:
        uid = str(u.get("_id") or u.get("id"))
        await create_notification(uid, notif_type, title, message, issue_id)


async def emit_to_ward(ward_name: str, event: str, data: dict):
    if si.sio:
        await si.sio.emit(event, data, room=f"ward:{ward_name}")


async def emit_to_issue(issue_id: str, event: str, data: dict):
    if si.sio:
        await si.sio.emit(event, data, room=f"issue:{issue_id}")


async def emit_to_feed(event: str, data: dict):
    if si.sio:
        await si.sio.emit(event, data, room="feed")


async def emit_achievement(user_id: str, badge_key: str):
    if si.sio:
        await si.sio.emit("achievement:unlock", {"badge": badge_key}, room=f"user:{user_id}")
