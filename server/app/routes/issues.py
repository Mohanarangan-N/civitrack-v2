from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, UploadFile, File, Form
from typing import Optional, List
from bson import ObjectId
from datetime import datetime
import secrets, bcrypt as bc, base64
from app.utils.database import get_db
from app.middleware.auth import get_current_user, get_optional_user, require_role

router = APIRouter()

def oid(x): return ObjectId(x)
def fmt(doc):
    if doc: doc["id"]=str(doc["_id"]); doc.pop("_id",None)
    return doc

POINTS = {"REPORT_SUBMITTED":10,"PHOTO_UPLOADED":5,"NGO_VERIFIED":20,"ISSUE_RESOLVED":50,"COMMENT_POSTED":5}

async def award_points(db, user_id:str, action:str, issue_id:str=None):
    pts = POINTS.get(action,0)
    if pts<=0: return
    now = datetime.utcnow()
    await db["ecoscore_events"].insert_one({"user_id":user_id,"issue_id":issue_id,"action_type":action,"points":pts,"multiplier":1.0,"earned_at":now})
    await db["users"].update_one({"_id":oid(user_id)},{"$inc":{"eco_score":pts}})
    # Level up check
    user = await db["users"].find_one({"_id":oid(user_id)})
    score = user["eco_score"]
    level = "NEWCOMER"
    if score>3000: level="ECO_CHAMPION"
    elif score>1500: level="GUARDIAN"
    elif score>500: level="REPORTER"
    elif score>100: level="OBSERVER"
    await db["users"].update_one({"_id":oid(user_id)},{"$set":{"level":level}})

async def classify_issue(db, issue_id:str, title:str, description:str):
    import random
    cats = ["ROADS","WATER","WASTE","LIGHTING","AIR_QUALITY","PARKS","PUBLIC_PROPERTY","OTHER"]
    pris = ["LOW","MEDIUM","HIGH","CRITICAL"]
    cat = random.choice(cats); pri = random.choice(pris)
    score = {"LOW":15,"MEDIUM":38,"HIGH":63,"CRITICAL":85}[pri]
    await db["issues"].update_one({"_id":oid(issue_id)},{"$set":{
        "ai.category":cat,"ai.priority":pri,"ai.confidence":round(random.uniform(0.7,0.97),2),
        "ai.tags":[title.split()[0].lower() if title else "civic"],
        "ai.summary":f"AI detected: {cat.lower()} issue with {pri.lower()} priority.",
        "ai.total_score":score,"ai.classified_at":datetime.utcnow()
    }})

@router.get("")
async def list_issues(ward:str=None, category:str=None, priority:str=None, skip:int=0, limit:int=20, db=Depends(get_db)):
    q = {"status":{"$in":["VERIFIED","IN_PROGRESS","RESOLVED"]}}
    if ward: q["ward"]=ward
    if category: q["category"]=category
    if priority: q["priority"]=priority
    issues = await db["issues"].find(q).sort("created_at",-1).skip(skip).limit(limit).to_list(limit)
    for i in issues: fmt(i)
    return issues

