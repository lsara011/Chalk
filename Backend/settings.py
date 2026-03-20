import json
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Load backend secrets from Backend/.env when running from project root.
    model_config = SettingsConfigDict(env_file="Backend/.env", extra="ignore")

    GEMINI_API_KEY: str
    FRONTEND_ORIGIN: str = "http://localhost:5173"
    FRONTEND_ORIGINS: str = ""

    GEMINI_MODEL_TEXT: str = "gemini-2.5-flash"
    GEMINI_MODEL_VIDEO: str = "gemini-2.5-flash"

    @property
    def cors_allow_origins(self) -> List[str]:
        origins: List[str] = []
        raw = (self.FRONTEND_ORIGINS or "").strip()
        if raw:
            if raw.startswith("["):
                try:
                    parsed = json.loads(raw)
                    if isinstance(parsed, list):
                        origins.extend([str(item).strip() for item in parsed if str(item).strip()])
                except json.JSONDecodeError:
                    origins = []
            else:
                origins.extend([item.strip() for item in raw.split(",") if item.strip()])

        if not origins:
            origins = [self.FRONTEND_ORIGIN]

        seen = set()
        ordered = []
        for origin in origins:
            if origin not in seen:
                seen.add(origin)
                ordered.append(origin)
        return ordered

settings = Settings()
