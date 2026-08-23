from fastapi import APIRouter, Depends
from app.utils.database import get_db
from app.middleware.auth import require_role
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/summary")
async def summary(db=Depends(get_db)):
    total    = await db["issues"].count_documents({})
    open_    = await db["issues"].count_documents({"status":{"$in":["VERIFIED","IN_PROGRESS"]}})
    resolved = await db["issues"].count_documents({"status":"RESOLVED"})
    critical = await db["issues"].count_documents({"priority":"CRITICAL","status":{"$nin":["RESOLVED"]}})
    pending  = await db["issues"].count_documents({"status":"PENDING_VERIFICATION"})
    users    = await db["users"].count_documents({})
    return {"total_issues":total,"open_issues":open_,"resolved_issues":resolved,"critical_issues":critical,"pending_verification":pending,"total_users":users}

@router.get("/monthly")
async def monthly(db=Depends(get_db)):
    result = []
    for i in range(6,0,-1):
        d = datetime.utcnow() - timedelta(days=30*i)
        end = d + timedelta(days=30)
        count = await db["issues"].count_documents({"created_at":{"$gte":d,"$lt":end}})
        result.append({"month":d.strftime("%b %Y"),"count":count})
    return result

@router.get("/categories")
async def categories(db=Depends(get_db)):
    cats = ["ROADS","WATER","WASTE","LIGHTING","AIR_QUALITY","PARKS","PUBLIC_PROPERTY","OTHER"]
    result = []
    for c in cats:
        count = await db["issues"].count_documents({"category":c})
        result.append({"category":c,"count":count})
    return result

@router.get("/wards")
async def ward_stats(db=Depends(get_db)):
    wards = await db["wards"].find({}).to_list(20)
    result = []
    for w in wards:
        count = await db["issues"].count_documents({"ward":w["name"],"status":{"$nin":["RESOLVED"]}})
        result.append({"ward":w["name"],"ward_ta":w.get("name_ta",""),"open_issues":count,"health_score":w.get("health_score",100)})
    return result
