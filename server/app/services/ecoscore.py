from app.utils.database import get_db
from app.utils.helpers import now_utc
from bson import ObjectId

POINTS = {
    "WELCOME_BONUS": 25,
    "DAILY_LOGIN": 5,
    "REPORT_SUBMITTED": 10,
    "PHOTO_UPLOADED": 5,
    "NGO_VERIFIED": 20,
    "ISSUE_RESOLVED": 50,
    "COMMENT_POSTED": 5,
    "STORY_POSTED": 8,
    "ISSUE_UPVOTED": 2,
    "STREAK_7_DAY": 50,
    "STREAK_30_DAY": 200,
    "WARD_CHALLENGE": 500,
}

LEVEL_THRESHOLDS = [
    (0, "NEWCOMER"),
    (101, "OBSERVER"),
    (501, "REPORTER"),
    (1501, "GUARDIAN"),
    (3001, "ECO_CHAMPION"),
]

ACHIEVEMENTS = {
    "FIRST_REPORT": lambda stats: stats.get("total_reports", 0) >= 1,
    "REPORTS_10": lambda stats: stats.get("total_reports", 0) >= 10,
    "REPORTS_25": lambda stats: stats.get("total_reports", 0) >= 25,
    "REPORTS_50": lambda stats: stats.get("total_reports", 0) >= 50,
    "REPORTS_100": lambda stats: stats.get("total_reports", 0) >= 100,
    "FIRST_RESOLVED": lambda stats: stats.get("resolved_count", 0) >= 1,
    "RESOLVED_5": lambda stats: stats.get("resolved_count", 0) >= 5,
    "STREAK_7": lambda stats: stats.get("max_streak", 0) >= 7,
    "STREAK_30": lambda stats: stats.get("max_streak", 0) >= 30,
}


def compute_level(score: int) -> str:
    level = "NEWCOMER"
    for threshold, name in LEVEL_THRESHOLDS:
        if score >= threshold:
            level = name
    return level


async def award_points(user_id: str, action: str, multiplier: float = 1.0):
    db = get_db()
    points = int(POINTS.get(action, 0) * multiplier)
    if points == 0:
        return

    await db.ecoscore_events.insert_one({
        "user_id": ObjectId(user_id),
        "action_type": action,
        "points": points,
        "multiplier": multiplier,
        "created_at": now_utc(),
    })

    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return

    new_score = user.get("eco_score", 0) + points
    new_level = compute_level(new_score)

    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"eco_score": new_score, "level": new_level}}
    )

    # Check achievements
    await check_achievements(user_id)


async def check_achievements(user_id: str):
    db = get_db()
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return

    existing = set(user.get("achievements", []))

    # Compute stats
    total_reports = await db.issues.count_documents({"reporter_id": ObjectId(user_id)})
    resolved_count = await db.issues.count_documents({
        "reporter_id": ObjectId(user_id),
        "status": "RESOLVED"
    })
    stats = {
        "total_reports": total_reports,
        "resolved_count": resolved_count,
        "max_streak": user.get("streak", 0),
    }

    new_badges = []
    for badge, check_fn in ACHIEVEMENTS.items():
        if badge not in existing and check_fn(stats):
            new_badges.append(badge)

    if new_badges:
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$addToSet": {"achievements": {"$each": new_badges}}}
        )
        for badge in new_badges:
            await db.achievements.insert_one({
                "user_id": ObjectId(user_id),
                "badge_key": badge,
                "unlocked_at": now_utc(),
            })

    return new_badges
