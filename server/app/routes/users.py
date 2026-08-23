from fastapi import APIRouter, Depends
from bson import ObjectId
from app.utils.database import get_db
from app.middleware.auth import get_current_user

router = APIRouter()

@router.get("/ngo/pending")
async def ngo_pending(db=Depends(get_db), user=Depends(get_current_user)):
    ward = user.get("ward","")
    issues = await db["issues"].find({"status":"PENDING_VERIFICATION","ward":ward}).sort("created_at",-1).to_list(100)
    for i in issues: i["id"]=str(i["_id"]); i.pop("_id")
    return issues

@router.get("/{user_id}")
async def get_user(user_id:str, db=Depends(get_db)):
    user = await db["users"].find_one({"_id":ObjectId(user_id)})
    if not user: return {"error":"Not found"}
    user["id"]=str(user["_id"]); user.pop("_id"); user.pop("password_hash","")
    return user
