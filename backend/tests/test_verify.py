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

import logging
from unittest.mock import MagicMock, patch
import httpx
import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.services.evidence_analyzer import (
    _analyze_with_gemini,
    analyze_news_with_evidence,
)
from backend.app.services.url_extractor import (
    URLExtractionException,
    fetch_news_url,
    validate_url_safety,
)
from backend.app.services.web_search import (
    search_google_news_rss,
    search_web_evidence,
    search_wikipedia_api,
)

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


def test_web_search_error_logs_never_leak_sentinel_query_or_exception_message(
    caplog: pytest.LogCaptureFixture,
    monkeypatch: pytest.MonkeyPatch,
):
    """P1-01 regression: web_search error paths must log safe metadata only and never raw query or exception text."""
    sentinel_query = "SENTINEL_CONFIDENTIAL_CLAIM_98412_DO_NOT_LOG"
    sentinel_exc_detail = "SENTINEL_UPSTREAM_ECHO_33109_QUERY_LEAK"

    with caplog.at_level(logging.WARNING, logger="backend.app.services.web_search"):
        # 1. Google News RSS request failure with user-controlled sentinel in both query and exception message
        with patch.object(
            httpx.Client,
            "get",
            side_effect=httpx.ConnectError(f"Connection failed for {sentinel_query} ({sentinel_exc_detail})"),
        ):
            rss_res = search_google_news_rss(sentinel_query, language="en")
            assert rss_res == []

            # 2. Wikipedia search failure with sentinel in both query and exception message
            wiki_res = search_wikipedia_api(sentinel_query, language="hi")
            assert wiki_res == []

        # 3. Google News RSS malformed XML parsing failure containing sentinel
        mock_xml_resp = MagicMock(spec=httpx.Response)
        mock_xml_resp.status_code = 200
        mock_xml_resp.text = f"<rss><unclosed>{sentinel_query} {sentinel_exc_detail}"
        with patch.object(httpx.Client, "get", return_value=mock_xml_resp):
            xml_res = search_google_news_rss(sentinel_query, language="en")
            assert xml_res == []

        # 4. Tavily fallback failure with sentinel in exception message
        monkeypatch.setenv("TAVILY_API_KEY", "test-key-placeholder")
        with patch.object(
            httpx.Client,
            "post",
            side_effect=RuntimeError(f"Tavily payload error echoing {sentinel_query} {sentinel_exc_detail}"),
        ), patch("backend.app.services.web_search.search_google_news_rss", return_value=[]), patch(
            "backend.app.services.web_search.search_wikipedia_api", return_value=[]
        ):
            ev_res = search_web_evidence(sentinel_query, language="en")
            assert ev_res == []

    assert sentinel_query not in caplog.text
    assert sentinel_exc_detail not in caplog.text
    assert f"query_length={len(sentinel_query)}" in caplog.text
    assert "error_type=ConnectError" in caplog.text
    assert "error_type=ParseError" in caplog.text
    assert "error_type=RuntimeError" in caplog.text


def test_url_extractor_error_logs_never_leak_sentinel_url_params_or_exception_message(
    caplog: pytest.LogCaptureFixture,
):
    """P1-01 regression: url_extractor error paths must never log submitted URLs, query params, fragments, or exception text."""
    sentinel_host = "sentinel-host-55192.example.com"
    sentinel_param = "SENTINEL_SECRET_TOKEN_77410"
    sentinel_fragment = "SENTINEL_PRIVATE_FRAGMENT_66201"
    sentinel_exc_msg = "SENTINEL_SOCKET_ERROR_DETAIL_11904"
    submitted_url = f"https://{sentinel_host}/breaking/article?session={sentinel_param}#{sentinel_fragment}"

    with caplog.at_level(logging.WARNING, logger="backend.app.services.url_extractor"):
        # 1. Unexpected exception during host resolution in validate_url_safety
        with patch(
            "backend.app.services.url_extractor.socket.getaddrinfo",
            side_effect=RuntimeError(f"Resolver crash for {submitted_url}: {sentinel_exc_msg}"),
        ):
            is_safe, err_msg = validate_url_safety(submitted_url)
            assert is_safe is False
            assert "Could not connect" in err_msg

        # 2. Unexpected exception during fetch_news_url
        with patch("backend.app.services.url_extractor.validate_url_safety", return_value=(True, "")), patch.object(
            httpx.Client,
            "get",
            side_effect=ValueError(f"Transport crash on {submitted_url} ({sentinel_exc_msg})"),
        ):
            with pytest.raises(URLExtractionException) as exc_info:
                fetch_news_url(submitted_url)
            assert exc_info.value.status_code == 502

    for forbidden in (
        submitted_url,
        sentinel_host,
        sentinel_param,
        sentinel_fragment,
        sentinel_exc_msg,
    ):
        assert forbidden not in caplog.text

    assert f"url_length={len(submitted_url)}" in caplog.text
    assert "error_type=RuntimeError" in caplog.text
    assert "error_type=ValueError" in caplog.text


