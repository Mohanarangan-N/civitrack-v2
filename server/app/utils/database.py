import os
try:
    import certifi
    CA_FILE = certifi.where()
except Exception:
    CA_FILE = None
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

_client: AsyncIOMotorClient = None
_db = None


async def connect_db():
    global _client, _db
    uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    db_name = os.getenv("DB_NAME", "civitrack_v2")
    try:
        kwargs = {"serverSelectionTimeoutMS": 4000}
        if CA_FILE and ("mongodb+srv://" in uri or "ssl=true" in uri or "tls=true" in uri):
            kwargs["tlsCAFile"] = CA_FILE
        client = AsyncIOMotorClient(uri, **kwargs)
        await client.admin.command("ping")
        _client = client
        _db = _client[db_name]
        print(f"Connected to live MongoDB: {db_name}")
    except Exception as e:
        print(f"Notice: Live MongoDB at {uri} not reachable ({e}). Falling back to in-memory mongomock...")
        try:
            from mongomock_motor import AsyncMongoMockClient
            _client = AsyncMongoMockClient()
            _db = _client[db_name]
            print(f"Connected to in-memory Mongomock DB: {db_name}")
        except Exception as mock_err:
            print(f"Mongomock initialization fallback: {mock_err}")
            _client = AsyncMongoMockClient()
            _db = _client[db_name]


async def disconnect_db():
    global _client
    if _client:
        _client.close()
        print("Disconnected from MongoDB")


def get_db():
    return _db
