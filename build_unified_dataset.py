import json
import os
from datasets import load_dataset
import random

def fetch_contract_nli():
    print("Fetching ContractNLI...")
    try:
        dataset = load_dataset('kiddothe2b/contract-nli', 'contractnli_a', split='train', trust_remote_code=True)
        unified_data = []
        for item in dataset:
            text = f"Context: {item['premise']}\nQuestion: Is it true that {item['hypothesis']}?"
            # label 0 = entailment, 1 = contradiction, 2 = not_mentioned
            # If 0 is entailment, label=1 means YES it is true.
            ans = "yes" if item['label'] == 0 else "no"
            unified_data.append({"contract": text, "answer": ans})
        print(f"Loaded {len(unified_data)} records from ContractNLI.")
        return unified_data
    except Exception as e:
        print(f"Failed to fetch ContractNLI: {e}")
        return []

def fetch_legalbench():
    print("Fetching LegalBench...")
    unified_data = []
    try:
        # Load unfair_tos
        dataset_unfair = load_dataset('nguha/legalbench', 'unfair_tos', split='test', trust_remote_code=True)
        for item in dataset_unfair:
            text = f"Context: {item['text']}\nQuestion: Does this clause contain unfair terms of service?"
            ans = "yes" if item['answer'].strip().lower() == 'unfair' else "no"
            unified_data.append({"contract": text, "answer": ans})
        
        # Load consumer_contracts_qa
        dataset_qa = load_dataset('nguha/legalbench', 'consumer_contracts_qa', split='test', trust_remote_code=True)
        for item in dataset_qa:
            text = f"Context: {item['contract']}\nQuestion: {item['question']}"
            ans = "yes" if item['answer'].strip().lower() == 'yes' else "no"
            unified_data.append({"contract": text, "answer": ans})
            
        print(f"Loaded {len(unified_data)} records from LegalBench.")
        return unified_data
    except Exception as e:
        print(f"Failed to fetch LegalBench: {e}")
        return []

def main():
    print("Building unified dataset...")
    data = []
    
    # 1. Fetch ContractNLI
    data.extend(fetch_contract_nli())
    
    # 2. Fetch LegalBench
    data.extend(fetch_legalbench())
    
    # 3. ToSDR (Placeholder for Phase 2 - API parsing is complex and rate limited)
    print("Skipping ToSDR for Phase 1 due to API rate limits and deep parsing requirements.")
    
    # Shuffle the data
    random.seed(42)
    random.shuffle(data)
    
    with open("unified_training_data.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=4)
        
    print(f"Successfully built unified dataset with {len(data)} total records.")
    print("Saved to unified_training_data.json")

if __name__ == "__main__":
    main()
