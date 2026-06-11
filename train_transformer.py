import os
os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"
import sys
import json

# MUST IMPORT DATASETS BEFORE TORCH/TRANSFORMERS ON WINDOWS TO PREVENT PYARROW C++ CRASH
from datasets import Dataset, disable_caching
disable_caching()

import torch
import numpy as np
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    Trainer,
    TrainingArguments,
    DataCollatorWithPadding
)

def compute_metrics(eval_pred):
    predictions, labels = eval_pred
    preds = np.argmax(predictions, axis=1)
    precision, recall, f1, _ = precision_recall_fscore_support(labels, preds, average='binary')
    acc = accuracy_score(labels, preds)
    return {
        'accuracy': acc,
        'f1': f1,
        'precision': precision,
        'recall': recall
    }

def main():
    print("Checking CUDA Device...")
    device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Using device: {device}")
    if device == "cuda":
        print(f"GPU: {torch.cuda.get_device_name(0)}")

    # 1. Load Data
    print("Loading unified dataset...")
    with open("unified_training_data.json", "r", encoding="utf-8") as f:
        raw_data = json.load(f)

    # Prepare texts and labels
    texts = [item["contract"] for item in raw_data]
    labels = [1 if item["answer"].strip().lower() == "yes" else 0 for item in raw_data]
    print(f"Total samples: {len(texts)}")

    # Create full dataset first (this is proven to not crash PyArrow on Windows)
    print("Creating full dataset from dict...")
    full_dataset = Dataset.from_dict({"text": texts, "label": labels})
    
    # Split using HF datasets
    print("Splitting dataset...")
    split_dataset = full_dataset.train_test_split(test_size=0.15, seed=42)
    train_dataset = split_dataset["train"]
    val_dataset = split_dataset["test"]
    print(f"Train size: {len(train_dataset)}, Validation size: {len(val_dataset)}")

    # 2. Tokenizer & Datasets
    model_name = "distilbert-base-uncased"
    print(f"Initializing tokenizer: {model_name}...")
    tokenizer = AutoTokenizer.from_pretrained(model_name)

    # Tokenize function
    def tokenize_function(examples):
        return tokenizer(examples["text"], truncation=True, max_length=512)

    print("Tokenizing train_dataset...")
    train_dataset = train_dataset.map(tokenize_function, batched=True)
    print("Tokenizing val_dataset...")
    val_dataset = val_dataset.map(tokenize_function, batched=True)

    # 3. Model
    print("Loading pretrained model...")
    model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=2)
    model.to(device)

    # 4. Training Arguments
    output_dir = "./results_transformer"
    training_args = TrainingArguments(
        output_dir=output_dir,
        num_train_epochs=3,
        per_device_train_batch_size=8,        # Safe batch size for 6GB RTX 4050 VRAM
        per_device_eval_batch_size=8,
        warmup_ratio=0.1,
        weight_decay=0.01,
        logging_dir="./logs_transformer",
        logging_steps=50,
        evaluation_strategy="epoch",
        save_strategy="epoch",
        learning_rate=2e-5,
        load_best_model_at_end=True,
        metric_for_best_model="f1",
        fp16=torch.cuda.is_available(),       # Mixed precision training for faster speeds on GPU
        report_to="none"                      # Disable wandb logging
    )

    data_collator = DataCollatorWithPadding(tokenizer=tokenizer)

    # 5. Trainer
    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_dataset,
        eval_dataset=val_dataset,
        tokenizer=tokenizer,
        data_collator=data_collator,
        compute_metrics=compute_metrics,
    )

    # 6. Train
    print("Starting training...")
    trainer.train()

    # 7. Evaluate and Save
    print("Evaluating final model...")
    eval_results = trainer.evaluate()
    print("Evaluation Results:", eval_results)

    save_dir = "./fine_tuned_model"
    print(f"Saving fine-tuned model and tokenizer to {save_dir}...")
    model.save_pretrained(save_dir)
    tokenizer.save_pretrained(save_dir)
    print("Model saved successfully!")

if __name__ == "__main__":
    main()
