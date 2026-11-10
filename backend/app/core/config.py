import os
from pathlib import Path
from typing import List, Optional
from dotenv import load_dotenv

# Automatically load environment variables from repository root .env if present
ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent
ROOT_ENV_FILE = ROOT_DIR / ".env"
if ROOT_ENV_FILE.is_file():
    load_dotenv(dotenv_path=ROOT_ENV_FILE)


class Settings:
    """Application configuration settings."""

    APP_NAME: str = "VeriNews API"
    APP_VERSION: str = "0.1.0"
    API_PREFIX: str = "/api"
    ENVIRONMENT: str = os.getenv("VERINEWS_ENV", "development")

    # Database configuration
    DATABASE_URL: Optional[str] = os.getenv("DATABASE_URL")

    # CORS configuration
    DEFAULT_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3005",
        "http://127.0.0.1:3005",
    ]

    @property
    def cors_origins(self) -> List[str]:
        env_origins = os.getenv("VERINEWS_CORS_ORIGINS")
        if env_origins:
            return [origin.strip() for origin in env_origins.split(",") if origin.strip()]
        return self.DEFAULT_CORS_ORIGINS

    # Text length limits (aligned with candidate headline model distribution: min 20, max 500 chars)
    MIN_TEXT_LENGTH: int = 20
    MAX_TEXT_LENGTH: int = 500

    # Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent.parent

    @property
    def MODELS_DIR(self) -> Path:
        env_dir = os.getenv("VERINEWS_MODELS_DIR") or os.getenv("MODELS_DIR")
        if env_dir:
            return Path(env_dir)
        return self.BASE_DIR.parent / "models"

    # Early Model Integration flags (independently controlled per language)
    # Dynamically reconciles namespaced (VERINEWS_*) and generic (ENABLE_*) environment variables, defaulting safely to False.
    @property
    def ENABLE_ENGLISH_INFERENCE(self) -> bool:
        return (
            os.getenv("VERINEWS_ENABLE_ENGLISH_INFERENCE")
            or os.getenv("ENABLE_ENGLISH_INFERENCE", "false")
        ).lower() in ("true", "1")

    @property
    def ENABLE_HINDI_INFERENCE(self) -> bool:
        return (
            os.getenv("VERINEWS_ENABLE_HINDI_INFERENCE")
            or os.getenv("ENABLE_HINDI_INFERENCE", "false")
        ).lower() in ("true", "1")

    @property
    def DEFAULT_ENGLISH_ARTIFACT(self) -> str:
        return (
            os.getenv("VERINEWS_DEFAULT_ENGLISH_ARTIFACT")
            or os.getenv("DEFAULT_ENGLISH_ARTIFACT", "en_ifnd_indian_headlines_calibrated_sigmoid.joblib")
        )

    @property
    def DEFAULT_HINDI_ARTIFACT(self) -> str:
        return (
            os.getenv("VERINEWS_DEFAULT_HINDI_ARTIFACT")
            or os.getenv("DEFAULT_HINDI_ARTIFACT", "hi_tallip_hindi_articles_calibrated_sigmoid.joblib")
        )


settings = Settings()
