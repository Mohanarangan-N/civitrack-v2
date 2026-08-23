import os
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException, Depends
from jose import jwt
from app.models.user import UserCreate, UserLogin, TokenResponse, UserPublic
from app.utils.database import get_db
from app.utils.helpers import now_utc, serialize_doc
from app.utils.security import hash_password, verify_password
from app.middleware.auth import get_current_user
from app.services.ecoscore import award_points

router = APIRouter()

SECRET = os.getenv("JWT_SECRET", "civitrack-secret")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", 10080))


def make_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=EXPIRE_MINUTES)
    return jwt.encode({"sub": user_id, "exp": expire}, SECRET, algorithm=ALGORITHM)


def user_to_public(user: dict) -> dict:
    d = serialize_doc(user)
    d.pop("password_hash", None)
    return d


@router.post("/register", response_model=dict)
async def register(body: UserCreate):
    db = get_db()
    if await db.users.find_one({"email": body.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    doc = {
        "name": body.name,
        "email": body.email,
        "password_hash": hash_password(body.password),
        "role": body.role.value,
        "ward": body.ward,
        "language": body.language,
        "eco_score": 0,
        "level": "NEWCOMER",
        "streak": 0,
        "is_active": True,
        "achievements": [],
        "created_at": now_utc(),
    }
    result = await db.users.insert_one(doc)
    user_id = str(result.inserted_id)

    # Welcome bonus
    await award_points(user_id, "WELCOME_BONUS")

    user = await db.users.find_one({"_id": result.inserted_id})
    token = make_token(user_id)
    return {"access_token": token, "token_type": "bearer", "user": user_to_public(user)}


@router.post("/login", response_model=dict)
async def login(body: UserLogin):
    db = get_db()
    user = await db.users.find_one({"email": body.email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user_id = str(user["_id"])
    token = make_token(user_id)
    return {"access_token": token, "token_type": "bearer", "user": user_to_public(user)}


@router.get("/me")
async def me(current_user=Depends(get_current_user)):
    return user_to_public(current_user)
