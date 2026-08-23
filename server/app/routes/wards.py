from fastapi import APIRouter, Depends
from app.utils.database import get_db

router = APIRouter()

@router.get("")
async def get_wards(db=Depends(get_db)):
    wards = await db["wards"].find({}).to_list(20)
    for w in wards: w["id"]=str(w["_id"]); w.pop("_id")
    return wards
