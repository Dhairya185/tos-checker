import os
import json
import typing
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="TOS Analyzer API",
    description="AI Engineering backend to analyze legal documents using Gemini",
    version="1.0.0"
)

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError("No GEMINI_API_KEY found. Please check your .env file.")

genai.configure(api_key=API_KEY)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AgreementRequest(BaseModel):
    text: str

class AnalysisResponse(BaseModel):
    summary: str
    trust_score: int
    gotchas: typing.List[str]

@app.post("/analyze", response_model=AnalysisResponse)
async def analyze_agreement(request: AgreementRequest):
    if not request.text or len(request.text) < 10:
        raise HTTPException(status_code=400, detail="Text is too short to analyze.")

    model = genai.GenerativeModel('gemini-pro-latest')

    prompt = f"""
    Role: You are an expert consumer rights lawyer.
    Task: Analyze the following Terms of Service (TOS) agreement.
    
    Output Requirements:
    Return a valid JSON object. Do not include markdown formatting (like ```json). 
    The JSON must strictly follow this structure:
    {{
        "summary": "A concise, bullet-pointed summary of what the user is actually agreeing to, in simple English.",
        "trust_score": (integer between 0-100, where 100 is perfectly safe and 0 is predatory),
        "gotchas": ["list of strings", "each string is a specific unfair or dangerous clause found", "e.g. 'Class Action Waiver'"]
    }}

    Analyze specifically for:
    - Data selling to third parties
    - Forced arbitration / Waiver of right to sue
    - Auto-renewal traps
    - IP ownership (does the app own user content?)
    - Hidden fees

    Here is the text to analyze:
    {request.text}
    """

    try:
        response = model.generate_content(prompt)
        raw_text = response.text

        cleaned_text = raw_text.strip()
        if cleaned_text.startswith("```json"):
            cleaned_text = cleaned_text[7:]
        if cleaned_text.endswith("```"):
            cleaned_text = cleaned_text[:-3]

        data = json.loads(cleaned_text)

        return AnalysisResponse(
            summary=data.get("summary", "No summary provided."),
            trust_score=data.get("trust_score", 50),
            gotchas=data.get("gotchas", [])
        )

    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="AI response format error.")
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))