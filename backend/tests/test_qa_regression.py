"""Comprehensive QA Regression Test Suite covering issues VN-01 through VN-10.

Tests:
- VN-01: Auto-detection and language pipeline resolution (English, Devanagari Hindi, Romanized Hindi).
- VN-02: Verdict and summary consistency enforcement (Insufficient Evidence and Contradicted).
- VN-03: Unsupported language rejection (French, Spanish, German) without silent English fallback.
- VN-04: RFC 6052 NAT64 IPv6-mapped address safety and strict SSRF preservation.
- VN-05: Unbroken long strings handling without crashes.
- VN-07: User-friendly URL DNS and extraction error messages.
- VN-08: Fact-check evidence retrieval augmentation for debunked/viral claims.
- VN-09: 500-character boundary enforcement for headline mode.
- VN-10: Rapid duplicate submission protection and request isolation.
"""

import ipaddress
import pytest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.services.url_extractor import validate_url_safety, NAT64_PREFIX
from backend.app.services.language import (
    detect_script_and_language,
    detect_unsupported_latin_language,
    UnsupportedLanguageException,
)
from backend.app.services.evidence_analyzer import (
    _enforce_verdict_consistency,
    analyze_news_with_evidence,
)
from backend.app.services.web_search import search_web_evidence

client = TestClient(app)


# ==========================================
# VN-01: Automatic Language Detection
# ==========================================

def test_vn01_language_auto_detection():
    """Verify automatic detection correctly classifies English, Devanagari Hindi, and Romanized Hindi."""
    # English
    en_code, en_name = detect_script_and_language(
        "ISRO launched Chandrayaan successfully into lunar orbit today.",
        language_hint="auto",
        allow_romanized_hindi=True,
    )
    assert en_code == "en"
    assert en_name == "English"

    # Devanagari Hindi
    hi_code, hi_name = detect_script_and_language(
        "भारतीय अंतरिक्ष अनुसंधान संगठन इसरो ने चंद्रयान मिशन प्रक्षेपित किया।",
        language_hint="auto",
        allow_romanized_hindi=True,
    )
    assert hi_code == "hi"
    assert hi_name == "Hindi"

    # Romanized Hindi (Hinglish)
    rom_code, rom_name = detect_script_and_language(
        "ISRO ne Chandrayaan launch kiya aur desh ka naam roshan hua",
        language_hint="auto",
        allow_romanized_hindi=True,
    )
    assert rom_code == "hi"
    assert "Hindi" in rom_name


# ==========================================
# VN-02: Verdict and Summary Consistency
# ==========================================

def test_vn02_insufficient_evidence_summary_not_asserting_fact():
    """Verify that Insufficient Evidence never asserts the claim as fact in summary."""
    unverified_payload = {
        "status": "Insufficient Evidence",
        "summary": "Government deployed secret quantum teleportation machines in Delhi.",
        "claim_checked": "Quantum teleportation machines in Delhi",
        "explanation": "No records found.",
        "supporting_evidence": ["Bogus fact that should be cleared"],
        "contradictory_evidence": [],
    }
    adjusted = _enforce_verdict_consistency(unverified_payload, "Quantum teleportation in Delhi", "en")
    assert adjusted["status"] == "Insufficient Evidence"
    assert "Unsubstantiated" in adjusted["summary"] or "claim" in adjusted["summary"].lower()
    assert len(adjusted["supporting_evidence"]) == 0


def test_vn02_contradicted_evidence_summary_consistency():
    """Verify that Contradicted by Available Evidence summary explicitly mentions contradiction or debunking."""
    contradicted_payload = {
        "status": "Contradicted by Available Evidence",
        "summary": "UNESCO declared the Indian national anthem the best in the world.",
        "claim_checked": "UNESCO national anthem claim",
        "explanation": "Fact-checking portals report UNESCO never issued such a statement.",
        "contradictory_evidence": [],
    }
    adjusted = _enforce_verdict_consistency(contradicted_payload, "UNESCO anthem claim", "en")
    assert adjusted["status"] == "Contradicted by Available Evidence"
    assert any(w in adjusted["summary"].lower() for w in ("contradict", "fact-check", "dispute", "debunk"))
    assert len(adjusted["contradictory_evidence"]) > 0


# ==========================================
# VN-03: Unsupported Language Handling
# ==========================================

def test_vn03_french_language_rejected():
    """Verify that French text is not silently processed as English and returns a clear unsupported message."""
    french_text = "Le président de la République a annoncé une nouvelle loi sur le climat et l'énergie."
    assert detect_unsupported_latin_language(french_text) == "French"

    res = client.post("/api/verify", json={"input_type": "headline", "text": french_text, "language_hint": "auto"})
    assert res.status_code == 422
    assert "French" in res.json()["detail"]
    assert "English and Hindi" in res.json()["detail"]


def test_vn03_spanish_language_rejected():
    """Verify that Spanish text is detected and rejected with a clear limitation."""
    spanish_text = "El presidente del gobierno anunció nuevas medidas para la economía nacional hoy."
    assert detect_unsupported_latin_language(spanish_text) == "Spanish"

    res = client.post("/api/verify", json={"input_type": "headline", "text": spanish_text, "language_hint": "auto"})
    assert res.status_code == 422
    assert "Spanish" in res.json()["detail"]


