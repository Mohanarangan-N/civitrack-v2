from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from bson import ObjectId
import os
from app.utils.database import get_db

security = HTTPBearer()
SECRET_KEY = os.getenv("SECRET_KEY", "secret")
ALGORITHM  = os.getenv("ALGORITHM", "HS256")

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db=Depends(get_db)
):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = await db["users"].find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    user["id"] = str(user["_id"])
    return user

async def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer(auto_error=False)),
    db=Depends(get_db)
):
    if not credentials:
        return None
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        user = await db["users"].find_one({"_id": ObjectId(user_id)})
        if user:
            user["id"] = str(user["_id"])
        return user
    except:
        return None

def require_role(*roles):
    async def checker(user=Depends(get_current_user)):
        if user["role"] not in roles:
            raise HTTPException(status_code=403, detail="Insufficient permissions")
        return user
    return checker
