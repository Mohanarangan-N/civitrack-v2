from datetime import datetime, timezone
from bson import ObjectId
import io
from PIL import Image


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def serialize_doc(doc: dict) -> dict:
    """Recursively convert ObjectId and datetime to JSON-serializable types."""
    if doc is None:
        return None
    result = {}
    for k, v in doc.items():
        if isinstance(v, ObjectId):
            result[k] = str(v)
        elif isinstance(v, datetime):
            result[k] = v.isoformat()
        elif isinstance(v, dict):
            result[k] = serialize_doc(v)
        elif isinstance(v, list):
            result[k] = [serialize_doc(i) if isinstance(i, dict) else (str(i) if isinstance(i, ObjectId) else (i.isoformat() if isinstance(i, datetime) else i)) for i in v]
        else:
            result[k] = v
    if "_id" in result:
        result["id"] = result.pop("_id")
    return result


def paginate(page: int = 1, limit: int = 20) -> dict:
    skip = (page - 1) * limit
    return {"skip": skip, "limit": limit}