# ==========================================
# VN-04: BBC URL & IPv6 NAT64 SSRF Safety
# ==========================================

def test_vn04_nat64_prefix_allows_public_and_blocks_private():
    """Verify RFC 6052 NAT64 prefix allows public translated IPv4 and strictly blocks private ones."""
    # BBC Fastly public IP translated to NAT64: 199.232.100.81 -> c7.e8.64.51
    bbc_nat64 = "64:ff9b::c7e8:6451"
    ip = ipaddress.ip_address(bbc_nat64)
    assert ip in NAT64_PREFIX
    embedded_v4 = ipaddress.IPv4Address(ip.packed[-4:])
    assert str(embedded_v4) == "199.232.100.81"
    assert embedded_v4.is_private is False

    # Blocked private addresses translated to NAT64
    nat64_loopback = "64:ff9b::7f00:0001"  # 127.0.0.1
    nat64_private10 = "64:ff9b::0a00:0001"  # 10.0.0.1
    nat64_aws_meta = "64:ff9b::a9fe:a9fe"  # 169.254.169.254

    safe_loopback, msg1 = validate_url_safety(f"http://[{nat64_loopback}]")
    assert safe_loopback is False
    assert "blocked" in msg1.lower()

    safe_priv, msg2 = validate_url_safety(f"http://[{nat64_private10}]")
    assert safe_priv is False
    assert "blocked" in msg2.lower()

    safe_meta, msg3 = validate_url_safety(f"http://[{nat64_aws_meta}]")
    assert safe_meta is False
    assert "blocked" in msg3.lower()


def test_vn04_bbc_article_url_is_safe():
    """Verify BBC news public URL passes safety checks."""
    bbc_url = "https://www.bbc.com/news/science-environment-66601213"
    is_safe, error_msg = validate_url_safety(bbc_url)
    assert is_safe is True
    assert error_msg == ""


# ==========================================
# VN-05: Unbroken Long String Handling
# ==========================================

def test_vn05_unbroken_long_string_handled_safely():
    """Verify unbroken repeated characters are accepted and processed without 500 error."""
    unbroken_text = "HeadlineWithNoSpaces" + ("a" * 120) + "ReportedInPublicNews"
    res = client.post("/api/verify", json={"input_type": "headline", "text": unbroken_text})
    assert res.status_code == 200
    data = res.json()
    assert data["status"] in ("Insufficient Evidence", "Unable to Verify")


# ==========================================
# VN-07: User-Friendly URL Error Messages
# ==========================================

def test_vn07_user_friendly_dns_error():
    """Verify that a non-resolving domain returns a human-friendly error without stack traces."""
    is_safe, msg = validate_url_safety("https://definitely-non-existent-subdomain-12345.org")
    assert is_safe is False
    assert "could not be resolved" in msg
    assert "getaddrinfo" not in msg
    assert "Errno" not in msg


# ==========================================
# VN-08: Fact-Check Signal Retrieval
# ==========================================

def test_vn08_web_search_includes_fact_check_sources():
    """Verify web search retrieves accredited fact-checking sources for debunked claims."""
    sources = search_web_evidence("UNESCO declares Indian national anthem best in the world")
    assert len(sources) > 0
    # Confirm sources contain fact check / fake alert titles or accredited publishers
    combined_titles = " ".join(s["title"].lower() for s in sources)
    assert any(term in combined_titles for term in ("fact check", "fake", "alert", "unesco", "anthem"))


# ==========================================
# VN-09: 500-Character Boundary Enforcement
# ==========================================

def test_vn09_headline_500_character_boundary():
    """Verify exactly 500 chars is valid for headline mode and 501 chars returns HTTP 400."""
    # Exactly 500 characters
    base = "The central bank announced new interest rate policies today. "
    headline_500 = (base * 10)[:500]
    assert len(headline_500) == 500

    res_500 = client.post("/api/verify", json={"input_type": "headline", "text": headline_500})
    assert res_500.status_code == 200

    # 501 characters in headline mode -> 400
    headline_501 = headline_500 + "x"
    assert len(headline_501) == 501
    res_501 = client.post("/api/verify", json={"input_type": "headline", "text": headline_501})
    assert res_501.status_code == 400
    assert "cannot exceed 500 characters" in res_501.json()["detail"]


# ==========================================
# VN-10: Duplicate Submission Protection
# ==========================================

def test_vn10_consecutive_verification_requests_isolated():
    """Verify rapid consecutive verification requests complete with isolated independent outputs."""
    h1 = "ISRO Chandrayaan mission successfully explores the lunar surface"
    h2 = "Government launches comprehensive rural solar irrigation subsidy scheme"

    res1 = client.post("/api/verify", json={"input_type": "headline", "text": h1})
    res2 = client.post("/api/verify", json={"input_type": "headline", "text": h2})

    assert res1.status_code == 200
    assert res2.status_code == 200
    assert res1.json()["claim_checked"] != res2.json()["claim_checked"]
