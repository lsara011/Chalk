from pydantic import BaseModel, Field, field_validator
from typing import List

# ---------- Practice Routine ----------

class Drill(BaseModel):
    name: str
    reps: str
    instructions: str
    youtubeSearchQuery: str
    youtubeVideoId: str | None = None
    youtubeUrl: str | None = None
    youtubeEmbedUrl: str | None = None

class PracticeRoutine(BaseModel):
    title: str
    description: str
    drills: List[Drill]

    @field_validator("drills")
    @classmethod
    def must_have_three_drills(cls, v: List[Drill]):
        if len(v) != 3:
            raise ValueError("Expected exactly 3 drills.")
        return v

class GenerateRoutineRequest(BaseModel):
    focusArea: str = Field(..., min_length=2, max_length=80)

# ---------- Video Analysis ----------

class AnalyzeFormRequest(BaseModel):
    base64Video: str = Field(..., description="Base64 video bytes (NO data: prefix)")
    mimeType: str = Field(..., description="video/mp4, video/quicktime, etc.")

    @field_validator("mimeType")
    @classmethod
    def must_be_video_mime(cls, v: str):
        if not v.startswith("video/"):
            raise ValueError("mimeType must start with video/")
        return v

class AnalyzeFormResponse(BaseModel):
    analysis: str
