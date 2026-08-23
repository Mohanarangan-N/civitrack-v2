import sys
from pathlib import Path

# Add project root to sys.path
root_dir = Path(__file__).parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from ml.generate_data import generate_text_data
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import joblib

def main():
    print("=" * 60)
    print(" CiviTrack V2 - AI/ML Model Training & Evaluation")
    print("=" * 60)

    # 1. Generate Dataset
    texts, labels = generate_text_data()
    print(f"\n[+] Dataset generated: {len(texts)} samples across 8 civic issue categories.")

    # 2. Train-Test Split
    X_train, X_test, y_train, y_test = train_test_split(
        texts, labels, test_size=0.25, random_state=42, stratify=labels
    )
    print(f"[+] Training set: {len(X_train)} samples | Testing set: {len(X_test)} samples")

    # 3. Vectorization & Training
    vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2))
    X_train_tfidf = vectorizer.fit_transform(X_train)
    X_test_tfidf = vectorizer.transform(X_test)

    clf = RandomForestClassifier(n_estimators=100, random_state=42)
    clf.fit(X_train_tfidf, y_train)

    # 4. Evaluation
    y_pred = clf.predict(X_test_tfidf)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"\n[✓] Model Accuracy: {accuracy * 100:.2f}%\n")
    print("Classification Report:")
    print("-" * 60)
    print(classification_report(y_test, y_pred))
    print("-" * 60)

    # 5. Save Model
    model_path = Path(__file__).parent / "models" / "classifier.pkl"
    model_path.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"model": clf, "vectorizer": vectorizer}, model_path)
    print(f"[+] Trained model saved to: {model_path}")

if __name__ == "__main__":
    main()
