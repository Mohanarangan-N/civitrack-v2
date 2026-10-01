import os
import joblib
import numpy as np
from pathlib import Path

MODEL_PATH = Path(__file__).parent / "models" / "classifier.pkl"
ALT_MODEL_PATH = Path(__file__).parent.parent.parent.parent / "ml" / "models" / "classifier.pkl"

_model = None
_vectorizer = None
_labels = ["ROADS", "WATER", "WASTE", "LIGHTING", "AIR_QUALITY", "PARKS", "PUBLIC_PROPERTY", "OTHER"]

KEYWORDS = {
    "ROADS": ["road", "pothole", "crack", "traffic", "footpath", "pavement", "highway", "street", "bridge", "waterlog"],
    "WATER": ["water", "pipe", "leak", "supply", "sewage", "drainage", "flood", "tap", "pump", "bore"],
    "WASTE": ["garbage", "waste", "trash", "dump", "litter", "bin", "collection", "plastic", "dirty", "smell"],
    "LIGHTING": ["light", "lamp", "dark", "electricity", "power", "bulb", "streetlight", "night", "illumin"],
    "AIR_QUALITY": ["smoke", "pollution", "air", "dust", "smell", "factory", "vehicle", "fume", "gas", "haze"],
    "PARKS": ["park", "garden", "tree", "bench", "plant", "grass", "playground", "recreation", "green"],
    "PUBLIC_PROPERTY": ["toilet", "property", "building", "wall", "manhole", "drain", "public", "facility", "broken"],
}


def load_or_train():
    global _model, _vectorizer
    target_path = MODEL_PATH if MODEL_PATH.exists() else ALT_MODEL_PATH
    if target_path.exists():
        bundle = joblib.load(target_path)
        _model = bundle["model"]
        _vectorizer = bundle["vectorizer"]
        print(f"Loaded text classifier from disk ({target_path}).")
        return

    print("Training text classifier...")
    from sklearn.feature_extraction.text import TfidfVectorizer
    from sklearn.ensemble import RandomForestClassifier
    import sys

    try:
        from ml_src.generate_data import generate_text_data
    except ImportError:
        root_dir = str(ALT_MODEL_PATH.parent.parent.parent)
        if root_dir not in sys.path:
            sys.path.insert(0, root_dir)
        from ml.generate_data import generate_text_data

    texts, labels = generate_text_data()

    vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    X = vectorizer.fit_transform(texts)
    clf.fit(X, labels)

    _model = clf
    _vectorizer = vectorizer
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"model": clf, "vectorizer": vectorizer}, MODEL_PATH)
    print("Text classifier trained and saved.")


def predict(text: str) -> dict:
    if _model is None or _vectorizer is None:
        return _keyword_fallback(text)

    try:
        X = _vectorizer.transform([text.lower()])
        pred = str(_model.predict(X)[0])
        proba = _model.predict_proba(X)[0]
        confidence = round(float(max(proba)), 3)
        return {"category": pred, "confidence": confidence}
    except Exception:
        return _keyword_fallback(text)


def _keyword_fallback(text: str) -> dict:
    text_lower = text.lower()
    scores = {}
    for cat, kws in KEYWORDS.items():
        scores[cat] = sum(1 for kw in kws if kw in text_lower)
    best = max(scores, key=scores.get)
    confidence = min(0.6 + scores[best] * 0.05, 0.95) if scores[best] > 0 else 0.5
    return {"category": best if scores[best] > 0 else "OTHER", "confidence": round(confidence, 3)}
