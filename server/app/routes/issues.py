import asyncio
from fastapi import APIRouter, HTTPException, Depends, Query
from bson import ObjectId
from typing import Optional

from app.models.issue import IssueCreate, IssueVerify, IssueStatusUpdate, CommentCreate
from app.utils.database import get_db
from app.utils.helpers import now_utc, serialize_doc
from app.utils.developer_logger import log_event
from app.middleware.auth import get_current_user, get_optional_user, require_ngo, require_authority, require_citizen
from app.services.ecoscore import award_points
from app.services.notification import create_notification, emit_to_ward, emit_to_issue
from app.services.anonymous import generate_tracking_token, hash_token, verify_token

router = APIRouter()


@router.get("")
async def get_issues(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    category: Optional[str] = None,
    priority: Optional[str] = None,
    ward: Optional[str] = None,
    current_user=Depends(get_optional_user),
):
    db = get_db()
    base_filter = {"$in": ["VERIFIED", "IN_PROGRESS", "RESOLVED"]}
    if current_user:
        user_id = current_user["_id"]
        query = {
            "$or": [
                {"status": base_filter},
                {"reporter_id": user_id, "status": "PENDING_VERIFICATION"}
            ]
        }
    else:
        query = {"status": base_filter}
    if category:
        query["category"] = category
    if priority:
        query["priority"] = priority
    if ward:
        query["ward"] = ward

    skip = (page - 1) * limit
    cursor = db.issues.find(query).sort("created_at", -1).skip(skip).limit(limit)
    issues = await cursor.to_list(length=limit)
    total = await db.issues.count_documents(query)

    result = []
    for issue in issues:
        doc = serialize_doc(issue)
        # Anonymize if needed
        if doc.get("is_anonymous"):
            doc["reporter_id"] = None
            doc["reporter_name"] = "Anonymous Citizen 🎭"
        result.append(doc)

    return {"issues": result, "total": total, "page": page, "limit": limit}


@router.post("")
async def submit_issue(body: IssueCreate, current_user=Depends(get_current_user)):
    db = get_db()
    user_id = current_user["_id"]

    tracking_token = None
    token_hash = None
    if body.is_anonymous:
        tracking_token = generate_tracking_token()
        token_hash = hash_token(tracking_token)

    # AI Intelligent Auto-Inference for area and hecticity if standard defaults
    text_corpus = f"{body.title} {body.description}".lower()
    inferred_area = body.area_type.value
    inferred_hectic = body.hectic_level.value

    if "highway" in text_corpus or "national highway" in text_corpus or "bypass" in text_corpus:
        inferred_area = "HIGHWAY"
    elif "school" in text_corpus or "hospital" in text_corpus or "college" in text_corpus or "clinic" in text_corpus:
        inferred_area = "SCHOOL_HOSPITAL"
    elif "market" in text_corpus or "bazaar" in text_corpus or "shop" in text_corpus or "commercial" in text_corpus:
        inferred_area = "COMMERCIAL"

    if "emergency" in text_corpus or "accident" in text_corpus or "severe" in text_corpus or "danger" in text_corpus:
        inferred_hectic = "EXTREMELY_BUSY"
    elif "busy" in text_corpus or "heavy traffic" in text_corpus or "daily" in text_corpus:
        inferred_hectic = "BUSY"

    # Synchronous AI Vision pre-validation if attachment exists
    from app.ml.vision_validator import analyze_image_evidence
    ai_vision = None
    if body.attachments and len(body.attachments) > 0:
        try:
            ai_vision = analyze_image_evidence(body.attachments[0], body.category.value, body.title, body.description)
        except Exception:
            ai_vision = None

    doc = {
        "title": body.title,
        "description": body.description,
        "category": body.category.value,
        "status": "PENDING_VERIFICATION",
        "priority": "MEDIUM",
        "priority_score": 50,
        "location": {"type": "Point", "coordinates": [body.longitude, body.latitude]},
        "ward": body.ward,
        "area_type": inferred_area,
        "hectic_level": inferred_hectic,
        "reporter_id": None if body.is_anonymous else user_id,
        "reporter_name": "Anonymous Citizen 🎭" if body.is_anonymous else current_user.get("name", "Citizen Reporter"),
        "is_anonymous": body.is_anonymous,
        "anonymous_token_hash": token_hash,
        "ai_category": body.category.value,
        "ai_confidence": None,
        "ai_classified_at": None,
        "ai_vision_analysis": ai_vision,
        "attachments": body.attachments or [],
        "status_history": [{
            "status": "PENDING_VERIFICATION",
            "changed_at": now_utc(),
            "changed_by": None,
            "note": "Issue submitted by citizen"
        }],
        "like_count": 0,
        "comment_count": 0,
        "share_count": 0,
        "resolved_at": None,
        "citizen_verified_resolved": False,
        "created_at": now_utc(),
        "updated_at": now_utc(),
    }

    import time as _time
    _t0 = _time.time()
    result = await db.issues.insert_one(doc)
    issue_id = str(result.inserted_id)
    _dur = (_time.time() - _t0) * 1000
    log_event("submit_issue", _dur, "SUCCESS", {
        "issue_id": issue_id, "category": body.category.value,
        "ward": body.ward, "anonymous": body.is_anonymous,
        "vision_flag": ai_vision.get("flag") if ai_vision else None,
    })

    # Award points (not for anonymous)
    if not body.is_anonymous:
        await award_points(str(user_id), "REPORT_SUBMITTED")

    # Notify ward NGO
    await emit_to_ward(body.ward, "ngo:pending", {
        "issue_id": issue_id,
        "title": body.title,
        "category": body.category.value,
        "ward": body.ward,
    })

    # Async ML classification
    asyncio.create_task(_classify_issue_async(issue_id, body.title, body.description,
                                               inferred_area, inferred_hectic, body.attachments))

    response = {"id": issue_id, "status": "PENDING_VERIFICATION", "ai_vision": ai_vision}
    if tracking_token:
        response["tracking_token"] = tracking_token
        response["tracking_message"] = "Save this code! It's the ONLY way to track your anonymous report."
    return response


