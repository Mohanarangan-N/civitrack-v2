import random

AREA_WEIGHTS = {
    "HIGHWAY": 30,
    "SCHOOL_HOSPITAL": 28,
    "COMMERCIAL": 25,
    "INDUSTRIAL": 20,
    "RESIDENTIAL": 15,
    "RURAL": 10,
}

HECTIC_WEIGHTS = {
    "EXTREMELY_BUSY": 30,
    "BUSY": 22,
    "MODERATE": 15,
    "LOW": 8,
    "VERY_LOW": 3,
}


def load_or_train():
    # Priority is rule-based, no ML model needed
    print("Priority scorer ready (rule-based).")


def compute_score(area_type: str, hectic_level: str, image_severity: float = 0.5) -> int:
    area_score = AREA_WEIGHTS.get(area_type, 15)
    hectic_score = HECTIC_WEIGHTS.get(hectic_level, 15)
    image_score = round(image_severity * 40)  # 0-40 pts

    total = image_score + area_score + hectic_score
    return min(int(total), 100)


def get_breakdown(area_type: str, hectic_level: str, image_severity: float = 0.5) -> dict:
    area_score = AREA_WEIGHTS.get(area_type, 15)
    hectic_score = HECTIC_WEIGHTS.get(hectic_level, 15)
    image_score = round(image_severity * 40)
    return {
        "image_severity": image_score,
        "location_weight": area_score,
        "hectic_level": hectic_score,
        "total": min(image_score + area_score + hectic_score, 100),
    }
