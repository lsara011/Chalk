import httpx
from typing import Any, Dict, Optional
from .settings import settings

class GeminiError(RuntimeError):
    pass

GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"

FORM_ANALYSIS_PROMPT = """You are a world-class professional billiards coach and biomechanics expert.
Analyze this video of a player's stroke and form with extreme technical precision.

Analyze the following specific areas:
1. **Stance & Balance**: Check foot positioning and head alignment over the cue.
2. **Bridge Stability**: Is the bridge hand solid? Is there any movement during the shot?
3. **Stroke Quality**: Analyze the backswing length, the pause at the back, and the follow-through acceleration.
4. **Recommendations**: Provide 3 specific, actionable corrections to improve consistency.

Use professional terminology. Format with clear markdown headers (###) and bullet points.
"""

def _extract_text(data: Dict[str, Any]) -> str:
    """
    Gemini responses commonly look like:
    { candidates: [ { content: { parts: [ {text: "..."} ] } } ] }
    """
    candidates = data.get("candidates", [])
    if not candidates:
        return ""

    parts = candidates[0].get("content", {}).get("parts", [])
    texts = []
    for p in parts:
        if isinstance(p, dict) and p.get("text"):
            texts.append(p["text"])
    return "\n".join(texts).strip()

async def _post_gemini(model: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    url = GEMINI_BASE.format(model=model) + f"?key={settings.GEMINI_API_KEY}"

    timeout = httpx.Timeout(connect=10.0, read=120.0, write=30.0, pool=10.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        r = await client.post(url, json=payload)

    if r.status_code != 200:
        raise GeminiError(f"Gemini API error ({r.status_code}): {r.text}")

    return r.json()

async def analyze_form_video(base64_video: str, mime_type: str) -> str:
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [
                    {"inline_data": {"mime_type": mime_type, "data": base64_video}},
                    {"text": FORM_ANALYSIS_PROMPT},
                ],
            }
        ],
    }

    data = await _post_gemini(settings.GEMINI_MODEL_VIDEO, payload)
    text = _extract_text(data)
    return text or "I couldn't analyze the video. Please ensure the camera is steady and try again."

async def generate_practice_routine(focus_area: str) -> str:
    """
    Returns raw JSON text (we parse/validate it in the API route).
    We force JSON output using response_mime_type and a schema-like instruction.
    """
    prompt = f"""Create a professional, high-performance billiards/pool practice routine focusing on: {focus_area}.
Return ONLY valid JSON with this shape:
{{
  "title": "string",
  "description": "string",
  "drills": [
    {{
      "name": "string",
      "reps": "string",
      "instructions": "string",
      "youtubeSearchQuery": "string"
    }},
    {{ ... }},
    {{ ... }}
  ]
}}
Rules:
- drills must be exactly 3 items
- youtubeSearchQuery should be a precise YouTube search string (example: "dr dave pool {focus_area} drill")
"""

    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": prompt}],
            }
        ],
        "generationConfig": {
            "response_mime_type": "application/json"
        }
    }

    data = await _post_gemini(settings.GEMINI_MODEL_TEXT, payload)
    text = _extract_text(data)
    if not text:
        raise GeminiError("Empty response from Gemini.")
    return text