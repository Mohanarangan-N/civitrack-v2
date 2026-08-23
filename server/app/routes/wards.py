from fastapi import APIRouter
from app.utils.database import get_db
from app.utils.helpers import serialize_doc

router = APIRouter()


@router.get("")
async def get_wards():
    db = get_db()
    wards = await db.wards.find({}).to_list(50)
    return [serialize_doc(w) for w in wards]
