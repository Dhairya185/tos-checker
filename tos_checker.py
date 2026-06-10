import os
import json
import typing
import uvicorn
import joblib
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, validator
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="TOS Analyzer API",
    description="AI Engineering backend to analyze legal documents using Heuristics or Gemini",
    version="1.1.0"
)

API_KEY = os.getenv("GEMINI_API_KEY")
if API_KEY:
    try:
        genai.configure(api_key=API_KEY)
        print("Gemini API successfully configured.")
    except Exception as e:
        print(f"Error configuring Gemini API: {e}")
else:
    print("Warning: GEMINI_API_KEY not found in environment. Pro Tier models will not be available.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve the static HTML frontend
@app.get("/")
async def serve_frontend():
    return FileResponse("index.html")

app.mount("/", StaticFiles(directory=".", html=True), name="static")

local_model = None
transformer_model = None
transformer_tokenizer = None

try:
    if os.path.exists("fine_tuned_model"):
        transformer_tokenizer = AutoTokenizer.from_pretrained("fine_tuned_model")
        transformer_model = AutoModelForSequenceClassification.from_pretrained("fine_tuned_model")
        transformer_model.eval()
        print("Transformer ML Model successfully loaded from ./fine_tuned_model")
    elif os.path.exists("model.safetensors"):
        # Fallback if model files were uploaded directly to the root directory
        transformer_tokenizer = AutoTokenizer.from_pretrained(".")
        transformer_model = AutoModelForSequenceClassification.from_pretrained(".")
        transformer_model.eval()
        print("Transformer ML Model successfully loaded from root directory")
    elif os.path.exists("tos_model_lightweight.joblib"):
        local_model = joblib.load("tos_model_lightweight.joblib")
        print("Lightweight ML Model successfully loaded.")
except Exception as e:
    print(f"Error loading local models: {e}")

class AgreementRequest(BaseModel):
    text: str
    model_choice: str = "tos-custom-pro"

class AnalysisResponse(BaseModel):
    summary: str
    trust_score: int
    gotchas: typing.List[str]

    @validator('summary', pre=True)
    def parse_summary(cls, v):
        if isinstance(v, list):
            return " ".join(v)
        return v

def calculate_trust_score(gotchas: typing.List[str]) -> int:
    score = 100
    for gotcha in gotchas:
        g_lower = gotcha.lower()
        if "arbitration" in g_lower or "arbitrate" in g_lower or "dispute resolution" in g_lower:
            score -= 25
        elif "class action" in g_lower or "representative action" in g_lower:
            score -= 15
        elif any(k in g_lower for k in ["sell", "sharing", "advertis", "marketing", "monetize"]):
            score -= 20
        elif any(k in g_lower for k in ["license", "ownership", "intellectual property", "own your content", "perpetual"]):
            score -= 20
        elif any(k in g_lower for k in ["renew", "recurring", "fee", "billing"]):
            score -= 10
        elif any(k in g_lower for k in ["unilateral", "modify", "change", "discretion", "without notice"]):
            score -= 10
        else:
            score -= 5
            
    return max(0, min(100, score))

def chunk_text(text: str, max_length: int = 400) -> typing.List[str]:
    words = text.split()
    chunks = []
    current_chunk = []
    for word in words:
        current_chunk.append(word)
        if len(current_chunk) >= max_length:
            chunks.append(" ".join(current_chunk))
            current_chunk = []
    if current_chunk:
        chunks.append(" ".join(current_chunk))
    return chunks

def extract_heuristics(text_lower: str) -> typing.List[str]:
    gotchas = []
    if any(k in text_lower for k in ["arbitrate", "arbitration", "binding arbitration", "dispute resolution"]):
        gotchas.append("Forced Arbitration: Disputes must be settled via arbitration rather than a court of law.")
    if any(k in text_lower for k in ["class action", "representative action", "class member"]):
        gotchas.append("Class Action Waiver: Users are prohibited from participating in group or class action lawsuits.")
    if any(k in text_lower for k in ["sell your data", "share with advertisers", "targeted advertising", "third-party partners", "marketing partners", "monetize", "sell data"]):
        gotchas.append("Data Monetization: Company shares or sells user data to third-party advertising partners.")
    if any(k in text_lower for k in ["royalty-free", "perpetual", "worldwide license", "transfer ownership", "sub-license"]):
        gotchas.append("IP Lock-in: Company demands a perpetual, worldwide, royalty-free license to distribute and edit user content.")
    if any(k in text_lower for k in ["auto-renew", "automatically renew", "recurring charge", "automatic billing"]):
        gotchas.append("Auto-Renewal Loop: Services auto-renew automatically and require manual cancellation to avoid billing.")
    if any(k in text_lower for k in ["reserve the right to modify", "change these terms at any time", "at our sole discretion", "without prior notice"]):
        gotchas.append("Unilateral Terms Changes: Terms of service can be amended at the company's sole discretion without advance notice.")
    return gotchas

def analyze_local_ml(text: str) -> dict:
    gotchas_set = set()
    chunks = chunk_text(text)
    
    if transformer_model is not None and transformer_tokenizer is not None:
        for chunk in chunks:
            inputs = transformer_tokenizer(chunk, return_tensors="pt", truncation=True, max_length=512)
            with torch.no_grad():
                outputs = transformer_model(**inputs)
                pred_class = torch.argmax(outputs.logits, dim=-1).item()
                
                if pred_class == 1:
                    chunk_gotchas = extract_heuristics(chunk.lower())
                    if chunk_gotchas:
                        for g in chunk_gotchas:
                            gotchas_set.add(g)
                    else:
                        gotchas_set.add("Unfair Clause Detected: The Transformer model flagged a section as potentially restrictive.")
    elif local_model:
        for chunk in chunks:
            prediction = local_model.predict([chunk])[0]
            
            if prediction == 1:
                chunk_gotchas = extract_heuristics(chunk.lower())
                if chunk_gotchas:
                    for g in chunk_gotchas:
                        gotchas_set.add(g)
                else:
                    gotchas_set.add("Unfair Clause Detected: The AI model flagged a section as potentially restrictive.")
    else:
        gotchas_set.update(extract_heuristics(text.lower()))

    gotchas = list(gotchas_set)
    score = calculate_trust_score(gotchas)
    
    if not gotchas:
        model_used = "Transformer Model" if transformer_model else ("Local ML Model" if local_model else "Heuristics")
        summary = f"No major red flags or critical clauses were identified in this agreement using the {model_used}. The terms appear standard and relatively favorable to the user."
    else:
        model_used = "Transformer Model" if transformer_model else ("Local ML Model" if local_model else "Heuristics")
        summary = (
            f"This document was analyzed using the {model_used}. We detected {len(gotchas)} critical gotchas that restrict user rights. "
            f"Key concerns include {', '.join([g.split(':')[0] for g in gotchas])}. Please review the highlighted clauses carefully."
        )

    return {
        "summary": summary,
        "trust_score": score,
        "gotchas": gotchas
    }

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_agreement(request: AgreementRequest):
    if not request.text or len(request.text) < 10:
        raise HTTPException(status_code=400, detail="Text is too short to analyze.")

    if request.model_choice == "tos-custom-pro":
        res = analyze_local_ml(request.text)
        return AnalysisResponse(
            summary=res["summary"],
            trust_score=res["trust_score"],
            gotchas=res["gotchas"]
        )

    if not API_KEY:
        raise HTTPException(
            status_code=400,
            detail="Gemini API Key is missing. Please add GEMINI_API_KEY to your .env file or select the Free Tier model."
        )

    gemini_model_name = 'gemini-2.5-flash'
    if request.model_choice == 'gemini-2.5-pro':
        gemini_model_name = 'gemini-2.5-pro'

    try:
        model = genai.GenerativeModel(gemini_model_name)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to initialize Gemini Model: {str(e)}")

    prompt = f"Role: You are an expert consumer rights lawyer.\nTask: Analyze the following Terms of Service (TOS) agreement.\nOutput Requirements:\nReturn a valid JSON object. Do not include markdown formatting.\nThe JSON must strictly follow this structure:\n{{\n    \"summary\": \"A concise paragraph summarizing what the user is agreeing to.\",\n    \"gotchas\": [\"list of strings\", \"each string is a specific unfair or dangerous clause found\", \"e.g. 'Class Action Waiver'\"]\n}}\nAnalyze specifically for:\n- Data selling to third parties\n- Forced arbitration / Waiver of right to sue\n- Auto-renewal traps\n- IP ownership (does the app own user content?)\n- Hidden fees\n- Unilateral term modifications without notice\nHere is the text to analyze:\n{request.text}"

    try:
        response = model.generate_content(prompt)
        raw_text = response.text

        cleaned_text = raw_text.strip()
        if cleaned_text.startswith("```json"):
            cleaned_text = cleaned_text[7:]
        if cleaned_text.endswith("```"):
            cleaned_text = cleaned_text[:-3]

        data = json.loads(cleaned_text)

        summary_val = data.get("summary", "No summary provided.")
        if isinstance(summary_val, list):
            summary_val = " ".join(summary_val)

        gotchas_val = data.get("gotchas", [])
        
        trust_score_val = calculate_trust_score(gotchas_val)

        return AnalysisResponse(
            summary=summary_val,
            trust_score=trust_score_val,
            gotchas=gotchas_val
        )

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI response format error.")
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("tos_checker:app", host="127.0.0.1", port=8000, reload=True)