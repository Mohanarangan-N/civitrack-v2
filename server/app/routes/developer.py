import time
import platform
try:
    import psutil
except ImportError:
    psutil = None
from fastapi import APIRouter, Header, HTTPException
from typing import Optional
from pydantic import BaseModel

from app.utils.developer_logger import get_recent_logs, clear_logs
from app.utils.database import get_db

router = APIRouter()

DEV_PASSCODE = "civitrack-dev"


def _check_auth(x_dev_token: Optional[str]):
    if x_dev_token != DEV_PASSCODE:
        raise HTTPException(status_code=401, detail="Invalid developer token")


class MLTestRequest(BaseModel):
    text: str


class PriorityTestRequest(BaseModel):
    area_type: str = "RESIDENTIAL"
    hectic_level: str = "MODERATE"
    image_hazard_score: float = 0.5


@router.get("/logs")
async def get_logs(
    limit: int = 50,
    x_dev_token: Optional[str] = Header(None),
):
    _check_auth(x_dev_token)
    return {"logs": get_recent_logs(limit)}


@router.get("/ping")
async def ping(x_dev_token: Optional[str] = Header(None)):
    _check_auth(x_dev_token)
    return {"status": "ok", "message": "Developer API is live", "timestamp": time.time()}


@router.delete("/logs")
async def delete_logs(x_dev_token: Optional[str] = Header(None)):
    _check_auth(x_dev_token)
    clear_logs()
    return {"message": "Logs cleared"}


@router.get("/metrics")
async def get_metrics(x_dev_token: Optional[str] = Header(None)):
    _check_auth(x_dev_token)
    db = get_db()

    # Gather DB stats
    counts = {}
    if db is not None:
        try:
            for col in ["users", "issues", "wards", "stories", "notifications"]:
                counts[col] = await db[col].count_documents({})

            db_status = "MongoDB Atlas (Live)"
            if hasattr(db, "name") and "mongomock" in str(type(db)).lower():
                db_status = "Mongomock (In-Memory)"
        except Exception as e:
            counts = {}
            db_status = f"Error: {str(e)}"
    else:
        db_status = "Database In-Memory / Standalone"
        counts = {"users": 15, "issues": 48, "wards": 10, "stories": 8, "notifications": 12}

    # ML model status
    try:
        from app.ml import classifier, priority
        ml_status = "Loaded ✅"
        ml_categories = list(classifier.FALLBACK_KEYWORDS.keys()) if hasattr(classifier, "FALLBACK_KEYWORDS") else []
    except Exception:
        ml_status = "Not Loaded ⚠️"
        ml_categories = []

    # System info
    try:
        cpu = psutil.cpu_percent(interval=0.1)
        mem = psutil.virtual_memory()
        mem_used_mb = round(mem.used / 1024 / 1024, 1)
        mem_total_mb = round(mem.total / 1024 / 1024, 1)
    except Exception:
        cpu = 0
        mem_used_mb = 0
        mem_total_mb = 0

    return {
        "database": {
            "status": db_status,
            "collections": counts,
        },
        "ml_pipeline": {
            "status": ml_status,
            "categories": ml_categories,
        },
        "system": {
            "python_version": platform.python_version(),
            "platform": platform.system(),
            "cpu_percent": cpu,
            "memory_used_mb": mem_used_mb,
            "memory_total_mb": mem_total_mb,
        },
    }


@router.post("/test-ml")
async def test_ml_classifier(
    body: MLTestRequest,
    x_dev_token: Optional[str] = Header(None),
):
    _check_auth(x_dev_token)
    import time
    from app.utils.developer_logger import log_event

    start = time.time()
    try:
        from app.ml import classifier
        result = classifier.predict(body.text)
        duration = (time.time() - start) * 1000
        log_event(
            "ml_classifier.predict",
            duration,
            "SUCCESS",
            {"input": body.text[:80], "category": result.get("category"), "confidence": result.get("confidence")},
        )
        return {"input": body.text, "result": result, "duration_ms": round(duration, 2)}
    except Exception as e:
        duration = (time.time() - start) * 1000
        log_event("ml_classifier.predict", duration, "ERROR", {"error": str(e)})
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/test-priority")
async def test_priority_engine(
    body: PriorityTestRequest,
    x_dev_token: Optional[str] = Header(None),
):
    _check_auth(x_dev_token)
    import time
    from app.utils.developer_logger import log_event

    start = time.time()
    try:
        from app.ml import priority
        score = priority.compute_score(body.area_type, body.hectic_level, body.image_hazard_score)
        label = (
            "LOW" if score <= 25 else
            "MEDIUM" if score <= 50 else
            "HIGH" if score <= 75 else
            "CRITICAL"
        )
        # Breakdown
        loc_weights = {"HIGHWAY": 30, "SCHOOL_HOSPITAL": 28, "COMMERCIAL": 25, "INDUSTRIAL": 20, "RESIDENTIAL": 15, "RURAL": 10}
        hec_weights = {"EXTREMELY_BUSY": 30, "BUSY": 22, "MODERATE": 15, "LOW": 8, "VERY_LOW": 3}
        loc_pts = loc_weights.get(body.area_type, 15)
        hec_pts = hec_weights.get(body.hectic_level, 15)
        img_pts = round(body.image_hazard_score * 40, 1)

        duration = (time.time() - start) * 1000
        result = {
            "score": score,
            "priority": label,
            "breakdown": {
                "location_pts": loc_pts,
                "hectic_pts": hec_pts,
                "image_hazard_pts": img_pts,
            },
        }
        log_event("priority.compute_score", duration, "SUCCESS", result)
        return {**result, "duration_ms": round(duration, 2)}
    except Exception as e:
        duration = (time.time() - start) * 1000
        log_event("priority.compute_score", duration, "ERROR", {"error": str(e)})
        raise HTTPException(status_code=500, detail=str(e))
