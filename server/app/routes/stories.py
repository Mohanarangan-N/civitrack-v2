from fastapi import APIRouter, Depends
from datetime import datetime, timedelta, timezone
from app.utils.database import get_db
from app.utils.helpers import serialize_doc, now_utc
from app.middleware.auth import get_current_user
from app.models.social import StoryCreate
from app.services.ecoscore import award_points

router = APIRouter()


@router.get("")
async def get_stories():
    db = get_db()
    now = datetime.now(timezone.utc)
    cursor = db.stories.find({"expires_at": {"$gt": now}}).sort("created_at", -1)
    stories = await cursor.to_list(length=50)
    return [serialize_doc(s) for s in stories]


@router.post("")
async def post_story(body: StoryCreate, current_user=Depends(get_current_user)):
    db = get_db()
    doc = {
        "media_url": body.media_url,
        "ward": body.ward,
        "user_id": current_user["_id"],
        "user_name": current_user["name"],
        "expires_at": now_utc() + timedelta(hours=24),
        "created_at": now_utc(),
    }
    result = await db.stories.insert_one(doc)
    await award_points(str(current_user["_id"]), "STORY_POSTED")
    return {"id": str(result.inserted_id), "expires_at": doc["expires_at"].isoformat()}
