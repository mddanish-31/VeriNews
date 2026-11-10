"""Pydantic schemas for the evidence-assisted news verification MVP."""

from typing import List, Literal, Optional
from pydantic import BaseModel, Field, field_validator


class EvidenceSourceItem(BaseModel):
    """Corroborating or disputing live web source item."""

    title: str = Field(..., description="Source article title.")
    publisher: str = Field(..., description="Publisher domain or organization.")
    url: str = Field(..., description="Original clickable source URL.")
    snippet: Optional[str] = Field(default="", description="Relevant textual evidence snippet.")
    date: Optional[str] = Field(default=None, description="Publication date if available.")


class VerificationRequest(BaseModel):
    """Input payload for evidence-assisted news verification."""

    input_type: Literal["headline", "article", "url"] = Field(
        default="headline",
        description="Format of news submission: 'headline', 'article', or 'url'.",
    )
    text: Optional[str] = Field(
        default="",
        description="News headline (10–500 chars) or full article body (up to 10,000 chars).",
    )
    url: Optional[str] = Field(
        default=None,
        description="Web URL of news article to fetch, extract, and verify.",
    )
    language_hint: Literal["auto", "en", "hi"] = Field(
        default="auto",
        description="Optional language preference hint ('auto', 'en', or 'hi').",
    )

    @field_validator("text")
    @classmethod
    def clean_text(cls, v: Optional[str]) -> str:
        return (v or "").strip()

    @field_validator("url")
    @classmethod
    def clean_url(cls, v: Optional[str]) -> Optional[str]:
        if v:
            return v.strip()
        return None


class VerificationResponse(BaseModel):
    """Comprehensive evidence-assisted news verification response."""

    status: Literal[
        "Supported by Available Evidence",
        "Contradicted by Available Evidence",
        "Partially Supported",
        "Misleading or Missing Context",
        "Insufficient Evidence",
        "Unable to Verify",
    ] = Field(..., description="One of the 6 allowed responsible AI verification statuses.")

    summary: str = Field(..., description="Concise summary of the submitted news claim.")
    claim_checked: str = Field(..., description="Specific core factual claim examined.")
    explanation: str = Field(..., description="Objective analysis comparing claim with evidence.")

    supporting_evidence: List[str] = Field(
        default_factory=list,
        description="Concrete corroborating facts extracted from live sources.",
    )
    contradictory_evidence: List[str] = Field(
        default_factory=list,
        description="Concrete contradictory or debunking facts extracted from sources.",
    )
    missing_context: List[str] = Field(
        default_factory=list,
        description="Missing background context or qualifiers omitted from claim.",
    )

    sources: List[EvidenceSourceItem] = Field(
        default_factory=list,
        description="Live independent web sources with clickable original URLs.",
    )

    detected_language: str = Field(..., description="Resolved ISO language code ('en' or 'hi').")
    language_name: str = Field(..., description="Human-readable language name.")
    input_type: str = Field(..., description="Submission type ('headline', 'article', or 'url').")
    extracted_headline: Optional[str] = Field(
        default=None,
        description="Headline extracted when verifying via URL or article body.",
    )

    limitations: List[str] = Field(
        default_factory=list,
        description="Important responsible AI limitations and methodology notices.",
    )
    disclaimer: str = Field(
        default=(
            "VeriNews provides AI-assisted evidence analysis based on live web retrieval. "
            "Web coverage indicates presence in public discourse, not judicial factual certainty. "
            "Always verify critical claims with accredited fact-checking organizations."
        ),
        description="Non-dismissible responsible AI notice.",
    )
    model_version: str = Field(
        default="VeriNews-Evidence-MVP-v1",
        description="Verification engine release identifier.",
    )
    latency_ms: Optional[float] = Field(
        default=None,
        description="End-to-end analysis processing latency in milliseconds.",
    )

    # Backward compatibility attributes for legacy prediction consumers
    prediction_label: Optional[str] = None
    is_credible: Optional[bool] = None
    confidence_score: Optional[float] = None
    confidence_tier: Optional[str] = None

