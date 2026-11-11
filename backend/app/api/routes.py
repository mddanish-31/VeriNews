import logging
import time
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.db import get_optional_db
from backend.app.schemas.health import HealthResponse, ModelReadiness
from backend.app.schemas.prediction import (
    ErrorResponse,
    PredictionRequest,
    PredictionResponse,
)
from backend.app.schemas.samples import SampleExcerpt
from backend.app.schemas.verification import (
    EvidenceSourceItem,
    VerificationRequest,
    VerificationResponse,
)
from backend.app.services.evidence_analyzer import analyze_news_with_evidence
from backend.app.services.language import (
    UnsupportedLanguageException,
    detect_script_and_language,
)
from backend.app.services.model_service import (
    ModelUnavailableException,
    model_service,
)
from backend.app.services.url_extractor import (
    URLExtractionException,
    fetch_news_url,
)
from backend.app.services.web_search import search_web_evidence

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Analysis & Verification"])

# Curated, illustrative sample excerpts
CURATED_SAMPLES: List[SampleExcerpt] = [
    SampleExcerpt(
        id="sample-en-credible",
        language="en",
        language_name="English",
        category="Public Infrastructure / Local News",
        title="City Council Approves New Public Library Construction",
        text=(
            "The city council has approved a new public library for the east side, with construction "
            "expected to begin next spring. The project includes a reading room, community spaces, "
            "and expanded access to digital resources. Officials said the final budget and timeline "
            "will be published after the next planning meeting."
        ),
        is_illustrative=True,
        disclaimer="Illustrative sample excerpt only. Not evaluated by an active model.",
    ),
    SampleExcerpt(
        id="sample-hi-credible",
        language="hi",
        language_name="Hindi",
        category="सार्वजनिक अवसंरचना / स्थानीय समाचार",
        title="नगर परिषद ने नए सार्वजनिक पुस्तकालय को मंजूरी दी",
        text=(
            "नगर परिषद ने शहर के पूर्वी हिस्से में एक नए सार्वजनिक पुस्तकालय के निर्माण को मंजूरी दी है। "
            "अधिकारियों के अनुसार, निर्माण अगले वसंत में शुरू होने की उम्मीद है। प्रस्तावित भवन में "
            "पढ़ने का कक्ष, सामुदायिक गतिविधियों के लिए स्थान और डिजिटल संसाधनों की सुविधा शामिल होगी। "
            "अंतिम बजट और समय-सारणी अगली योजना बैठक के बाद प्रकाशित की जाएगी।"
        ),
        is_illustrative=True,
        disclaimer="केवल उदाहरणात्मक अंश। किसी सक्रिय मॉडल द्वारा मूल्यांकन नहीं किया गया।",
    ),
]


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Service Health and Model Readiness Probe",
    description="Returns current service status and indicates whether language model artifacts are loaded.",
)
async def get_health() -> HealthResponse:
    """Probe API health and model readiness status."""
    readiness = model_service.get_readiness()
    return HealthResponse(
        status="healthy",
        version=settings.APP_VERSION,
        models_loaded=ModelReadiness(
            english=readiness["english"],
            hindi=readiness["hindi"],
        ),
    )


@router.get(
    "/samples",
    response_model=List[SampleExcerpt],
    summary="Get Pre-Curated Test Samples",
    description="Returns verified English and Hindi sample news excerpts for demonstration and testing.",
)
async def get_samples() -> List[SampleExcerpt]:
    """Retrieve pre-curated illustrative news excerpts."""
    return CURATED_SAMPLES


@router.post(
    "/predict",
    response_model=PredictionResponse,
    responses={
        status.HTTP_400_BAD_REQUEST: {"model": ErrorResponse, "description": "Invalid input headline text."},
        status.HTTP_422_UNPROCESSABLE_CONTENT: {"model": ErrorResponse, "description": "Unsupported language or script."},
        status.HTTP_503_SERVICE_UNAVAILABLE: {"model": ErrorResponse, "description": "Model service unavailable."},
    },
    summary="Analyze News Headline Credibility Patterns",
    description=(
        "Analyzes stylistic and linguistic patterns in news headlines and short claims for English and Hindi. "
        "Strictly requires 20 to 500 characters, reflecting the headline training distribution. "
        "Returns HTTP 503 if no approved trained model artifact is currently loaded."
    ),
)
async def predict_article(
    request: PredictionRequest,
    db: Optional[Session] = Depends(get_optional_db),
) -> PredictionResponse:
    """Inspect script and route news text to the appropriate model pipeline."""
    # Privacy protection: Log only the character length and language hint, NEVER the full raw article text.
    logger.info(
        "Received /api/predict request: char_length=%d, language_hint=%s",
        len(request.text),
        request.language_hint,
    )

    # 1. Script & language detection
    try:
        lang_code, lang_name = detect_script_and_language(
            request.text,
            language_hint=request.language_hint,
        )
    except UnsupportedLanguageException as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=exc.message,
        ) from exc

    # 2. Model inference dispatch
    try:
        return model_service.predict(
            text=request.text,
            detected_language=lang_code,
            language_name=lang_name,
        )
    except ModelUnavailableException as exc:
        # Honest non-fabricated response: Return 503 instead of pretending to have a model prediction
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=exc.message,
        ) from exc


