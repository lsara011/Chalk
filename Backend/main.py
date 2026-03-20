import base64
import ast
import json
import re
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import ValidationError

from .settings import settings
from .models import (
    AnalyzeFormRequest,
    AnalyzeFormResponse,
    GenerateRoutineRequest,
    PracticeRoutine,
)
from .gemini_client import (
    analyze_form_video,
    generate_practice_routine,
    find_youtube_video,
    close_gemini_client,
    GeminiError,
)

# Tune this: base64 is bigger than raw video bytes (~33% overhead)
MAX_BASE64_CHARS = 30_000_000  # ~20-25MB-ish depending on encoding

app = FastAPI(title="Chalk Backend", version="0.1.0")


def _parse_gemini_json(raw_text: str):
    def _coerce_routine_payload(parsed):
        if isinstance(parsed, dict):
            if all(k in parsed for k in ("title", "description", "drills")):
                return parsed

            for key in ("routine", "practiceRoutine", "practice_routine", "data", "result"):
                inner = parsed.get(key)
                if isinstance(inner, dict) and all(k in inner for k in ("title", "description", "drills")):
                    return inner

            if isinstance(parsed.get("drills"), list):
                return {
                    "title": "Practice Routine",
                    "description": "Generated practice routine.",
                    "drills": parsed["drills"],
                }

        if isinstance(parsed, list):
            return {
                "title": "Practice Routine",
                "description": "Generated practice routine.",
                "drills": parsed,
            }
        return None

    def _parse_candidate(text: str):
        try:
            parsed = json.loads(text)
            return _coerce_routine_payload(parsed)
        except json.JSONDecodeError:
            pass
        try:
            parsed = ast.literal_eval(text)
            return _coerce_routine_payload(parsed)
        except (ValueError, SyntaxError):
            pass
        return None

    # First try strict parse.
    parsed = _parse_candidate(raw_text)
    if parsed is not None:
        return parsed

    # Common fallback: ```json ... ``` wrappers.
    fence_match = re.search(r"```(?:json)?\s*(\{[\s\S]*\})\s*```", raw_text, re.IGNORECASE)
    if fence_match:
        parsed = _parse_candidate(fence_match.group(1))
        if parsed is not None:
            return parsed

    # Try all object-like slices from each "{" to each "}" from right to left.
    opens = [i for i, ch in enumerate(raw_text) if ch == "{"]
    closes = [i for i, ch in enumerate(raw_text) if ch == "}"]
    for start in opens:
        for end in reversed(closes):
            if end <= start:
                continue
            parsed = _parse_candidate(raw_text[start : end + 1])
            if parsed is not None:
                return parsed

    snippet = raw_text.strip().replace("\n", " ")
    if len(snippet) > 200:
        snippet = snippet[:200] + "..."
    raise HTTPException(
        status_code=502,
        detail=(
            "Gemini returned invalid or unexpected JSON shape. "
            f"Raw snippet: {snippet}"
        ),
    )


@app.on_event("shutdown")
async def shutdown_event():
    await close_gemini_client()


app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
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
        last_parse_error: HTTPException | None = None
        last_validation_error: ValidationError | None = None

        # Gemini sometimes returns partial JSON; retry once before failing.
        for _ in range(2):
            raw_json_text = await generate_practice_routine(req.focusArea)
            try:
                parsed = _parse_gemini_json(raw_json_text)
                routine = PracticeRoutine.model_validate(parsed)
                lookups = await asyncio.gather(
                    *[find_youtube_video(d.youtubeSearchQuery) for d in routine.drills]
                )
                for drill, yt in zip(routine.drills, lookups):
                    if yt:
                        drill.youtubeVideoId = yt["youtubeVideoId"]
                        drill.youtubeUrl = yt["youtubeUrl"]
                        drill.youtubeEmbedUrl = yt["youtubeEmbedUrl"]
                return routine
            except HTTPException as e:
                last_parse_error = e
                continue
            except ValidationError as e:
                last_validation_error = e
                continue

        if last_validation_error is not None:
            raise HTTPException(
                status_code=502,
                detail=f"Gemini returned JSON with unexpected schema: {last_validation_error}",
            )
        if last_parse_error is not None:
            raise last_parse_error
        raise HTTPException(status_code=502, detail="Gemini returned invalid routine format.")

    except HTTPException:
        raise
    except GeminiError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Server error: {e}")
