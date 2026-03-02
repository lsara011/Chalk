from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    # Load backend secrets from Backend/.env when running from project root.
    model_config = SettingsConfigDict(env_file="Backend/.env", extra="ignore")

    GEMINI_API_KEY: str
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    GEMINI_MODEL_TEXT: str = "gemini-2.0-flash"
    GEMINI_MODEL_VIDEO: str = "gemini-2.0-flash"

settings = Settings()