@router.post(
    "/verify",
    response_model=VerificationResponse,
    responses={
        status.HTTP_400_BAD_REQUEST: {"model": ErrorResponse, "description": "Invalid news input or unsafe URL."},
        status.HTTP_422_UNPROCESSABLE_CONTENT: {"model": ErrorResponse, "description": "Unsupported language/script or unreadable page."},
    },
    summary="AI-Assisted News Verification Using Live Web Evidence",
    description=(
        "Verifies news headlines, full article bodies, or news URLs by retrieving independent live web evidence. "
        "Compares claims against verifiable sources and outputs one of 6 allowed responsible AI statuses."
    ),
)
async def verify_news(request: VerificationRequest) -> VerificationResponse:
    """Retrieve live web evidence and synthesize an objective, multi-source analysis."""
    t0 = time.perf_counter()
    input_type = request.input_type
    raw_text = (request.text or "").strip()
    url = (request.url or "").strip() if request.url else None
    extracted_headline = None

    # 1. Input resolution and validation
    if input_type == "url" or (url and not raw_text):
        if not url:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A valid news URL is required when selecting URL input mode.",
            )
        try:
            fetched = fetch_news_url(url)
            claim_text = fetched["headline"]
            extracted_headline = fetched["headline"]
            input_type = "url"
        except URLExtractionException as exc:
            raise HTTPException(status_code=exc.status_code, detail=exc.message) from exc
    elif input_type == "article":
        if len(raw_text) < 20:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Article text must contain at least 20 characters.",
            )
        if len(raw_text) > 10000:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Article text cannot exceed 10,000 characters.",
            )
        claim_text = raw_text[:600]
        first_line = raw_text.splitlines()[0].strip()
        extracted_headline = first_line[:140] if len(first_line) > 10 else raw_text[:140]
        input_type = "article"
    else:
        # Headline mode
        if len(raw_text) < 10:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="News headline or claim statement must contain at least 10 characters.",
            )
        if len(raw_text) > 500:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="News headline or claim statement cannot exceed 500 characters. For longer text, please select Full Article mode.",
            )
        claim_text = raw_text
        input_type = "headline"

    logger.info(
        "Received /api/verify request: input_type=%s, char_length=%d, language_hint=%s",
        input_type,
        len(claim_text),
        request.language_hint,
    )

    # 2. Script & language detection (allows Romanized Hindi for live evidence search)
    try:
        lang_code, lang_name = detect_script_and_language(
            claim_text,
            language_hint=request.language_hint,
            allow_romanized_hindi=True,
        )
    except UnsupportedLanguageException as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail=exc.message,
        ) from exc

    # 3. Live web evidence search
    search_query = extracted_headline or claim_text
    evidence_sources = search_web_evidence(search_query)

    # 4. AI-assisted evidence analysis
    analysis = analyze_news_with_evidence(
        claim_text=claim_text,
        evidence_sources=evidence_sources,
        detected_language=lang_code,
        language_name=lang_name,
        input_type=input_type,
        source_url=url,
    )

    t1 = time.perf_counter()
    latency_ms = round((t1 - t0) * 1000.0, 2)

    status_val = analysis["status"]
    is_cred = (
        True
        if status_val == "Supported by Available Evidence"
        else (False if status_val == "Contradicted by Available Evidence" else None)
    )

    return VerificationResponse(
        status=status_val,
        summary=analysis["summary"],
        claim_checked=analysis["claim_checked"],
        explanation=analysis["explanation"],
        supporting_evidence=analysis.get("supporting_evidence", []),
        contradictory_evidence=analysis.get("contradictory_evidence", []),
        missing_context=analysis.get("missing_context", []),
        sources=[
            EvidenceSourceItem(
                title=s.get("title", ""),
                publisher=s.get("publisher", ""),
                url=s.get("url", ""),
                snippet=s.get("snippet", ""),
                date=s.get("date"),
            )
            for s in evidence_sources
        ],
        detected_language=lang_code,
        language_name=lang_name,
        input_type=input_type,
        extracted_headline=extracted_headline,
        limitations=analysis.get("missing_context", []),
        disclaimer=(
            "VeriNews provides AI-assisted evidence analysis based on live web retrieval. "
            "Web coverage indicates presence in public discourse, not judicial factual certainty. "
            "Always verify critical claims with accredited fact-checking organizations."
        ),
        model_version="VeriNews-Evidence-MVP-v1",
        latency_ms=latency_ms,
        prediction_label=status_val,
        is_credible=is_cred,
        confidence_score=None,
        confidence_tier="Evidence-Assisted Assessment (No Numerical Probability Fabricated)",
    )