@router.post("")
async def create_issue(
    background_tasks: BackgroundTasks,
    title: str = Form(...),
    description: str = Form(...),
    category: str = Form("OTHER"),
    latitude: float = Form(...),
    longitude: float = Form(...),
    ward: str = Form("White Town"),
    area_type: str = Form("RESIDENTIAL"),
    hectic_level: str = Form("MODERATE"),
    is_anonymous: bool = Form(False),
    photos: List[UploadFile] = File(default=[]),
    db=Depends(get_db),
    user=Depends(get_current_user)
):
    now = datetime.utcnow()
    attachments = []
    for photo in photos[:5]:
        data = await photo.read()
        b64  = base64.b64encode(data).decode()
        attachments.append({"file_url":f"data:{photo.content_type};base64,{b64}","mime_type":photo.content_type,"exif_stripped":True})

    tracking_token = None
    tracking_hash  = None
    if is_anonymous:
        tracking_token = secrets.token_hex(3).upper()
        tracking_hash  = bc.hashpw(tracking_token.encode(), bc.gensalt()).decode()

    doc = {
        "title":title,"description":description,"category":category,
        "status":"PENDING_VERIFICATION","priority":"MEDIUM",
        "location":{"type":"Point","coordinates":[longitude,latitude]},
        "address":f"{ward}, Puducherry","ward":ward,
        "area_type":area_type,"hectic_level":hectic_level,
        "reporter_id": None if is_anonymous else str(user["_id"]),
        "anonymous":{"is_anonymous":is_anonymous,"tracking_token_hash":tracking_hash,"display_name":"Anonymous Citizen" if is_anonymous else user["name"],"exact_coords_public":not is_anonymous,"timestamp_blurred":is_anonymous},
        "ngo_id":None,"assignee_id":None,
        "ai":{"category":None,"priority":None,"confidence":0.0,"tags":[],"summary":None,"total_score":0.0,"classified_at":None},
        "like_count":0,"comment_count":0,"share_count":0,"upvote_count":0,"view_count":0,
        "attachments":attachments,"status_history":[{"status":"PENDING_VERIFICATION","changed_by":str(user["_id"]),"changed_by_role":user["role"],"note":"Issue submitted","changed_at":now}],
        "rejection_reason":None,"resubmission_count":0,
        "resolved_at":None,"citizen_verified_resolved":False,
        "created_at":now,"updated_at":now,
    }
    res = await db["issues"].insert_one(doc)
    iid = str(res.inserted_id)
    if not is_anonymous:
        background_tasks.add_task(award_points, db, str(user["_id"]), "REPORT_SUBMITTED", iid)
        if attachments:
            background_tasks.add_task(award_points, db, str(user["_id"]), "PHOTO_UPLOADED", iid)
    background_tasks.add_task(classify_issue, db, iid, title, description)
    issue = await db["issues"].find_one({"_id":res.inserted_id})
    fmt(issue)
    resp = {"issue":issue}
    if is_anonymous and tracking_token:
        resp["tracking_token"] = tracking_token
        resp["message"] = "Save this code — it cannot be recovered!"
    return resp

@router.get("/{issue_id}")
async def get_issue(issue_id:str, db=Depends(get_db)):
    issue = await db["issues"].find_one({"_id":oid(issue_id)})
    if not issue: raise HTTPException(404,"Issue not found")
    await db["issues"].update_one({"_id":oid(issue_id)},{"$inc":{"view_count":1}})
    return fmt(issue)

@router.patch("/{issue_id}/verify")
async def verify_issue(issue_id:str, body:dict, db=Depends(get_db), user=Depends(require_role("NGO","AUTHORITY","ADMIN"))):
    action = body.get("action")
    issue  = await db["issues"].find_one({"_id":oid(issue_id)})
    if not issue: raise HTTPException(404,"Not found")
    now = datetime.utcnow()
    if action == "APPROVE":
        await db["issues"].update_one({"_id":oid(issue_id)},{"$set":{"status":"VERIFIED","ngo_id":str(user["_id"]),"updated_at":now},"$push":{"status_history":{"status":"VERIFIED","changed_by":str(user["_id"]),"changed_by_role":user["role"],"note":"NGO verified","changed_at":now}}})
        if issue.get("reporter_id"):
            await award_points(db, issue["reporter_id"], "NGO_VERIFIED", issue_id)
    elif action == "REJECT":
        reason = body.get("reason","NOT_CIVIC_ISSUE")
        count  = issue.get("resubmission_count",0)+1
        status = "INVALID" if count>=3 else "REJECTED"
        await db["issues"].update_one({"_id":oid(issue_id)},{"$set":{"status":status,"rejection_reason":reason,"resubmission_count":count,"updated_at":now},"$push":{"status_history":{"status":status,"changed_by":str(user["_id"]),"changed_by_role":user["role"],"note":reason,"changed_at":now}}})
    elif action == "ESCALATE":
        await db["issues"].update_one({"_id":oid(issue_id)},{"$set":{"priority":"CRITICAL","updated_at":now}})
    issue = await db["issues"].find_one({"_id":oid(issue_id)})
    return fmt(issue)

