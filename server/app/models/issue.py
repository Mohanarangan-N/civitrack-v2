from pydantic import BaseModel, Field
from typing import Optional, List, Any
from datetime import datetime
from enum import Enum


class IssueCategory(str, Enum):
    ROADS = "ROADS"
    WATER = "WATER"
    WASTE = "WASTE"
    LIGHTING = "LIGHTING"
    AIR_QUALITY = "AIR_QUALITY"
    PARKS = "PARKS"
    PUBLIC_PROPERTY = "PUBLIC_PROPERTY"
    OTHER = "OTHER"


class IssueStatus(str, Enum):
    PENDING_VERIFICATION = "PENDING_VERIFICATION"
    VERIFIED = "VERIFIED"
    IN_PROGRESS = "IN_PROGRESS"
    RESOLVED = "RESOLVED"
    REJECTED = "REJECTED"


class IssuePriority(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class AreaType(str, Enum):
    HIGHWAY = "HIGHWAY"
    SCHOOL_HOSPITAL = "SCHOOL_HOSPITAL"
    COMMERCIAL = "COMMERCIAL"
    INDUSTRIAL = "INDUSTRIAL"
    RESIDENTIAL = "RESIDENTIAL"
    RURAL = "RURAL"


class HecticLevel(str, Enum):
    EXTREMELY_BUSY = "EXTREMELY_BUSY"
    BUSY = "BUSY"
    MODERATE = "MODERATE"
    LOW = "LOW"
    VERY_LOW = "VERY_LOW"


class IssueCreate(BaseModel):
    title: str = Field(..., min_length=5, max_length=200)
    description: str = Field(..., min_length=10, max_length=2000)
    category: IssueCategory
    ward: str
    latitude: float
    longitude: float
    area_type: AreaType = AreaType.RESIDENTIAL
    hectic_level: HecticLevel = HecticLevel.MODERATE
    is_anonymous: bool = False


class IssueVerify(BaseModel):
    action: str  # "approve" or "reject"
    reason: Optional[str] = None  # required for reject
    escalate_to_critical: bool = False


class IssueStatusUpdate(BaseModel):
    status: IssueStatus
    note: Optional[str] = None
    assigned_to: Optional[str] = None


class CommentCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)
    parent_id: Optional[str] = None
    is_internal: bool = False
