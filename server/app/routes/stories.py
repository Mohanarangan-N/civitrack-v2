from fastapi import APIRouter, Depends
from bson import ObjectId
from datetime import datetime, timedelta
from app.utils.database import get_db
from app.middleware.auth import get_current_user

router = APIRouter()

@router.get("")
async def get_stories(db=Depends(get_db)):
    stories = await db["stories"].find({"expires_at":{"$gt":datetime.utcnow()}}).sort("created_at",-1).to_list(50)
    for s in stories: s["id"]=str(s["_id"]); s.pop("_id")
    return stories

@router.post("")
async def post_story(body:dict, db=Depends(get_db), user=Depends(get_current_user)):
    from app.routes.issues import award_points
    now = datetime.utcnow()
    doc = {"user_id":str(user["_id"]),"user_name":user["name"],"user_role":user["role"],"content":body.get("content",""),"ward":body.get("ward",user.get("ward","")),"story_type":body.get("story_type","CITIZEN_UPDATE"),"view_count":0,"expires_at":now+timedelta(hours=24),"created_at":now}
    res = await db["stories"].insert_one(doc)
    await award_points(db,str(user["_id"]),"STORY_POSTED")
    doc["id"]=str(res.inserted_id); doc.pop("_id",None)
    return doc
