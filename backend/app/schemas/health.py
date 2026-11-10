from pydantic import BaseModel, Field


class ModelReadiness(BaseModel):
    """Status of language-specific trained model artifacts."""

    english: bool = Field(
        default=False,
        description="Whether an approved English ML model artifact is loaded and ready for inference.",
    )
    hindi: bool = Field(
        default=False,
        description="Whether an approved Hindi ML model artifact is loaded and ready for inference.",
    )


class HealthResponse(BaseModel):
    """Health check response schema."""

    status: str = Field(default="healthy", description="Application service status.")
    version: str = Field(default="0.1.0", description="Semantic version of the VeriNews API.")
    models_loaded: ModelReadiness = Field(
        ...,
        description="Readiness flags for loaded language models.",
    )

