"""
App configuration. Reads values from environment variables (.env file).
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # --- Database ---
    DATABASE_URL: str = "postgresql://postgres:password@localhost:5432/ai_business_assistant"

    # --- JWT Auth ---
    SECRET_KEY: str = "change-this-to-a-random-secret-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # --- LLM / RAG (used in later phase, kept here so config is centralized) ---
    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    GROQ_API_KEY: str = ""

    class Config:
        env_file = ".env"


settings = Settings()
