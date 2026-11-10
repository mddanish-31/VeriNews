from typing import List, Literal, Optional
from pydantic import BaseModel, Field, field_validator


from backend.app.core.config import settings


class PredictionRequest(BaseModel):
    """Incoming request payload for news headline credibility pattern analysis."""

    text: str = Field(
        ...,
        min_length=settings.MIN_TEXT_LENGTH,
        max_length=settings.MAX_TEXT_LENGTH,
        description=f"News headline or statement content to analyze ({settings.MIN_TEXT_LENGTH} to {settings.MAX_TEXT_LENGTH} characters).",
        examples=[
            "Cabinet approves new incentive scheme for domestic solar panel manufacturing today."
        ],
    )
    language_hint: Literal["auto", "en", "hi"] = Field(
        default="auto",
        description="Optional language hint from the client ('auto', 'en', or 'hi').",
    )

    @field_validator("text")
    @classmethod
    def validate_non_empty(cls, value: str) -> str:
        trimmed = value.strip()
        if len(trimmed) < settings.MIN_TEXT_LENGTH:
            raise ValueError(
                f"Input headline text must contain at least {settings.MIN_TEXT_LENGTH} non-whitespace characters."
            )
        if len(trimmed) > settings.MAX_TEXT_LENGTH:
            raise ValueError(
                f"Input text ({len(trimmed)} chars) exceeds the {settings.MAX_TEXT_LENGTH}-character limit. "
                "The current model is trained exclusively on news headlines and short claims, not full-length articles."
            )
        return trimmed


class TokenAttribution(BaseModel):
    """Influential lexical token extracted from the model's feature weights."""

    token: str = Field(..., description="The word or subword token.")
    weight: Optional[float] = Field(
        default=None,
        description="Model coefficient magnitude (None if uncalibrated or illustrative).",
    )
    direction: Optional[str] = Field(
        default=None,
        description="Stylistic indication ('credible', 'sensational', or 'illustrative').",
    )


class PredictionResponse(BaseModel):
    """Output prediction payload for news credibility pattern analysis."""

    detected_language: str = Field(..., description="Resolved ISO language code ('en' or 'hi').")
    language_name: str = Field(..., description="Human-readable language name.")
    prediction_label: str = Field(..., description="Categorical pattern assessment.")
    is_credible: Optional[bool] = Field(
        default=None,
        description="Boolean credibility indicator. Null when uncalibrated.",
    )
    confidence_score: Optional[float] = Field(
        default=None,
        description="Model confidence probability (0.0–1.0). Null when uncalibrated.",
    )
    confidence_tier: Optional[str] = Field(
        default=None,
        description="Qualitative confidence description (e.g. 'Uncalibrated / Low Confidence').",
    )
    influential_tokens: List[TokenAttribution] = Field(
        default_factory=list,
        description="Influential lexical tokens identified by the model.",
    )
    disclaimer: str = Field(
        default=(
            "VeriNews analyzes stylistic and linguistic markers. This assessment does not verify "
            "empirical facts. Always verify important news with accredited fact-checkers."
        ),
        description="Non-dismissible responsible AI notice.",
    )
    model_version: str = Field(..., description="Model artifact identifier.")
    latency_ms: Optional[float] = Field(
        default=None,
        description="End-to-end model inference duration in milliseconds.",
    )


class ErrorResponse(BaseModel):
    """Standardized error response schema."""

    detail: str = Field(..., description="Human-readable error explanation.")
    error_code: str = Field(..., description="Machine-readable error identifier.")