async def _classify_issue_async(issue_id: str, title: str, description: str, area_type: str, hectic_level: str, attachments: list = None):
    """Async ML classification runs after response is sent."""
    import time as _time
    await asyncio.sleep(1)
    _t0 = _time.time()
    try:
        from app.ml import classifier, priority
        from app.ml.vision_validator import analyze_image_evidence
        text = f"{title} {description}"
        cat_result = classifier.predict(text)
        
        # Image severity adjustment from vision
        hazard_score = 0.5
        vision_result = None
        if attachments and len(attachments) > 0:
            vision_result = analyze_image_evidence(attachments[0], cat_result["category"], title, description)
            if not vision_result.get("valid", True):
                hazard_score = 0.2
            else:
                hazard_score = vision_result.get("evidence_score", 0.7)

        priority_result = priority.compute_score(area_type, hectic_level, hazard_score)

        priority_label = (
            "LOW" if priority_result <= 25 else
            "MEDIUM" if priority_result <= 50 else
            "HIGH" if priority_result <= 75 else
            "CRITICAL"
        )

        db = get_db()
        await db.issues.update_one(
            {"_id": ObjectId(issue_id)},
            {"$set": {
                "ai_category": cat_result["category"],
                "ai_confidence": cat_result["confidence"],
                "ai_classified_at": now_utc(),
                "priority": priority_label,
                "priority_score": priority_result,
                "ai_vision_analysis": vision_result,
                "updated_at": now_utc(),
            }}
        )
        _dur = (_time.time() - _t0) * 1000
        log_event("ml_classify_async", _dur, "SUCCESS", {
            "issue_id": issue_id,
            "ai_category": cat_result["category"],
            "ai_confidence": cat_result["confidence"],
            "priority": priority_label,
            "priority_score": priority_result,
            "vision_scene": vision_result.get("scene_detected") if vision_result else None
        })
    except Exception as e:
        _dur = (_time.time() - _t0) * 1000
        log_event("ml_classify_async", _dur, "ERROR", {"issue_id": issue_id, "error": str(e)})
        print(f"ML classification error for {issue_id}: {e}")


