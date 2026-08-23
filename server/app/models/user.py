from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    CITIZEN = "CITIZEN"
    NGO = "NGO"
    AUTHORITY = "AUTHORITY"


class UserLevel(str, Enum):
    NEWCOMER = "NEWCOMER"
    OBSERVER = "OBSERVER"
    REPORTER = "REPORTER"
    GUARDIAN = "GUARDIAN"
    ECO_CHAMPION = "ECO_CHAMPION"


class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    role: UserRole = UserRole.CITIZEN
    ward: str
    language: str = "en"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserPublic(BaseModel):
    id: str
    name: str
    email: Optional[str] = None
    role: str
    ward: str
    language: str
    eco_score: int
    level: str
    streak: int
    achievements: List[str]
    created_at: Optional[datetime] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic
