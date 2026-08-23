from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from bson import ObjectId
import os
from app.utils.database import get_db
from app.middleware.auth import get_current_user

router  = APIRouter()
pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = os.getenv("SECRET_KEY","secret")
ALGORITHM  = os.getenv("ALGORITHM","HS256")
EXPIRE_MIN = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES",10080))

PUDUCHERRY_WARDS = [
    {"name":"White Town","name_ta":"வெள்ளை நகர்","name_fr":"Ville Blanche"},
    {"name":"Lawspet","name_ta":"லாஸ்பேட்","name_fr":"Lawspet"},
    {"name":"Oulgaret","name_ta":"உழவர்கரை","name_fr":"Oulgaret"},
    {"name":"Mudaliarpet","name_ta":"முதலியார்பேட்டை","name_fr":"Mudaliarpet"},
    {"name":"Villianur","name_ta":"வில்லியனூர்","name_fr":"Villianour"},
    {"name":"Ariyankuppam","name_ta":"ஆரியன்குப்பம்","name_fr":"Ariyankuppam"},
    {"name":"Bahour","name_ta":"பாகூர்","name_fr":"Bahour"},
    {"name":"Mannadipet","name_ta":"மண்ணாடிப்பேட்டை","name_fr":"Mannadipet"},
    {"name":"Nettapakkam","name_ta":"நெட்டப்பாக்கம்","name_fr":"Nettapakkam"},
    {"name":"Embalam","name_ta":"எம்பலம்","name_fr":"Embalam"},
]

class RegisterIn(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str = "CITIZEN"
    ward: str = "White Town"
    language: str = "en"

class LoginIn(BaseModel):
    email: EmailStr
    password: str

def make_token(user_id: str):
    exp = datetime.utcnow() + timedelta(minutes=EXPIRE_MIN)
    return jwt.encode({"sub": user_id, "exp": exp}, SECRET_KEY, algorithm=ALGORITHM)

def fmt(u):
    u["id"] = str(u["_id"]); u.pop("_id"); u.pop("password_hash","")
    return u

@router.post("/register")
async def register(body: RegisterIn, db=Depends(get_db)):
    if await db["users"].find_one({"email": body.email}):
        raise HTTPException(400, "Email already registered")
    now = datetime.utcnow()
    doc = {
        "name": body.name, "email": body.email,
        "password_hash": pwd_ctx.hash(body.password),
        "role": body.role, "ward": body.ward, "city": "Puducherry",
        "language": body.language, "avatar_url": None,
        "eco_score": 0, "level": "NEWCOMER", "achievements": [],
        "streak_days": 0, "last_active": now,
        "followers_count": 0, "following_count": 0,
        "is_verified": False, "report_count": 0,
        "created_at": now, "updated_at": now,
    }
    res  = await db["users"].insert_one(doc)
    # Welcome bonus
    await db["ecoscore_events"].insert_one({
        "user_id": str(res.inserted_id), "action_type": "WELCOME_BONUS",
        "points": 25, "multiplier": 1.0, "earned_at": now
    })
    await db["users"].update_one({"_id": res.inserted_id}, {"$inc":{"eco_score":25}})
    user = await db["users"].find_one({"_id": res.inserted_id})
    token = make_token(str(res.inserted_id))
    return {"access_token": token, "token_type": "bearer", "user": fmt(user)}

@router.post("/login")
async def login(body: LoginIn, db=Depends(get_db)):
    user = await db["users"].find_one({"email": body.email})
    if not user or not pwd_ctx.verify(body.password, user["password_hash"]):
        raise HTTPException(401, "Invalid credentials")
    # Daily login bonus
    now = datetime.utcnow()
    last = user.get("last_active")
    if not last or (now - last).days >= 1:
        await db["users"].update_one({"_id":user["_id"]},{"$inc":{"eco_score":5},"$set":{"last_active":now}})
        await db["ecoscore_events"].insert_one({
            "user_id":str(user["_id"]),"action_type":"DAILY_LOGIN","points":5,"multiplier":1.0,"earned_at":now
        })
    token = make_token(str(user["_id"]))
    user  = await db["users"].find_one({"_id":user["_id"]})
    return {"access_token": token, "token_type": "bearer", "user": fmt(user)}

@router.get("/me")
async def me(user=Depends(get_current_user)):
    user.pop("password_hash",""); return user

@router.get("/wards")
async def get_wards(db=Depends(get_db)):
    wards = await db["wards"].find({}).to_list(100)
    for w in wards: w["id"] = str(w["_id"]); w.pop("_id")
    return wards
