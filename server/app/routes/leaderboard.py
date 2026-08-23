from fastapi import APIRouter, Depends
from app.utils.database import get_db

router = APIRouter()

@router.get("")
async def leaderboard(db=Depends(get_db)):
    users = await db["users"].find({"role":"CITIZEN"},{"name":1,"eco_score":1,"level":1,"ward":1,"avatar_url":1,"is_verified":1,"report_count":1}).sort("eco_score",-1).limit(50).to_list(50)
    result = []
    for i,u in enumerate(users):
        u["id"]=str(u["_id"]); u.pop("_id")
        u["rank"]=i+1; result.append(u)
    return result

@router.get("/ward")
async def ward_leaderboard(db=Depends(get_db)):
    wards = await db["wards"].find({}).to_list(20)
    result = []
    for w in wards:
        score = (100 - w.get("open_issues",0)*2)
        result.append({"ward":w["name"],"ward_ta":w.get("name_ta",""),"health_score":max(0,score),"open_issues":w.get("open_issues",0),"resolved_issues":w.get("resolved_issues",0)})
    return sorted(result, key=lambda x: x["health_score"], reverse=True)