def test_gemini_fallback_header_auth_and_error_log_redaction(
    caplog: pytest.LogCaptureFixture,
    monkeypatch: pytest.MonkeyPatch,
):
    """P1-01 regression: Gemini synthesis must pass API key in x-goog-api-key header (never URL) and redact exception details."""
    sentinel_claim = "SENTINEL_GEMINI_CLAIM_TEXT_44910"
    sentinel_api_key = "SENTINEL_GEMINI_SECRET_KEY_88321"
    sentinel_exc_detail = "SENTINEL_GEMINI_EXC_BODY_99102"
    captured_requests: list[httpx.Request] = []

    def mock_gemini_handler(request: httpx.Request) -> httpx.Response:
        captured_requests.append(request)
        raise httpx.ConnectError(
            f"Upstream failure for {request.url} key={sentinel_api_key} claim={sentinel_claim} ({sentinel_exc_detail})"
        )

    real_client = httpx.Client

    def client_with_mock_transport(*args, **kwargs):
        kwargs["transport"] = httpx.MockTransport(mock_gemini_handler)
        return real_client(*args, **kwargs)

    monkeypatch.setenv("GEMINI_API_KEY", sentinel_api_key)

    with caplog.at_level(logging.WARNING, logger="backend.app.services.evidence_analyzer"):
        with patch("backend.app.services.evidence_analyzer.httpx.Client", side_effect=client_with_mock_transport):
            res = analyze_news_with_evidence(
                claim_text=sentinel_claim,
                evidence_sources=[],
                detected_language="en",
                language_name="English",
            )

    # Fallback to deterministic concordance must succeed cleanly
    assert res["status"] == "Insufficient Evidence"
    assert len(captured_requests) == 1
    sent_req = captured_requests[0]
    assert sentinel_api_key not in str(sent_req.url)
    assert "key=" not in str(sent_req.url)
    assert sent_req.headers.get("x-goog-api-key") == sentinel_api_key

    # Verify logs contain safe metadata only and never sentinels
    for forbidden in (sentinel_claim, sentinel_api_key, sentinel_exc_detail):
        assert forbidden not in caplog.text
    assert "Gemini AI synthesis fallback: language=en, sources_count=0, error_type=ConnectError" in caplog.text


def test_httpx_info_logging_suppressed_for_outbound_urls_queries_and_credentials(
    caplog: pytest.LogCaptureFixture,
):
    """P1-01 regression: HTTPX INFO-level request logging must not emit outbound URLs, queries, params, or credentials."""
    sentinel_query = "SENTINEL_HTTPX_SEARCH_QUERY_11223"
    sentinel_url_path = "sentinel-private-path-44556"
    sentinel_url_param = "SENTINEL_URL_TOKEN_77889"
    sentinel_api_key = "SENTINEL_HEADER_API_KEY_99001"
    target_url = f"https://news.example.com/{sentinel_url_path}?token={sentinel_url_param}"

    assert logging.getLogger("httpx").getEffectiveLevel() >= logging.WARNING
    assert logging.getLogger("httpcore").getEffectiveLevel() >= logging.WARNING

    def mock_handler(request: httpx.Request) -> httpx.Response:
        if "wikipedia.org" in str(request.url):
            return httpx.Response(200, json={"query": {"search": []}})
        if "news.google.com" in str(request.url):
            return httpx.Response(200, text="<rss><channel></channel></rss>")
        if "generativelanguage.googleapis.com" in str(request.url):
            return httpx.Response(
                200,
                json={
                    "candidates": [
                        {
                            "content": {
                                "parts": [
                                    {
                                        "text": '{"status": "Insufficient Evidence", "summary": "Unsubstantiated claim", "claim_checked": "Test", "explanation": "No evidence", "supporting_evidence": [], "contradictory_evidence": [], "missing_context": []}'
                                    }
                                ]
                            }
                        }
                    ]
                },
            )
        return httpx.Response(
            200,
            text="<html><head><title>Public Headline</title></head><body><article><p>Valid public article body paragraph with sufficient length for extraction.</p></article></body></html>",
        )

    real_client = httpx.Client

    def client_with_mock_transport(*args, **kwargs):
        kwargs["transport"] = httpx.MockTransport(mock_handler)
        return real_client(*args, **kwargs)

    # Capture root INFO logs (matching backend/app/main.py basicConfig level=logging.INFO)
    with caplog.at_level(logging.INFO):
        logging.getLogger("verinews.api").info("Controlled test diagnostic log entry")
        with patch("httpx.Client", side_effect=client_with_mock_transport), patch(
            "backend.app.services.url_extractor.validate_url_safety", return_value=(True, "")
        ):
            search_google_news_rss(sentinel_query, language="en")
            search_wikipedia_api(sentinel_query, language="en")
            _analyze_with_gemini(sentinel_query, [], "en", sentinel_api_key)
            fetch_news_url(target_url)

    # Application INFO logging must remain active
    assert "Controlled test diagnostic log entry" in caplog.text

    # Outbound URLs, queries, parameters, and credentials must never be emitted by httpx/httpcore
    for forbidden in (
        sentinel_query,
        sentinel_url_path,
        sentinel_url_param,
        sentinel_api_key,
        "HTTP Request:",
    ):
        assert forbidden not in caplog.text


