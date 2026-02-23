import base64
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .settings import settings
from .models import (
    AnalyzeFormRequest,
    AnalyzeFormResponse,
    GenerateRoutineRequest,
    PracticeRoutine,
)
from .gemini_client import analyze_form_video, generate_practice_routine, GeminiError

# Tune this: base64 is bigger than raw video bytes (~33% overhead)
MAX_BASE64_CHARS = 30_000_000  # ~20–25MB-ish depending on encoding

app = FastAPI(title="Chalk Backend", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/api/analyze-form", response_model=AnalyzeFormResponse)
async def analyze_form(req: AnalyzeFormRequest):
    if len(req.base64Video) > MAX_BASE64_CHARS:
        raise HTTPException(status_code=413, detail="Video payload too large. Use a shorter/smaller clip.")

    # Validate base64 quickly
    try:
        base64.b64decode(req.base64Video, validate=True)
    except Exception:
        raise HTTPException(status_code=400, detail="base64Video is not valid base64.")

    try:
        analysis = await analyze_form_video(req.base64Video, req.mimeType)
        return AnalyzeFormResponse(analysis=analysis)
    except GeminiError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {e}")

@app.post("/api/generate-routine", response_model=PracticeRoutine)
async def generate_routine(req: GenerateRoutineRequest):
    try:
        raw_json_text = await generate_practice_routine(req.focusArea)

        # Gemini should return JSON text — parse it
        try:
            parsed = json.loads(raw_json_text)
        except json.JSONDecodeError:
            raise HTTPException(status_code=502, detail="Gemini returned invalid JSON.")

        # Validate shape strictly with Pydantic model
        return PracticeRoutine.model_validate(parsed)

    except HTTPException:
        raise
    except GeminiError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {e}")