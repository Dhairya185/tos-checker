<p align="center">
  <h1 align="center">🛡️ TOS.AI — AI-Powered Terms of Service Analyzer</h1>
  <p align="center">
    <em>Stop agreeing blindly. Decode legal jargon with AI in seconds.</em>
  </p>
  <p align="center">
    <a href="#-quick-start"><img src="https://img.shields.io/badge/Quick_Start-blue?style=for-the-badge" alt="Quick Start"/></a>
    <a href="#-demo"><img src="https://img.shields.io/badge/Live_Demo-green?style=for-the-badge" alt="Demo"/></a>
    <a href="#-api-reference"><img src="https://img.shields.io/badge/API_Docs-orange?style=for-the-badge" alt="API"/></a>
  </p>
</p>

---

TOS.AI is a full-stack AI application that analyzes Terms of Service and Privacy Policy documents to detect hidden, unfair, or dangerous clauses. It combines a **custom fine-tuned DistilBERT transformer model**, traditional **ML classifiers (TF-IDF + SVM)**, **rule-based heuristics**, and **Google Gemini LLMs** to provide users with a trust score and a prioritized list of legal red flags — all through a sleek, modern web interface.

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **Multi-Model Analysis** | Choose between a local fine-tuned Transformer, a lightweight SVM classifier, or Google Gemini (Flash / Pro) |
| 📊 **Trust Score** | A 0–100 score computed from detected red flags, visualized as an animated radial gauge |
| ⚠️ **Critical Gotchas** | Specific clauses flagged (forced arbitration, data selling, IP lock-in, auto-renewal traps, etc.) |
| 🌗 **Dark / Light Theme** | Theme toggle with persistence via localStorage |
| 🐳 **Docker Ready** | One-command deployment via Docker, compatible with Hugging Face Spaces |
| 🧠 **Custom ML Pipeline** | End-to-end training pipeline from dataset curation → model training → serving |

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React 18)                      │
│  index.html ─► Landing Page (Landing.js + App.js)               │
│  analyzer.html ─► Analysis Dashboard (Analyzer.js)              │
│  style.css ─► Shared design system (dark/light themes)          │
└────────────────────────┬────────────────────────────────────────┘
                         │  POST /analyze { text, model_choice }
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BACKEND (FastAPI + Uvicorn)                    │
│                        tos_checker.py                            │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────┐     │
│  │  Heuristics  │  │ Transformer  │  │   Gemini API       │     │
│  │  (rule-based)│  │ (DistilBERT) │  │ (2.5 Flash / Pro)  │     │
│  └──────┬───────┘  └──────┬───────┘  └────────┬───────────┘     │
│         └─────────┬───────┘                    │                 │
│            Free Tier (tos-custom-pro)     Pro Tier               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                     ML TRAINING PIPELINE                         │
│  build_unified_dataset.py ─► unified_training_data.json          │
│  train.py ─► tos_model_lightweight.joblib (TF-IDF + SVM)        │
│  train_transformer.py ─► fine_tuned_model/ (DistilBERT)          │
│  evaluate.py ─► Model evaluation metrics                         │
└─────────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
tos-checker/
├── tos_checker.py              # FastAPI backend — serves API + static files
├── index.html                  # Landing page entry point
├── analyzer.html               # Analyzer dashboard entry point
├── App.js                      # React root component (landing page router)
├── Landing.js                  # Landing page UI (hero, features, how-it-works)
├── Analyzer.js                 # Analyzer dashboard UI (input, results, trust wheel)
├── style.css                   # Full design system (dark/light, animations, layout)
│
├── build_unified_dataset.py    # Curates training data from ContractNLI + LegalBench
├── ingest_training_data.py     # Legacy: initial data ingestion from LegalBench
├── train.py                    # Trains the lightweight TF-IDF + SVM classifier
├── train_transformer.py        # Fine-tunes DistilBERT on the unified dataset
├── evaluate.py                 # Evaluates trained models and prints metrics
├── check_models.py             # Lists available Gemini models for your API key
│
├── unified_training_data.json  # Curated training dataset (~8MB, ~10k+ samples)
├── training_data.json          # Legacy dataset from initial ingestion
├── tos_model_lightweight.joblib# Serialized SVM pipeline (fallback model)
├── fine_tuned_model/           # Fine-tuned DistilBERT weights + tokenizer
│
├── requirements.txt            # Python dependencies
├── Dockerfile                  # Docker image for deployment (HF Spaces ready)
├── run.bat                     # Windows one-click launcher script
├── .env                        # Environment variables (GEMINI_API_KEY)
└── .gitignore                  # Git ignore rules
```

## 🚀 Quick Start

### Prerequisites

- **Python 3.10+**
- **Git**
- (Optional) **NVIDIA GPU** with CUDA for transformer inference/training
- (Optional) **Gemini API Key** for Pro Tier models

### Option 1: Windows One-Click

```bash
git clone https://github.com/Dhairya185/tos-checker.git
cd tos-checker
run.bat
```

The script will automatically:
1. Create a virtual environment
2. Install all dependencies
3. Start the FastAPI backend on `http://127.0.0.1:8000`
4. Open the frontend in your browser

