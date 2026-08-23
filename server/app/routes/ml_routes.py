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


class ChatbotRequest(BaseModel):
    message: str
    language: str = "en"


@router.post("/classify-text")
async def classify_text(body: ClassifyTextRequest):
    result = classifier.predict(body.text)
    return result


@router.post("/priority-score")
async def get_priority_score(body: PriorityScoreRequest):
    score = priority.compute_score(body.area_type, body.hectic_level, body.image_severity)
    label = (
        "LOW" if score <= 25 else
        "MEDIUM" if score <= 50 else
        "HIGH" if score <= 75 else
        "CRITICAL"
    )
    return {
        "score": score,
        "priority": label,
        "breakdown": priority.get_breakdown(body.area_type, body.hectic_level, body.image_severity)
    }


@router.post("/chatbot")
async def chatbot_reply(body: ChatbotRequest):
    result = chatbot.respond(body.message, body.language)
    return result