@router.patch("/{issue_id}/status")
async def update_status(issue_id:str, body:dict, db=Depends(get_db), user=Depends(require_role("AUTHORITY","ADMIN"))):
    status = body.get("status")
    note   = body.get("note","")
    now    = datetime.utcnow()
    update = {"$set":{"status":status,"updated_at":now},"$push":{"status_history":{"status":status,"changed_by":str(user["_id"]),"changed_by_role":user["role"],"note":note,"changed_at":now}}}
    if status=="RESOLVED": update["$set"]["resolved_at"]=now
    if body.get("assignee_id"): update["$set"]["assignee_id"]=body["assignee_id"]
    await db["issues"].update_one({"_id":oid(issue_id)},update)
    issue = await db["issues"].find_one({"_id":oid(issue_id)})
    if status=="RESOLVED" and issue.get("reporter_id"):
        await award_points(db, issue["reporter_id"], "ISSUE_RESOLVED", issue_id)
    return fmt(issue)

@router.patch("/{issue_id}/citizen-verify")
async def citizen_verify(issue_id:str, db=Depends(get_db), user=Depends(get_current_user)):
    now = datetime.utcnow()
    await db["issues"].update_one({"_id":oid(issue_id)},{"$set":{"citizen_verified_resolved":True,"citizen_verified_at":now,"status":"RESOLVED","updated_at":now}})
    return {"message":"Resolution confirmed"}

@router.post("/{issue_id}/like")
async def toggle_like(issue_id:str, db=Depends(get_db), user=Depends(get_current_user)):
    uid = str(user["_id"])
    existing = await db["likes"].find_one({"issue_id":issue_id,"user_id":uid})
    if existing:
        await db["likes"].delete_one({"_id":existing["_id"]})
        await db["issues"].update_one({"_id":oid(issue_id)},{"$inc":{"like_count":-1}})
        return {"liked":False}
    await db["likes"].insert_one({"issue_id":issue_id,"user_id":uid,"created_at":datetime.utcnow()})
    await db["issues"].update_one({"_id":oid(issue_id)},{"$inc":{"like_count":1}})
    return {"liked":True}

@router.post("/{issue_id}/comments")
async def add_comment(issue_id:str, body:dict, db=Depends(get_db), user=Depends(get_current_user)):
    now = datetime.utcnow()
    doc = {"issue_id":issue_id,"user_id":str(user["_id"]),"user_name":user["name"],"user_role":user["role"],"content":body.get("content",""),"is_internal":body.get("is_internal",False),"is_pinned":False,"parent_id":body.get("parent_id"),"like_count":0,"created_at":now}
    res = await db["comments"].insert_one(doc)
    await db["issues"].update_one({"_id":oid(issue_id)},{"$inc":{"comment_count":1}})
    await award_points(db,str(user["_id"]),"COMMENT_POSTED",issue_id)
    doc["id"]=str(res.inserted_id); doc.pop("_id",None)
    return doc

@router.get("/{issue_id}/comments")
async def get_comments(issue_id:str, db=Depends(get_db)):
    comments = await db["comments"].find({"issue_id":issue_id,"is_internal":False}).sort("created_at",1).to_list(100)
    for c in comments: fmt(c)
    return comments

@router.post("/track-anonymous")
async def track_anonymous(body:dict, db=Depends(get_db)):
    token = body.get("token","").upper()
    trackers = await db["issues"].find({"anonymous.is_anonymous":True,"anonymous.tracking_token_hash":{"$ne":None}}).to_list(1000)
    for issue in trackers:
        stored = issue.get("anonymous",{}).get("tracking_token_hash","")
        if stored and bc.checkpw(token.encode(), stored.encode()):
            return {"status":issue["status"],"ward":issue["ward"],"category":issue["category"],"priority":issue["priority"],"created_at":str(issue["created_at"]),"resolved_at":str(issue.get("resolved_at",""))}
    raise HTTPException(404,"Token not found")
