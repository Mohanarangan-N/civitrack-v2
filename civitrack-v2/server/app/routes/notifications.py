from fastapi import APIRouter, Depends
from bson import ObjectId
from app.utils.database import get_db
from app.middleware.auth import get_current_user

router = APIRouter()

@router.get("")
async def get_notifications(db=Depends(get_db), user=Depends(get_current_user)):
    notifs = await db["notifications"].find({"user_id":str(user["_id"])}).sort("created_at",-1).limit(50).to_list(50)
    for n in notifs: n["id"]=str(n["_id"]); n.pop("_id")
    unread = await db["notifications"].count_documents({"user_id":str(user["_id"]),"is_read":False})
    return {"notifications":notifs,"unread_count":unread}

@router.patch("/read-all")
async def read_all(db=Depends(get_db), user=Depends(get_current_user)):
    await db["notifications"].update_many({"user_id":str(user["_id"])},{"$set":{"is_read":True}})
    return {"message":"All read"}
