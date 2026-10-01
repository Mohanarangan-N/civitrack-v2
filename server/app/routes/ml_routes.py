from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.ml import classifier, priority, chatbot

router = APIRouter()


class ClassifyTextRequest(BaseModel):
    text: str


class PriorityScoreRequest(BaseModel):
    area_type: str
    hectic_level: str
    image_severity: Optional[float] = 0.5  # 0-1, default medium


class ValidateImageRequest(BaseModel):
    image: str
    category: str
    title: Optional[str] = ""
    description: Optional[str] = ""


class ChatbotRequest(BaseModel):
    message: str
    language: str = "en"


@router.post("/classify-text")
async def classify_text(body: ClassifyTextRequest):
    import time
    from app.utils.developer_logger import log_event
    t0 = time.time()
    result = classifier.predict(body.text)
    dur = (time.time() - t0) * 1000
    log_event("ml_routes.classify_text", dur, "SUCCESS", {"text": body.text[:60], "result": result})
    return result


@router.post("/validate-image")
async def validate_image(body: ValidateImageRequest):
    import time
    from app.ml.vision_validator import analyze_image_evidence
    from app.utils.developer_logger import log_event
    t0 = time.time()
    result = analyze_image_evidence(body.image, body.category, body.title or "", body.description or "")
    dur = (time.time() - t0) * 1000
    log_event("ml_routes.validate_image", dur, "SUCCESS", {
        "category": body.category,
        "valid": result.get("valid"),
        "scene_detected": result.get("scene_detected"),
        "flag": result.get("flag")
    })
    return result


@router.post("/priority-score")
async def get_priority_score(body: PriorityScoreRequest):
    import time
    from app.utils.developer_logger import log_event
    t0 = time.time()
    score = priority.compute_score(body.area_type, body.hectic_level, body.image_severity)
    label = (
        "LOW" if score <= 25 else
        "MEDIUM" if score <= 50 else
        "HIGH" if score <= 75 else
        "CRITICAL"
    )
    dur = (time.time() - t0) * 1000
    breakdown = priority.get_breakdown(body.area_type, body.hectic_level, body.image_severity)
    log_event("ml_routes.priority_score", dur, "SUCCESS", {"score": score, "priority": label})
    return {
        "score": score,
        "priority": label,
        "breakdown": breakdown
    }


@router.post("/chatbot")
async def chatbot_reply(body: ChatbotRequest):
    result = chatbot.respond(body.message, body.language)
    return result