@router.get("/track-anonymous")
async def track_anonymous(token: str = Query(...)):
    db = get_db()
    # Find issues with anonymous token hash
    cursor = db.issues.find({"is_anonymous": True, "anonymous_token_hash": {"$ne": None}})
    async for issue in cursor:
        if verify_token(token.upper(), issue["anonymous_token_hash"]):
            return {
                "title": issue["title"],
                "status": issue["status"],
                "ward": issue["ward"],
                "category": issue["category"],
                "created_at": "recently",
                "status_history": [
                    {"status": h["status"], "note": h.get("note", "")}
                    for h in issue.get("status_history", [])
                ],
            }
    raise HTTPException(status_code=404, detail="Invalid tracking code")


@router.get("/{issue_id}")
async def get_issue(issue_id: str, current_user=Depends(get_optional_user)):
    db = get_db()
    try:
        issue = await db.issues.find_one({"_id": ObjectId(issue_id)})
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid issue ID")

    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    # Visibility rules
    if issue["status"] == "PENDING_VERIFICATION":
        if not current_user:
            raise HTTPException(status_code=403, detail="Not authorized")
        uid = current_user["_id"]
        is_owner = str(issue.get("reporter_id")) == str(uid)
        is_staff = current_user["role"] in ["NGO", "AUTHORITY"]
        if not (is_owner or is_staff):
            raise HTTPException(status_code=403, detail="Issue is pending verification")

    doc = serialize_doc(issue)
    if doc.get("is_anonymous"):
        doc["reporter_id"] = None
        doc["reporter_name"] = "Anonymous Citizen 🎭"
    return doc


@router.patch("/{issue_id}/verify")
async def verify_issue(issue_id: str, body: IssueVerify, current_user=Depends(require_ngo)):
    db = get_db()
    issue = await db.issues.find_one({"_id": ObjectId(issue_id)})
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    # Ward-specific NGO only
    if current_user["role"] == "NGO" and issue["ward"] != current_user["ward"]:
        raise HTTPException(status_code=403, detail="You can only verify issues from your ward")

    if issue["status"] != "PENDING_VERIFICATION":
        raise HTTPException(status_code=400, detail="Issue is not pending verification")

    if body.action == "approve":
        new_status = "VERIFIED"
        if body.escalate_to_critical:
            new_priority = "CRITICAL"
            new_score = 90
        else:
            new_priority = issue.get("priority", "MEDIUM")
            new_score = issue.get("priority_score", 50)

        update = {
            "status": new_status,
            "priority": new_priority,
            "priority_score": new_score,
            "updated_at": now_utc(),
        }
        history_entry = {"status": new_status, "changed_at": now_utc(),
                         "changed_by": str(current_user["_id"]), "note": body.reason or "Approved by NGO"}

        await db.issues.update_one(
            {"_id": ObjectId(issue_id)},
            {"$set": update, "$push": {"status_history": history_entry}}
        )

        # Notify reporter (if not anonymous)
        if issue.get("reporter_id"):
            await create_notification(
                str(issue["reporter_id"]), "ISSUE_VERIFIED",
                "Issue Verified ✅", f"Your report '{issue['title']}' has been verified and is now public!",
                issue_id
            )
            await award_points(str(issue["reporter_id"]), "NGO_VERIFIED")

        # Broadcast to feed
        from app.utils import socket_instance as si
        if si.sio:
            await si.sio.emit("issue:new", serialize_doc(await db.issues.find_one({"_id": ObjectId(issue_id)})))

    elif body.action == "reject":
        if not body.reason:
            raise HTTPException(status_code=400, detail="Rejection reason is required")
        update = {"status": "REJECTED", "updated_at": now_utc()}
        history_entry = {"status": "REJECTED", "changed_at": now_utc(),
                         "changed_by": str(current_user["_id"]), "note": body.reason}
        await db.issues.update_one(
            {"_id": ObjectId(issue_id)},
            {"$set": update, "$push": {"status_history": history_entry}}
        )
        if issue.get("reporter_id"):
            await create_notification(
                str(issue["reporter_id"]), "ISSUE_REJECTED",
                "Issue Rejected", f"Your report was rejected: {body.reason}", issue_id
            )
    else:
        raise HTTPException(status_code=400, detail="Action must be 'approve' or 'reject'")

    return {"success": True, "new_status": update["status"]}


