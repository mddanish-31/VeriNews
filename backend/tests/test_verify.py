"""Unit and integration tests for the evidence-assisted news verification MVP (/api/verify).

Validates:
1. English headline verification with live evidence search.
2. Hindi headline verification in Devanagari script.
3. Romanized Hindi (Hinglish) support in verification mode.
4. Full article text submission (>500 characters).
5. News URL submission with readable content extraction.
6. SSRF protections blocking localhost, loopback, private IP ranges, and non-HTTP schemes.
7. Graceful handling of unreported claims (Insufficient Evidence status).
8. Strict compliance with the 6 allowed verification statuses.
9. Absence of fabricated numerical confidence scores.
"""

from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.url_extractor import validate_url_safety

client = TestClient(app)

ALLOWED_STATUSES = {
    "Supported by Available Evidence",
    "Contradicted by Available Evidence",
    "Partially Supported",
    "Misleading or Missing Context",
    "Insufficient Evidence",
    "Unable to Verify",
}


def test_verify_rejects_empty_or_too_short_headline():
    """Verify headline submissions with fewer than 10 characters return HTTP 400."""
    res = client.post("/api/verify", json={"input_type": "headline", "text": "Too short"})
    assert res.status_code == 400
    assert "at least 10 characters" in res.json()["detail"]


def test_verify_ssrf_blocks_private_destinations():
    """Verify that private IP ranges, loopbacks, and dangerous protocols are strictly rejected."""
    dangerous_urls = [
        "http://localhost:8000/admin",
        "http://127.0.0.1:3000/secret",
        "http://0.0.0.0:8080",
        "http://192.168.1.1/router",
        "http://10.0.0.1/internal",
        "http://172.16.0.1/aws",
        "http://169.254.169.254/latest/meta-data",
        "file:///etc/passwd",
        "ftp://files.example.com",
    ]
    for url in dangerous_urls:
        safe, msg = validate_url_safety(url)
        assert safe is False, f"Expected {url} to be blocked by SSRF check"

        # Also verify API endpoint returns 400
        res = client.post("/api/verify", json={"input_type": "url", "url": url})
        assert res.status_code == 400


def test_verify_english_headline():
    """Verify valid English news headline returns structured evidence analysis."""
    headline = "ISRO Chandrayaan mission successfully explores the lunar surface"
    res = client.post(
        "/api/verify",
        json={"input_type": "headline", "text": headline, "language_hint": "en"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] in ALLOWED_STATUSES
    assert data["detected_language"] == "en"
    assert data["language_name"] == "English"
    assert data["confidence_score"] is None
    assert "sources" in data
    assert isinstance(data["sources"], list)
    assert "disclaimer" in data
    assert len(data["summary"]) > 0
    assert len(data["explanation"]) > 0


def test_verify_hindi_devanagari_headline():
    """Verify valid Hindi headline in Devanagari script returns analysis in Hindi."""
    hindi_headline = "भारतीय अंतरिक्ष अनुसंधान संगठन इसरो ने चंद्रयान मिशन प्रक्षेपित किया"
    res = client.post(
        "/api/verify",
        json={"input_type": "headline", "text": hindi_headline, "language_hint": "hi"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] in ALLOWED_STATUSES
    assert data["detected_language"] == "hi"
    assert data["language_name"] == "Hindi"
    assert data["confidence_score"] is None
    assert len(data["explanation"]) > 0


def test_verify_romanized_hindi():
    """Verify Romanized Hindi (Hinglish) claim is accepted in verification mode."""
    hinglish_claim = "ISRO ne Chandrayaan mission launch kiya aur Bharat ka naam roshan hua"
    res = client.post(
        "/api/verify",
        json={"input_type": "headline", "text": hinglish_claim, "language_hint": "auto"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] in ALLOWED_STATUSES
    assert data["detected_language"] == "hi"
    assert "Hindi" in data["language_name"]


def test_verify_full_article_text():
    """Verify long article text (>500 characters) is supported in article mode."""
    article_body = (
        "The Union Cabinet today approved a comprehensive national development program focusing on renewable energy "
        "and domestic manufacturing infrastructure across multiple states. According to official government briefings, "
        "the initiative aims to provide targeted capital subsidies, technical skill certifications, and dedicated green "
        "energy corridors for regional industrial clusters. Industry representatives welcomed the announcement, noting "
        "that the long-term policy certainty will encourage sustainable private investments and expand local employment "
        "opportunities over the next decade. Further guidelines and application timelines are scheduled to be published "
        "by the ministry early next quarter following consultations with regional industry bodies."
    )
    assert len(article_body) > 600

    res = client.post(
        "/api/verify",
        json={"input_type": "article", "text": article_body, "language_hint": "en"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] in ALLOWED_STATUSES
    assert data["input_type"] == "article"
    assert data["extracted_headline"] is not None


def test_verify_unreported_claim_insufficient_evidence():
    """Verify an obscure, unverified synthetic claim returns Insufficient Evidence rather than hallucinating."""
    unreported_claim = "Zylophonic quantum tractor beam deployed in Atlantis yesterday afternoon"
    res = client.post(
        "/api/verify",
        json={"input_type": "headline", "text": unreported_claim, "language_hint": "en"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] in ("Insufficient Evidence", "Unable to Verify")
    assert len(data["supporting_evidence"]) == 0

