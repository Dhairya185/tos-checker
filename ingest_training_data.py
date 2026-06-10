import json
from datasets import load_dataset

dataset = load_dataset("nguha/legalbench", "consumer_contracts_qa", split="test")

parsed_data = []
for item in dataset:
    parsed_data.append({
        "contract": item["contract"],
        "answer": item["answer"]
    })

with open("training_data.json", "w", encoding="utf-8") as f:
    json.dump(parsed_data, f, indent=4)
