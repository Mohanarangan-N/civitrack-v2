import os
from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class Database:
    client: Optional[AsyncIOMotorClient] = None
    db = None

db = Database()

async def connect_db():
    mongo_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
    db_name   = os.getenv("DB_NAME", "civitrack_v2")
    db.client = AsyncIOMotorClient(mongo_url)
    db.db     = db.client[db_name]
    await db.client.admin.command("ping")
    logger.info(f"✅ Connected to MongoDB: {db_name}")
    await create_indexes()

async def disconnect_db():
    if db.client:
        db.client.close()

async def create_indexes():
    d = db.db
    await d["users"].create_index([("email",1)], unique=True)
    await d["users"].create_index([("eco_score",-1)])
    await d["issues"].create_index([("location","2dsphere")])
    await d["issues"].create_index([("ward",1),("status",1),("priority",-1)])
    await d["issues"].create_index([("status",1),("created_at",-1)])
    await d["issues"].create_index([("reporter_id",1)])
    await d["comments"].create_index([("issue_id",1),("created_at",1)])
    await d["stories"].create_index([("expires_at",1)], expireAfterSeconds=0)
    await d["stories"].create_index([("ward",1)])
    await d["likes"].create_index([("issue_id",1),("user_id",1)], unique=True)
    await d["bookmarks"].create_index([("user_id",1)])
    await d["follows"].create_index([("follower_id",1),("following_id",1)], unique=True)
    await d["notifications"].create_index([("user_id",1),("is_read",1)])
    await d["wards"].create_index([("name",1)], unique=True)
    logger.info("✅ Indexes created")

def get_db():
    return db.db
