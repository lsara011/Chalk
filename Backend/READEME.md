# Chalk FastAPI Backend (Gemini)

## 1) Create venv
From /backend:
- Windows PowerShell:
  python -m venv venv
  venv\Scripts\activate
- Mac/Linux:
  python3 -m venv venv
  source venv/bin/activate

## 2) Install deps
pip install -r requirements.txt

## 3) Add .env
Create backend/.env:
GEMINI_API_KEY=...
FRONTEND_ORIGIN=http://localhost:5173

## 4) Run
uvicorn app.main:app --reload --port 8000

## 5) Test
Open:
http://localhost:8000/docs