def test_global_exception_handler_redacts_traceback_and_sentinel_message(
    caplog: pytest.LogCaptureFixture,
):
    """P1-01 Gap 1 regression: unhandled exceptions must log path and error_type only, never tracebacks or exception messages."""
    sentinel_claim = "SENTINEL_UNHANDLED_CLAIM_PAYLOAD_55821"
    sentinel_cause = "SENTINEL_CHAINED_UPSTREAM_SECRET_99412"
    non_raising_client = TestClient(app, raise_server_exceptions=False)

    def raise_chained_unexpected_error(*args, **kwargs):
        try:
            raise ValueError(f"Inner cause leaking {sentinel_cause}")
        except ValueError as inner_exc:
            raise RuntimeError(f"Unexpected crash while processing {sentinel_claim}") from inner_exc

    with caplog.at_level(logging.ERROR, logger="verinews.api"):
        with patch(
            "backend.app.api.routes.search_web_evidence",
            side_effect=raise_chained_unexpected_error,
        ):
            res = non_raising_client.post(
                "/api/verify",
                json={
                    "input_type": "headline",
                    "text": "ISRO Chandrayaan mission successfully explores the lunar surface",
                    "language_hint": "en",
                },
            )

    assert res.status_code == 500
    body = res.json()
    assert body["error_code"] == "INTERNAL_SERVER_ERROR"
    assert body["detail"] == "An internal server error occurred. Please try again later."

    for forbidden in (
        sentinel_claim,
        sentinel_cause,
        "Unexpected crash while processing",
        "Inner cause leaking",
        "Traceback (most recent call last)",
    ):
        assert forbidden not in caplog.text
        assert forbidden not in res.text

    assert "Unhandled server exception: path=/api/verify, error_type=RuntimeError" in caplog.text


def test_verify_language_hint_validation_and_log_safety(
    caplog: pytest.LogCaptureFixture,
):
    """P1-01 Gap 2 regression: valid language hints ('auto', 'en', 'hi') work while arbitrary values return HTTP 422 without logging."""
    sentinel_hint = "SENTINEL_MALICIOUS_LANGUAGE_HINT_77291"
    en_headline = "ISRO Chandrayaan mission successfully explores the lunar surface"
    hi_headline = "भारतीय अंतरिक्ष अनुसंधान संगठन इसरो ने चंद्रयान मिशन प्रक्षेपित किया"

    with caplog.at_level(logging.INFO):
        with patch("backend.app.api.routes.search_web_evidence", return_value=[]):
            # 1. Valid 'en' hint
            res_en = client.post(
                "/api/verify",
                json={"input_type": "headline", "text": en_headline, "language_hint": "en"},
            )
            assert res_en.status_code == 200
            assert res_en.json()["detected_language"] == "en"

            # 2. Valid 'hi' hint
            res_hi = client.post(
                "/api/verify",
                json={"input_type": "headline", "text": hi_headline, "language_hint": "hi"},
            )
            assert res_hi.status_code == 200
            assert res_hi.json()["detected_language"] == "hi"

            # 3. Valid 'auto' hint (explicit and default)
            res_auto = client.post(
                "/api/verify",
                json={"input_type": "headline", "text": en_headline, "language_hint": "auto"},
            )
            assert res_auto.status_code == 200
            assert res_auto.json()["detected_language"] == "en"

            res_default = client.post(
                "/api/verify",
                json={"input_type": "headline", "text": en_headline},
            )
            assert res_default.status_code == 200
            assert res_default.json()["detected_language"] == "en"

            # 4. Arbitrary / malicious language_hint rejected before route logging with HTTP 422
            res_invalid = client.post(
                "/api/verify",
                json={"input_type": "headline", "text": en_headline, "language_hint": sentinel_hint},
            )
            assert res_invalid.status_code == 422
            assert res_invalid.json()["error_code"] == "VALIDATION_ERROR"

    assert sentinel_hint not in caplog.text
    assert sentinel_hint not in res_invalid.text
    assert "language_hint=en" in caplog.text
    assert "language_hint=hi" in caplog.text
    assert "language_hint=auto" in caplog.text

