from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class StoryCreate(BaseModel):
    media_url: str
    ward: str


class NotificationRead(BaseModel):
    notification_id: Optional[str] = None  # None = mark all read
