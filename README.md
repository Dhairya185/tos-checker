# AI Terms-of-Service (TOS) Analyzer

![Python](https://img.shields.io/badge/Python-3.10%2B-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-API-informational)
![React](https://img.shields.io/badge/React-CDN-blueviolet)
![Gemini](https://img.shields.io/badge/Google%20Gemini-AI-yellow)

A small single-repo project that provides a lightweight React front-end (served from static files) and a FastAPI backend that uses Google Generative AI (Gemini) to analyze Terms of Service (TOS) / legal agreements and return a concise summary, a trust score, and highlighted "gotchas".

**Project type**: Local dev / prototype (front-end + API)

**Quick summary**
- **Front-end**: `index.html`, `App.js`, `style.css` — lightweight React UI loaded from CDNs (no build step required).
- **Back-end**: `tos_checker.py` — FastAPI app that calls Google generative AI via the `google.generativeai` package.
- **Helpers / utilities**: `check_models.py` — small script to inspect available Gemini models.

**Architecture & Flow**
- User pastes TOS text in the browser UI (`index.html` + `App.js`).
- Frontend sends a POST to `http://127.0.0.1:8000/analyze` with JSON `{ "text": "..." }`.
- Backend (`tos_checker.py`) forwards analysis to Gemini (`google.generativeai`) and expects a JSON response with `summary`, `trust_score`, and `gotchas`.
- Frontend renders results (summary, trust wheel, and gotchas list).

**Tech Stack**
- Python 3.10+
- FastAPI + Uvicorn
- google-generativeai (Gemini client)
- python-dotenv
- Pydantic
- Frontend: React (CDN), ReactDOM, Babel (standalone) — no npm required

**Prerequisites**
- Python 3.10 or newer
- A Google Gemini API key stored in a `.env` file as `GEMINI_API_KEY`

**Installation (local development)**

1. Clone the repo or copy the folder to your machine.

2. (Recommended) Create and activate a virtual environment:

```bash
python -m venv .venv
# Windows (Powershell)
.venv\Scripts\Activate.ps1
# Windows (cmd)
.venv\Scripts\activate.bat
```

3. Install the Python dependencies:

```bash
pip install fastapi uvicorn python-dotenv google-generativeai pydantic
```

4. Create a `.env` file in the project root with your Gemini API key:

```text
GEMINI_API_KEY=sk-...your-key-here...
```

**Running locally**

- Start the backend API (from the project root):

```bash
uvicorn tos_checker:app --reload --host 127.0.0.1 --port 8000
```

- Open the front-end: either open `index.html` directly in your browser or serve the folder with a simple static server. Example using Python's built-in server:

```bash
# from the repo root
python -m http.server 5500
# then open http://127.0.0.1:5500 in your browser
```

Note: The front-end expects the backend at `http://127.0.0.1:8000`. If you change the backend host/port, update `App.js` accordingly.

**API Contract**
- Endpoint: `POST /analyze`
- Request JSON:

```json
{ "text": "<full TOS text>" }
```

- Successful response (example):

```json
{
  "summary": "A short, plain-English summary.",
  "trust_score": 65,
  "gotchas": ["Class action waiver", "Data sharing with advertisers"]
}
```

- Example curl (quick test):

```bash
curl -X POST http://127.0.0.1:8000/analyze \
  -H "Content-Type: application/json" \
  -d '{"text":"Your terms-of-service text here"}'
```

**Files (file map)**
- `index.html` — static HTML shell that loads React, ReactDOM and Babel from CDN and mounts `App.js`.
- `App.js` — React single-file UI: text input, analyze button, and results rendering (trust wheel + gotchas).
- `style.css` — Simple styling and responsive layout.
- `tos_checker.py` — FastAPI backend implementing `/analyze` endpoint and calling Gemini to produce structured JSON.
- `check_models.py` — helper that lists available Gemini models via `google.generativeai`.

**Security & Operational Notes**
- Keep your `GEMINI_API_KEY` secret — do not commit `.env` to source control.
- The repo uses `allow_origins=["*"]` in development; lock down CORS for production.
- Consider adding request throttling and logging when exposing the API publicly.

**Deployment suggestions**
- Backend: containerize with Docker and run behind a reverse proxy (NGINX) or deploy to a managed service (Google Cloud Run / Cloud Run Jobs). Ensure the API key is provided as a secure secret.
- Frontend: serve the static files from any static host (Netlify, Vercel, S3 + CloudFront) — but make sure the backend URL is updated and secured.

**Troubleshooting**
- "Could not connect to backend" in UI: verify `uvicorn` is running on `127.0.0.1:8000` and CORS is allowing your origin.
- JSON parsing error from AI response: the backend expects the model to return strict JSON; if Gemini returns additional text, the backend may fail to parse.

**Contributing**
- Fork and open a PR. Keep changes small and focused.
- Consider adding a `requirements.txt` and basic tests for the FastAPI endpoints.

**Next improvements (suggested)**
- Add `requirements.txt` or `pyproject.toml` for reproducible installs.
- Add a small build step / bundler for the front-end (optional) to avoid using Babel in the browser.
- Harden backend with authentication, rate-limiting, and robust response validation.

If you'd like, I can:
- Add a `requirements.txt` and a simple `Makefile` or `run.ps1` script for Windows to automate setup.
- Add a CI badge and an MIT license file.

---
Generated by an automated README assistant — review secrets and adapt commands to your environment.
