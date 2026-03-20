# Chalk FastAPI Backend (Gemini)

## 1) Create venv
From `/Backend`:
- Windows PowerShell:
  `python -m venv .venv`
  `.venv\Scripts\activate`
- Mac/Linux:
  `python3 -m venv .venv`
  `source .venv/bin/activate`

## 2) Install deps
`pip install -r requirements.txt`

## 3) Add `.env`
Create `Backend/.env`:
`GEMINI_API_KEY=...`
`FRONTEND_ORIGIN=http://localhost:5173`
`FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173`
`GEMINI_MODEL_TEXT=gemini-2.5-flash`
`GEMINI_MODEL_VIDEO=gemini-2.5-flash`

## 4) Run
From project root:
`python -m uvicorn Backend.main:app --reload --port 8000`

## 5) Test
Open:
`http://localhost:8000/docs`

Quick API check from PowerShell:
`Invoke-RestMethod -Method Post -Uri "http://localhost:8000/api/generate-routine" -ContentType "application/json" -Body '{"focusArea":"draw shots"}'`

If Gemini returns 404, your configured model is unavailable. Set `GEMINI_MODEL_TEXT` / `GEMINI_MODEL_VIDEO` to a current model (for example `gemini-2.5-flash`).
