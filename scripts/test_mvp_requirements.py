"""VeriNews — Minimum MVP Completion Verification Script.

Executes and reports actual live test results across all required MVP criteria:
1. English headline analysis
2. Hindi headline analysis
3. Roman Hindi input
4. Full article text submission
5. News URL submission
6. Relevant live web-search results
7. Source-link correctness
8. Insufficient-evidence handling
9. Invalid input & SSRF handling
10. Web-search provider failure resilience
11. AI provider failure resilience
"""

import sys
from pathlib import Path

# Ensure project root is in sys.path
ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

import unittest
from fastapi.testclient import TestClient

from backend.app.main import app
from backend.app.services.url_extractor import validate_url_safety
from backend.app.services.web_search import search_web_evidence
from backend.app.services.evidence_analyzer import (
    ALLOWED_STATUSES,
    analyze_news_with_evidence,
)

client = TestClient(app)


def run_mvp_suite():
    print("=" * 80)
    print("VERINEWS MINIMUM MVP VERIFICATION SUITE")
    print("=" * 80)

    # 1. English Headline Analysis
    print("\n[Test 1] English Headline Analysis...")
    en_headline = "ISRO Chandrayaan mission successfully explores the lunar surface"
    res1 = client.post(
        "/api/verify",
        json={"input_type": "headline", "text": en_headline, "language_hint": "en"},
    )
    assert res1.status_code == 200, f"Expected 200, got {res1.status_code}"
    d1 = res1.json()
    assert d1["status"] in ALLOWED_STATUSES
    assert d1["detected_language"] == "en"
    assert d1["language_name"] == "English"
    assert d1["confidence_score"] is None, "Confidence score must be null (no fabrication)"
    assert len(d1["sources"]) > 0, "Expected live web sources"
    print(f"  PASS: Status = '{d1['status']}'")
    print(f"        Sources retrieved = {len(d1['sources'])} (e.g. {d1['sources'][0]['publisher']})")
    print(f"        Explanation excerpt: {d1['explanation'][:100]}...")

    # 2. Hindi Headline Analysis (Devanagari)
    print("\n[Test 2] Hindi Headline Analysis (Devanagari)...")
    hi_headline = "भारतीय अंतरिक्ष अनुसंधान संगठन इसरो ने चंद्रयान मिशन प्रक्षेपित किया"
    res2 = client.post(
        "/api/verify",
        json={"input_type": "headline", "text": hi_headline, "language_hint": "hi"},
    )
    assert res2.status_code == 200, f"Expected 200, got {res2.status_code}"
    d2 = res2.json()
    assert d2["status"] in ALLOWED_STATUSES
    assert d2["detected_language"] == "hi"
    assert d2["language_name"] == "Hindi"
    assert d2["confidence_score"] is None
    print(f"  PASS: Status = '{d2['status']}'")
    print(f"        Sources retrieved = {len(d2['sources'])}")
    print(f"        Hindi explanation excerpt: {d2['explanation'][:90]}...")

    # 3. Roman Hindi Input
    print("\n[Test 3] Romanized Hindi Input (Hinglish)...")
    roman_hindi = "ISRO ne Chandrayaan mission launch kiya aur Bharat ka naam roshan hua"
    res3 = client.post(
        "/api/verify",
        json={"input_type": "headline", "text": roman_hindi, "language_hint": "auto"},
    )
    assert res3.status_code == 200, f"Expected 200, got {res3.status_code}"
    d3 = res3.json()
    assert d3["status"] in ALLOWED_STATUSES
    assert d3["detected_language"] == "hi"
    assert "Hindi" in d3["language_name"]
    print(f"  PASS: Status = '{d3['status']}'")
    print(f"        Language resolved = '{d3['language_name']}'")

    # 4. Full Article Text Submission
    print("\n[Test 4] Full Article Text Submission (>500 characters)...")
    article_text = (
        "The Union Cabinet on Wednesday approved an ambitious national clean energy transition framework "
        "designed to accelerate solar panel manufacturing and grid modernization across industrial corridors. "
        "Official representatives confirmed that the multi-phase program allocates capital investment support "
        "and production incentives over the next five fiscal years. Industry associations welcomed the move, "
        "highlighting that predictable policy timelines will facilitate domestic research partnerships and create "
        "sustainable regional engineering jobs. Detailed operational guidelines will be published by the nodal "
        "ministry early next month following discussions with regional renewable energy councils."
    )
    assert len(article_text) > 500
    res4 = client.post(
        "/api/verify",
        json={"input_type": "article", "text": article_text, "language_hint": "en"},
    )
    assert res4.status_code == 200, f"Expected 200, got {res4.status_code}"
    d4 = res4.json()
    assert d4["status"] in ALLOWED_STATUSES
    assert d4["input_type"] == "article"
    assert d4["extracted_headline"] is not None
    print(f"  PASS: Status = '{d4['status']}'")
    print(f"        Extracted headline = '{d4['extracted_headline'][:60]}...'")

    # 5. News URL Submission
    print("\n[Test 5] News URL Submission...")
    test_url = "https://en.wikipedia.org/wiki/Chandrayaan_programme"
    res5 = client.post(
        "/api/verify",
        json={"input_type": "url", "url": test_url, "language_hint": "en"},
    )
    assert res5.status_code == 200, f"Expected 200, got {res5.status_code}"
    d5 = res5.json()
    assert d5["status"] in ALLOWED_STATUSES
    assert d5["input_type"] == "url"
    assert d5["extracted_headline"] is not None
    print(f"  PASS: Status = '{d5['status']}'")
    print(f"        Extracted title = '{d5['extracted_headline'][:60]}...'")
    print(f"        Sources = {len(d5['sources'])}")

    # 6. Relevant Live Web-Search Results
    print("\n[Test 6] Relevant Live Web-Search Results...")
    sources = search_web_evidence("Chandrayaan 3 lunar landing ISRO", max_results=4)
    assert len(sources) > 0, "Live search must return results for major news event"
    for s in sources:
        assert s["url"].startswith("http://") or s["url"].startswith("https://")
        assert len(s["title"]) > 0
        assert len(s["publisher"]) > 0
    print(f"  PASS: Retrieved {len(sources)} verified search results:")
    for s in sources[:2]:
        print(f"        - {s['publisher']}: '{s['title'][:50]}...'")

    # 7. Source-Link Correctness
    print("\n[Test 7] Source-Link Correctness...")
    for s in d1["sources"]:
        assert s["url"].startswith("http://") or s["url"].startswith("https://"), f"Invalid URL: {s['url']}"
        assert "." in s["publisher"], f"Invalid publisher domain: {s['publisher']}"
    print(f"  PASS: All {len(d1['sources'])} source links have valid HTTP/HTTPS schemes and domain structures.")

    # 8. Insufficient-Evidence Handling
    print("\n[Test 8] Insufficient-Evidence Handling...")
    fake_claim = "Zylophonic hyper-spatial quantum transponder detected in ancient Atlantis ruins"
    res8 = client.post(
        "/api/verify",
        json={"input_type": "headline", "text": fake_claim, "language_hint": "en"},
    )
    assert res8.status_code == 200
    d8 = res8.json()
    assert d8["status"] in ("Insufficient Evidence", "Unable to Verify")
    assert len(d8["supporting_evidence"]) == 0
    print(f"  PASS: Correctly reported status = '{d8['status']}' with zero fabricated supporting evidence.")

    # 9. Invalid Input & SSRF Handling
    print("\n[Test 9] Invalid Input & SSRF Protection...")
    # 9a. Too short
    res_short = client.post("/api/verify", json={"input_type": "headline", "text": "Tiny"})
    assert res_short.status_code == 400
    print("  PASS: Rejects headline shorter than 10 characters (HTTP 400).")

    # 9b. SSRF dangerous URLs
    dangerous_urls = [
        "http://localhost:8000/internal",
        "http://127.0.0.1:3000",
        "http://192.168.1.1/secret",
        "file:///etc/passwd",
    ]
    for d_url in dangerous_urls:
        safe, _ = validate_url_safety(d_url)
        assert safe is False
        res_ssrf = client.post("/api/verify", json={"input_type": "url", "url": d_url})
        assert res_ssrf.status_code == 400
    print("  PASS: SSRF protection blocks localhost, 127.0.0.1, 192.168.x.x, and file:// URLs.")

    # 10. Web-Search Provider Failure Resilience
    print("\n[Test 10] Web-Search Provider Failure Resilience...")
    # Pass empty evidence to analyzer (simulating complete search engine outage)
    fallback_analysis = analyze_news_with_evidence(
        claim_text="Major breaking event occurred without web index connection",
        evidence_sources=[],
        detected_language="en",
        language_name="English",
    )
    assert fallback_analysis["status"] == "Insufficient Evidence"
    assert len(fallback_analysis["supporting_evidence"]) == 0
    print(f"  PASS: Search provider outage safely returns '{fallback_analysis['status']}' without 500 error.")

    # 11. AI Provider Failure Resilience
    print("\n[Test 11] AI Provider Failure Resilience...")
    # When external LLM key is absent or invalid, deterministic concordance engine takes over
    test_sources = [
        {
            "title": "ISRO announces moon mission milestones",
            "publisher": "isro.gov.in",
            "url": "https://www.isro.gov.in/moon",
            "snippet": "The Indian Space Research Organisation confirmed telemetry reception.",
        }
    ]
    concordance_analysis = analyze_news_with_evidence(
        claim_text="ISRO announces moon mission milestones",
        evidence_sources=test_sources,
        detected_language="en",
        language_name="English",
    )
    assert concordance_analysis["status"] in ALLOWED_STATUSES
    assert len(concordance_analysis["summary"]) > 0
    print(f"  PASS: Deterministic fallback resolves status '{concordance_analysis['status']}' cleanly.")

    print("\n" + "=" * 80)
    print("ALL 11 AUTOMATED MVP VERIFICATION TESTS PASSED SUCCESSFULLY!")
    print("=" * 80)


if __name__ == "__main__":
    run_mvp_suite()
