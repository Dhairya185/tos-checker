import json
import joblib
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, classification_report
import os

def main():
    model_path = "tos_model_lightweight.joblib"
    if not os.path.exists(model_path):
        print(f"Model not found at {model_path}. Please train it first.")
        return

    print(f"Loading model from {model_path}...")
    pipeline = joblib.load(model_path)

    print("Loading test data...")
    with open("unified_training_data.json", "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    texts = [item["contract"] for item in raw_data]
    labels = [1 if item["answer"].strip().lower() == "yes" else 0 for item in raw_data]

    # In practice, evaluate.py should ideally load a held-out test set
    # Here we are just re-evaluating on the entire dataset to verify it works
    # train.py already splits and evaluates on the test set.
    print("Evaluating the model on the full dataset...")
    y_pred = pipeline.predict(texts)
    
    print("\n--- Evaluation Results ---")
    print(classification_report(labels, y_pred))

if __name__ == "__main__":
    main()