@router.patch("/{issue_id}/status")
async def update_status(issue_id: str, body: IssueStatusUpdate, current_user=Depends(require_authority)):
    db = get_db()
    issue = await db.issues.find_one({"_id": ObjectId(issue_id)})
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    update = {"status": body.status.value, "updated_at": now_utc()}
    if body.status.value == "RESOLVED":
        update["resolved_at"] = now_utc()

    history_entry = {
        "status": body.status.value,
        "changed_at": now_utc(),
        "changed_by": str(current_user["_id"]),
        "note": body.note or f"Status updated to {body.status.value}",
    }
    await db.issues.update_one(
        {"_id": ObjectId(issue_id)},
        {"$set": update, "$push": {"status_history": history_entry}}
    )

    # Notify reporter
    if issue.get("reporter_id"):
        msg = f"Your issue '{issue['title']}' status updated to {body.status.value}"
        await create_notification(str(issue["reporter_id"]), "STATUS_CHANGE", "Issue Update", msg, issue_id)

    await emit_to_issue(issue_id, "issue:statusChange", {"issue_id": issue_id, "status": body.status.value})
    return {"success": True, "new_status": body.status.value}


@router.patch("/{issue_id}/citizen-verify")
async def citizen_verify_resolved(issue_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    issue = await db.issues.find_one({"_id": ObjectId(issue_id)})
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")
    if str(issue.get("reporter_id")) != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="Only the reporter can verify resolution")
    if issue["status"] != "RESOLVED":
        raise HTTPException(status_code=400, detail="Issue is not in RESOLVED state")

    await db.issues.update_one(
        {"_id": ObjectId(issue_id)},
        {"$set": {"citizen_verified_resolved": True, "updated_at": now_utc()}}
    )
    await award_points(str(current_user["_id"]), "ISSUE_RESOLVED")
    return {"success": True, "message": "Resolution confirmed. EcoScore +50 awarded!"}


@router.post("/{issue_id}/like")
async def toggle_like(issue_id: str, current_user=Depends(get_current_user)):
    db = get_db()
    user_id = current_user["_id"]
    existing = await db.likes.find_one({"issue_id": ObjectId(issue_id), "user_id": user_id})

    if existing:
        await db.likes.delete_one({"_id": existing["_id"]})
        await db.issues.update_one({"_id": ObjectId(issue_id)}, {"$inc": {"like_count": -1}})
        return {"liked": False}
    else:
        await db.likes.insert_one({"issue_id": ObjectId(issue_id), "user_id": user_id, "created_at": now_utc()})
        await db.issues.update_one({"_id": ObjectId(issue_id)}, {"$inc": {"like_count": 1}})
        await award_points(str(user_id), "ISSUE_UPVOTED")
        return {"liked": True}


@router.post("/{issue_id}/comments")
async def post_comment(issue_id: str, body: CommentCreate, current_user=Depends(get_current_user)):
    db = get_db()
    issue = await db.issues.find_one({"_id": ObjectId(issue_id)})
    if not issue:
        raise HTTPException(status_code=404, detail="Issue not found")

    # Internal notes only for NGO/Authority
    if body.is_internal and current_user["role"] not in ["NGO", "AUTHORITY"]:
        raise HTTPException(status_code=403, detail="Only NGO/Authority can post internal notes")

    doc = {
        "content": body.content,
        "issue_id": ObjectId(issue_id),
        "user_id": current_user["_id"],
        "user_name": current_user["name"],
        "user_role": current_user["role"],
        "is_internal": body.is_internal,
        "is_pinned": False,
        "parent_id": ObjectId(body.parent_id) if body.parent_id else None,
        "created_at": now_utc(),
    }
    result = await db.comments.insert_one(doc)
    await db.issues.update_one({"_id": ObjectId(issue_id)}, {"$inc": {"comment_count": 1}})
    await award_points(str(current_user["_id"]), "COMMENT_POSTED")

    serialized = serialize_doc(doc)
    serialized["id"] = str(result.inserted_id)
    await emit_to_issue(issue_id, "comment:new", serialized)
    return serialized


@router.get("/{issue_id}/comments")
async def get_comments(issue_id: str, current_user=Depends(get_optional_user)):
    db = get_db()
    query = {"issue_id": ObjectId(issue_id)}
    if not current_user or current_user["role"] == "CITIZEN":
        query["is_internal"] = False

    cursor = db.comments.find(query).sort("created_at", 1)
    comments = await cursor.to_list(length=200)
    return [serialize_doc(c) for c in comments]