### Option 2: Manual Setup

```bash
# Clone the repository
git clone https://github.com/Dhairya185/tos-checker.git
cd tos-checker

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate      # Windows
# source .venv/bin/activate  # Linux/macOS

# Install dependencies
pip install -r requirements.txt

# (Optional) Add your Gemini API key
echo GEMINI_API_KEY=your_key_here > .env

# Start the server
uvicorn tos_checker:app --host 127.0.0.1 --port 8000 --reload
```

Then open `http://127.0.0.1:8000` in your browser.

### Option 3: Docker

```bash
docker build -t tos-checker .
docker run -p 7860:7860 -e GEMINI_API_KEY=your_key_here tos-checker
```

## 🧠 ML Pipeline

The project includes a complete machine learning pipeline for training custom legal document classifiers.

### Step 1 — Build the Dataset

```bash
python build_unified_dataset.py
```

Fetches and unifies data from two legal NLP benchmarks:
- **ContractNLI** (`kiddothe2b/contract-nli`) — Contract clause entailment
- **LegalBench** (`nguha/legalbench`) — Unfair TOS detection + consumer contract QA

Output: `unified_training_data.json` (~10,000+ labeled samples)

### Step 2 — Train Models

**Lightweight model** (TF-IDF + Linear SVM, trains in seconds):
```bash
python train.py
```

**Transformer model** (DistilBERT, fine-tuned for 3 epochs):
```bash
python train_transformer.py
```
> Requires a GPU with ~6GB VRAM. Uses mixed-precision (FP16) training when CUDA is available.

### Step 3 — Evaluate

```bash
python evaluate.py
```

### Model Priority

The backend loads models in this priority order:
1. `fine_tuned_model/` → Fine-tuned DistilBERT (best accuracy)
2. `tos_model_lightweight.joblib` → TF-IDF + SVM (fast fallback)
3. Rule-based heuristics (always active as a baseline)

## 📡 API Reference

### `POST /analyze`

Analyze a Terms of Service document.

**Request Body:**
```json
{
  "text": "The full text of the Terms of Service...",
  "model_choice": "tos-custom-pro"
}
```

| Parameter | Type | Values | Description |
|---|---|---|---|
| `text` | `string` | — | The TOS/Privacy Policy text (min 10 chars) |
| `model_choice` | `string` | `tos-custom-pro`, `gemini-2.5-flash`, `gemini-2.5-pro` | Analysis engine to use |

**Response:**
```json
{
  "summary": "This document was analyzed using the Transformer Model. We detected 3 critical gotchas...",
  "trust_score": 60,
  "gotchas": [
    "Forced Arbitration: Disputes must be settled via arbitration rather than a court of law.",
    "Data Monetization: Company shares or sells user data to third-party advertising partners.",
    "Unilateral Terms Changes: Terms of service can be amended at the company's sole discretion."
  ]
}
```

## 🔍 What It Detects

| Category | What It Looks For |
|---|---|
| ⚖️ **Forced Arbitration** | Binding arbitration, jury trial waivers, dispute resolution restrictions |
| 🚫 **Class Action Waiver** | Prohibition of group/class action lawsuits |
| 📦 **Data Monetization** | Selling/sharing personal data with advertisers or third-party brokers |
| 🔒 **IP Lock-in** | Perpetual, irrevocable licenses over user content; moral rights waivers |
| 🔄 **Auto-Renewal Traps** | Silent auto-renewal, non-refundable recurring billing |
| ✏️ **Unilateral Modifications** | Company can change terms at sole discretion without notice |

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Babel (in-browser JSX), Vanilla CSS |
| **Backend** | Python, FastAPI, Uvicorn, Pydantic |
| **ML / AI** | PyTorch, Hugging Face Transformers, scikit-learn, joblib |
| **LLM** | Google Gemini API (2.5 Flash / 2.5 Pro) |
| **Data** | Hugging Face Datasets (ContractNLI, LegalBench) |
| **Deployment** | Docker, Hugging Face Spaces |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/Dhairya185">Dhairya</a>
</p>
