import json
import joblib
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report

def main():
    print("Loading data...")
    with open("unified_training_data.json", "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    texts = [item["contract"] for item in raw_data]
    labels = [1 if item["answer"].strip().lower() == "yes" else 0 for item in raw_data]

    print(f"Total samples: {len(texts)}")
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(texts, labels, test_size=0.2, random_state=42)

    # Create a pipeline
    pipeline = Pipeline([
        ('tfidf', TfidfVectorizer(max_features=10000, stop_words='english', ngram_range=(1, 2))),
        ('clf', LinearSVC(random_state=42, class_weight='balanced'))
    ])

    print("Training the model... (This will be very fast)")
    pipeline.fit(X_train, y_train)

    print("Evaluating the model...")
    y_pred = pipeline.predict(X_test)
    print(classification_report(y_test, y_pred))

    model_path = "tos_model_lightweight.joblib"
    joblib.dump(pipeline, model_path)
    print(f"Model successfully saved to {model_path}!")

if __name__ == "__main__":
    main()
