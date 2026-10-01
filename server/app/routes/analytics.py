from fastapi import APIRouter, Depends
from app.utils.database import get_db
from app.middleware.auth import get_optional_user
from app.ml import prevention_engine
from datetime import datetime, timedelta, timezone

router = APIRouter()


@router.get("/summary")
async def get_summary(current_user=Depends(get_optional_user)):
    db = get_db()
    total = await db.issues.count_documents({})
    pending = await db.issues.count_documents({"status": "PENDING_VERIFICATION"})
    verified = await db.issues.count_documents({"status": "VERIFIED"})
    in_progress = await db.issues.count_documents({"status": "IN_PROGRESS"})
    resolved = await db.issues.count_documents({"status": "RESOLVED"})
    critical = await db.issues.count_documents({"priority": "CRITICAL"})

    # Resolution rate
    rate = round((resolved / total * 100) if total > 0 else 0, 1)

    # Avg resolution time (days)
    pipeline = [
        {"$match": {"status": "RESOLVED", "resolved_at": {"$ne": None}}},
        {"$project": {"diff": {"$subtract": ["$resolved_at", "$created_at"]}}},
        {"$group": {"_id": None, "avg_ms": {"$avg": "$diff"}}}
    ]
    time_result = await db.issues.aggregate(pipeline).to_list(1)
    avg_days = round(time_result[0]["avg_ms"] / (1000 * 60 * 60 * 24), 1) if time_result else 0

    return {
        "total": total,
        "pending": pending,
        "verified": verified,
        "in_progress": in_progress,
        "resolved": resolved,
        "critical": critical,
        "resolution_rate": rate,
        "avg_resolution_days": avg_days,
    }


@router.get("/monthly")
async def get_monthly(current_user=Depends(get_optional_user)):
    db = get_db()
    pipeline = [
        {"$group": {
            "_id": {
                "year": {"$year": "$created_at"},
                "month": {"$month": "$created_at"}
            },
            "total": {"$sum": 1},
            "resolved": {"$sum": {"$cond": [{"$eq": ["$status", "RESOLVED"]}, 1, 0]}}
        }},
        {"$sort": {"_id.year": 1, "_id.month": 1}},
        {"$limit": 12}
    ]
    results = await db.issues.aggregate(pipeline).to_list(12)
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return [
        {
            "month": months[r["_id"]["month"] - 1],
            "year": r["_id"]["year"],
            "total": r["total"],
            "resolved": r["resolved"]
        }
        for r in results
    ]


@router.get("/category")
async def get_by_category(current_user=Depends(get_optional_user)):
    db = get_db()
    pipeline = [
        {"$group": {"_id": "$category", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}}
    ]
    results = await db.issues.aggregate(pipeline).to_list(20)
    return [{"category": r["_id"], "count": r["count"]} for r in results]


@router.get("/wards")
async def get_ward_analytics(current_user=Depends(get_optional_user)):
    db = get_db()
    pipeline = [
        {"$group": {
            "_id": "$ward",
            "total": {"$sum": 1},
            "resolved": {"$sum": {"$cond": [{"$eq": ["$status", "RESOLVED"]}, 1, 0]}},
            "critical": {"$sum": {"$cond": [{"$eq": ["$priority", "CRITICAL"]}, 1, 0]}}
        }},
        {"$sort": {"total": -1}}
    ]
    results = await db.issues.aggregate(pipeline).to_list(20)
    return [
        {
            "ward": r["_id"],
            "total": r["total"],
            "resolved": r["resolved"],
            "critical": r["critical"],
            "resolution_rate": round(r["resolved"] / r["total"] * 100, 1) if r["total"] > 0 else 0
        }
        for r in results
    ]


@router.get("/sla")
async def get_sla(current_user=Depends(get_optional_user)):
    db = get_db()
    now = datetime.now(timezone.utc)
    pipeline = [
        {"$match": {"status": {"$in": ["VERIFIED", "IN_PROGRESS", "RESOLVED"]}}},
        {"$project": {
            "title": 1,
            "category": 1,
            "ward": 1,
            "priority": 1,
            "status": 1,
            "created_at": 1,
            "resolved_at": 1,
            "age_days": {"$divide": [{"$subtract": [now, "$created_at"]}, 86400000]}
        }},
        {"$sort": {"age_days": -1}},
        {"$limit": 50}
    ]
    results = await db.issues.aggregate(pipeline).to_list(50)

    sla_limits = {"LOW": 14, "MEDIUM": 7, "HIGH": 3, "CRITICAL": 1}
    for r in results:
        r["_id"] = str(r["_id"])
        limit = sla_limits.get(r.get("priority", "MEDIUM"), 7)
        r["sla_days"] = limit
        r["age_days"] = round(r.get("age_days", 0), 1)
        r["sla_breached"] = r["status"] != "RESOLVED" and r["age_days"] > limit
        if "created_at" in r:
            r["created_at"] = r["created_at"].isoformat() if hasattr(r["created_at"], "isoformat") else str(r["created_at"])
        if "resolved_at" in r and r["resolved_at"]:
            r["resolved_at"] = r["resolved_at"].isoformat() if hasattr(r["resolved_at"], "isoformat") else str(r["resolved_at"])

    return results


@router.get("/preventative-insights")
async def get_preventative_insights(current_user=Depends(get_optional_user)):
    """
    Synthesizes AI root cause diagnosis and forward-looking preventative interventions
    to systematically reduce issue occurrence across Puducherry wards.
    """
    db = get_db()
    cursor = db.issues.find({}, {
        "title": 1, "category": 1, "priority": 1, "ward": 1,
        "status": 1, "created_at": 1, "area_type": 1, "location": 1
    })
    issues = await cursor.to_list(length=1000)
    analysis = prevention_engine.analyze_issue_portfolio(issues)
    return analysis
