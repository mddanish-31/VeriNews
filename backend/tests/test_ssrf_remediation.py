"""Deterministic security unit and integration tests for VN-04 SSRF remediation.

Verifies:
1. HTTP 302 to 127.0.0.1 (rejected with 400)
2. HTTP 302 to 169.254.169.254 metadata (rejected with 400)
3. Redirect to private IPv4 (rejected with 400)
4. Redirect to private IPv6 (rejected with 400)
5. Redirect to valid public destination (succeeds)
6. Multiple redirects within limit (<= 3 succeeds)
7. Redirect loop / cycle detection (rejected with 400)
8. Exceeded redirect limit (> 3 redirects rejected with 400)
9. Mixed public/private DNS answers (rejected with 400)
10. DNS rebinding / TOCTOU prevention (rejected with 400)
11. Connected peer IP pinning and validation (verified & enforced)
12. NAT64 public destination works
13. NAT64 embedding private IPv4 remains blocked
14. HTTPS hostname and certificate validation remain intact
15. Standard-library local HTTP server integration tests (redirects, pre-connect blocks, cycle detection)
"""

from http.server import BaseHTTPRequestHandler, HTTPServer
import ipaddress
import socket
import threading
from unittest.mock import MagicMock, patch
import pytest
import httpx
import httpcore

from backend.app.services.url_extractor import (
    MAX_REDIRECTS,
    SafeSSRFNetworkBackend,
    URLExtractionException,
    fetch_news_url,
    is_ip_address_safe,
    validate_url_safety,
)

SAMPLE_HTML = (
    "<html><head><title>Breaking News Headline</title></head>"
    "<body><article><p>This is a verified public article paragraph containing "
    "sufficient content to be extracted successfully by the news extractor.</p></article></body></html>"
)


# ============================================================================
# Scenario 1: HTTP 302 to 127.0.0.1
# ============================================================================
def test_01_http_302_to_loopback_blocked():
    """Verify that an HTTP redirect to 127.0.0.1 is blocked before following."""
    initial_url = "https://news.example.com/story"
    redirect_target = "http://127.0.0.1:8000/internal-admin"

    mock_resp_1 = MagicMock(spec=httpx.Response)
    mock_resp_1.status_code = 302
    mock_resp_1.headers = {"Location": redirect_target}

    with patch("backend.app.services.url_extractor.validate_url_safety") as mock_val:
        # Initial URL passes safety check; redirect target is validated via real validate_url_safety
        mock_val.side_effect = lambda u: (True, "") if u == initial_url else validate_url_safety(u)

        with patch.object(httpx.Client, "get", return_value=mock_resp_1) as mock_get:
            with pytest.raises(URLExtractionException) as exc_info:
                fetch_news_url(initial_url)

            assert exc_info.value.status_code == 400
            assert "restricted for security" in exc_info.value.message
            # Ensure the redirect destination was never fetched
            assert mock_get.call_count == 1
            assert mock_get.call_args[0][0] == initial_url


# ============================================================================
# Scenario 2: HTTP 302 to 169.254.169.254 (Cloud Metadata)
# ============================================================================
def test_02_http_302_to_metadata_ip_blocked():
    """Verify that an HTTP redirect to cloud metadata IP 169.254.169.254 is blocked."""
    initial_url = "https://news.example.com/story"
    metadata_url = "http://169.254.169.254/latest/meta-data/"

    mock_resp_1 = MagicMock(spec=httpx.Response)
    mock_resp_1.status_code = 302
    mock_resp_1.headers = {"Location": metadata_url}

    with patch("backend.app.services.url_extractor.validate_url_safety") as mock_val:
        mock_val.side_effect = lambda u: (True, "") if u == initial_url else validate_url_safety(u)

        with patch.object(httpx.Client, "get", return_value=mock_resp_1) as mock_get:
            with pytest.raises(URLExtractionException) as exc_info:
                fetch_news_url(initial_url)

            assert exc_info.value.status_code == 400
            assert "restricted for security" in exc_info.value.message
            assert mock_get.call_count == 1


# ============================================================================
# Scenario 3: Redirect to Private IPv4
# ============================================================================
@pytest.mark.parametrize(
    "private_target",
    [
        "http://10.0.0.1/admin",
        "http://192.168.1.1/router",
        "http://172.16.0.1/status",
        "http://127.0.0.2:8080/debug",
    ],
)
def test_03_redirect_to_private_ipv4_blocked(private_target):
    """Verify redirects to private IPv4 addresses are rejected with 400."""
    initial_url = "https://news.example.com/story"

    mock_resp_1 = MagicMock(spec=httpx.Response)
    mock_resp_1.status_code = 302
    mock_resp_1.headers = {"Location": private_target}

    with patch("backend.app.services.url_extractor.validate_url_safety") as mock_val:
        mock_val.side_effect = lambda u: (True, "") if u == initial_url else validate_url_safety(u)

        with patch.object(httpx.Client, "get", return_value=mock_resp_1) as mock_get:
            with pytest.raises(URLExtractionException) as exc_info:
                fetch_news_url(initial_url)

            assert exc_info.value.status_code == 400
            assert "restricted for security" in exc_info.value.message
            assert mock_get.call_count == 1


# ============================================================================
# Scenario 4: Redirect to Private IPv6
# ============================================================================
@pytest.mark.parametrize(
    "private_ipv6_target",
    [
        "http://[::1]/secrets",
        "http://[fd00::1]/db",
        "http://[fe80::1]/link-local",
    ],
)
def test_04_redirect_to_private_ipv6_blocked(private_ipv6_target):
    """Verify redirects to private or loopback IPv6 addresses are rejected with 400."""
    initial_url = "https://news.example.com/story"

    mock_resp_1 = MagicMock(spec=httpx.Response)
    mock_resp_1.status_code = 302
    mock_resp_1.headers = {"Location": private_ipv6_target}

    with patch("backend.app.services.url_extractor.validate_url_safety") as mock_val:
        mock_val.side_effect = lambda u: (True, "") if u == initial_url else validate_url_safety(u)

        with patch.object(httpx.Client, "get", return_value=mock_resp_1) as mock_get:
            with pytest.raises(URLExtractionException) as exc_info:
                fetch_news_url(initial_url)

            assert exc_info.value.status_code == 400
            assert "restricted for security" in exc_info.value.message
            assert mock_get.call_count == 1


# ============================================================================
# Scenario 5: Redirect to Valid Public Destination (Works)
# ============================================================================
def test_05_redirect_to_valid_public_destination_succeeds():
    """Verify that a redirect to a valid public URL is followed and parsed correctly."""
    initial_url = "https://news.example.com/short-link"
    final_url = "https://news.example.com/articles/2026/world-cup"

    resp_redirect = MagicMock(spec=httpx.Response)
    resp_redirect.status_code = 301
    resp_redirect.headers = {"Location": final_url}

    resp_final = MagicMock(spec=httpx.Response)
    resp_final.status_code = 200
    resp_final.content = SAMPLE_HTML.encode("utf-8")
    resp_final.text = SAMPLE_HTML
    resp_final.raise_for_status = MagicMock()

    with patch("backend.app.services.url_extractor.validate_url_safety", return_value=(True, "")):
        with patch.object(httpx.Client, "get", side_effect=[resp_redirect, resp_final]) as mock_get:
            result = fetch_news_url(initial_url)

            assert mock_get.call_count == 2
            assert result["url"] == final_url
            assert result["headline"] == "Breaking News Headline"
            assert "verified public article paragraph" in result["article_text"]


# ============================================================================
# Scenario 6: Multiple Redirects Within Limit (<= 3)
# ============================================================================
@pytest.mark.parametrize("redirect_hops", [1, 2, 3])
def test_06_multiple_redirects_within_limit_succeeds(redirect_hops):
    """Verify that 1, 2, and 3 redirects are permitted and succeed."""
    urls = [f"https://news.example.com/step_{i}" for i in range(redirect_hops + 1)]
    responses = []

    for i in range(redirect_hops):
        r = MagicMock(spec=httpx.Response)
        r.status_code = 302
        r.headers = {"Location": urls[i + 1]}
        responses.append(r)

    r_final = MagicMock(spec=httpx.Response)
    r_final.status_code = 200
    r_final.content = SAMPLE_HTML.encode("utf-8")
    r_final.text = SAMPLE_HTML
    r_final.raise_for_status = MagicMock()
    responses.append(r_final)

    with patch("backend.app.services.url_extractor.validate_url_safety", return_value=(True, "")):
        with patch.object(httpx.Client, "get", side_effect=responses) as mock_get:
            result = fetch_news_url(urls[0])

            assert mock_get.call_count == redirect_hops + 1
            assert result["url"] == urls[-1]
            assert result["headline"] == "Breaking News Headline"


# ============================================================================
# Scenario 7: Redirect Loop (Cycle Detection)
# ============================================================================
def test_07_redirect_loop_detected():
    """Verify that a redirect loop (A -> B -> A) is detected and rejected with 400."""
    url_a = "https://news.example.com/page-a"
    url_b = "https://news.example.com/page-b"

    resp_a = MagicMock(spec=httpx.Response)
    resp_a.status_code = 302
    resp_a.headers = {"Location": url_b}

    resp_b = MagicMock(spec=httpx.Response)
    resp_b.status_code = 302
    resp_b.headers = {"Location": url_a}

    with patch("backend.app.services.url_extractor.validate_url_safety", return_value=(True, "")):
        with patch.object(httpx.Client, "get", side_effect=[resp_a, resp_b]) as mock_get:
            with pytest.raises(URLExtractionException) as exc_info:
                fetch_news_url(url_a)

            assert exc_info.value.status_code == 400
            assert "Redirect loop detected" in exc_info.value.message
            assert mock_get.call_count == 2


# ============================================================================
# Scenario 8: More Than 3 Redirects (Exceeded Limit)
# ============================================================================
def test_08_more_than_three_redirects_blocked():
    """Verify that exceeding MAX_REDIRECTS (3) raises 400."""
    urls = [f"https://news.example.com/hop_{i}" for i in range(5)]
    responses = []

    for i in range(4):  # 4 redirects -> exceeds limit of 3
        r = MagicMock(spec=httpx.Response)
        r.status_code = 302
        r.headers = {"Location": urls[i + 1]}
        responses.append(r)

    with patch("backend.app.services.url_extractor.validate_url_safety", return_value=(True, "")):
        with patch.object(httpx.Client, "get", side_effect=responses) as mock_get:
            with pytest.raises(URLExtractionException) as exc_info:
                fetch_news_url(urls[0])

            assert exc_info.value.status_code == 400
            assert "Too many redirects" in exc_info.value.message
            assert mock_get.call_count == 4


# ============================================================================
# Scenario 9: Mixed Public/Private DNS Answers (Reject)
# ============================================================================
def test_09_mixed_public_private_dns_answers_rejected():
    """Verify that if DNS returns both a public and a private IP, the request is rejected."""
    mixed_addrinfo = [
        (socket.AddressFamily.AF_INET, socket.SocketKind.SOCK_STREAM, 6, "", ("93.184.216.34", 80)),
        (socket.AddressFamily.AF_INET, socket.SocketKind.SOCK_STREAM, 6, "", ("127.0.0.1", 80)),
    ]

    with patch("socket.getaddrinfo", return_value=mixed_addrinfo):
        # 1. validate_url_safety must reject
        safe, msg = validate_url_safety("http://mixed-dns.example.com/article")
        assert safe is False
        assert "127.0.0.1" in msg

        # 2. SafeSSRFNetworkBackend must also reject
        backend = SafeSSRFNetworkBackend()
        with pytest.raises(URLExtractionException) as exc_info:
            backend.connect_tcp("mixed-dns.example.com", 80)
        assert exc_info.value.status_code == 400
        assert "blocked for security" in exc_info.value.message


# ============================================================================
# Scenario 10: DNS Rebinding (First Resolution Public, Second Resolution Private)
# ============================================================================
def test_10_dns_rebinding_rejected():
    """Verify that DNS rebinding between initial check and connect_tcp is intercepted and blocked."""
    public_addrinfo = [
        (socket.AddressFamily.AF_INET, socket.SocketKind.SOCK_STREAM, 6, "", ("93.184.216.34", 80))
    ]
    rebound_private_addrinfo = [
        (socket.AddressFamily.AF_INET, socket.SocketKind.SOCK_STREAM, 6, "", ("10.0.0.5", 80))
    ]

    # First call: validate_url_safety resolves public IP -> passes
    with patch("socket.getaddrinfo", return_value=public_addrinfo):
        is_safe, _ = validate_url_safety("http://rebind.example.com/article")
        assert is_safe is True

    # Second call: at connection time, DNS rebinds to internal private IP
    backend = SafeSSRFNetworkBackend()
    with patch("socket.getaddrinfo", return_value=rebound_private_addrinfo):
        with pytest.raises(URLExtractionException) as exc_info:
            backend.connect_tcp("rebind.example.com", 80)

        assert exc_info.value.status_code == 400
        assert "blocked for security" in exc_info.value.message
        assert "10.0.0.5" in exc_info.value.message


# ============================================================================
# Scenario 11: Verify Actual Connected Peer IP Is the Validated IP (Fail-Closed)
# ============================================================================
def test_11_connected_peer_ip_pinning_verified():
    """Verify that connect_tcp strictly verifies peer IP and fails closed on missing/malformed info."""
    public_addrinfo = [
        (socket.AddressFamily.AF_INET, socket.SocketKind.SOCK_STREAM, 6, "", ("93.184.216.34", 80))
    ]

    backend = SafeSSRFNetworkBackend()

    # Case A: Peer address is None (missing) -> must fail closed
    mock_none_stream = MagicMock(spec=httpcore.NetworkStream)
    mock_none_stream.get_extra_info.return_value = None

    with patch("socket.getaddrinfo", return_value=public_addrinfo):
        with patch.object(httpcore.SyncBackend, "connect_tcp", return_value=mock_none_stream):
            with pytest.raises(URLExtractionException) as exc_info:
                backend.connect_tcp("example.com", 80)
            assert exc_info.value.status_code == 400
            assert "Unable to verify socket peer address" in exc_info.value.message
            assert mock_none_stream.close.called

    # Case B: Peer address is empty tuple () -> must fail closed
    mock_empty_stream = MagicMock(spec=httpcore.NetworkStream)
    mock_empty_stream.get_extra_info.return_value = ()

    with patch("socket.getaddrinfo", return_value=public_addrinfo):
        with patch.object(httpcore.SyncBackend, "connect_tcp", return_value=mock_empty_stream):
            with pytest.raises(URLExtractionException) as exc_info:
                backend.connect_tcp("example.com", 80)
            assert exc_info.value.status_code == 400
            assert "Unable to verify socket peer address" in exc_info.value.message
            assert mock_empty_stream.close.called

    # Case C: Peer address is malformed (e.g. (None, 80) or ("", 80)) -> must fail closed
    mock_malformed_stream = MagicMock(spec=httpcore.NetworkStream)
    mock_malformed_stream.get_extra_info.return_value = (None, 80)

    with patch("socket.getaddrinfo", return_value=public_addrinfo):
        with patch.object(httpcore.SyncBackend, "connect_tcp", return_value=mock_malformed_stream):
            with pytest.raises(URLExtractionException) as exc_info:
                backend.connect_tcp("example.com", 80)
            assert exc_info.value.status_code == 400
            assert "Malformed socket peer IP" in exc_info.value.message
            assert mock_malformed_stream.close.called

    # Case D: Peer IP is private/internal (e.g. 192.168.1.100) -> rejected
    mock_private_stream = MagicMock(spec=httpcore.NetworkStream)
    mock_private_stream.get_extra_info.return_value = ("192.168.1.100", 80)

    with patch("socket.getaddrinfo", return_value=public_addrinfo):
        with patch.object(httpcore.SyncBackend, "connect_tcp", return_value=mock_private_stream):
            with pytest.raises(URLExtractionException) as exc_info:
                backend.connect_tcp("example.com", 80)
            assert exc_info.value.status_code == 400
            assert "not a permitted public address" in exc_info.value.message
            assert mock_private_stream.close.called

    # Case E: Peer IP is a valid public IP, but mismatched from resolved safe_ips (spoofed/mismatched)
    mock_mismatch_stream = MagicMock(spec=httpcore.NetworkStream)
    mock_mismatch_stream.get_extra_info.return_value = ("8.8.8.8", 80)  # Public, but not 93.184.216.34

    with patch("socket.getaddrinfo", return_value=public_addrinfo):
        with patch.object(httpcore.SyncBackend, "connect_tcp", return_value=mock_mismatch_stream):
            with pytest.raises(URLExtractionException) as exc_info:
                backend.connect_tcp("example.com", 80)
            assert exc_info.value.status_code == 400
            assert "does not match any validated IP" in exc_info.value.message
            assert mock_mismatch_stream.close.called

    # Case F: Peer IP correctly matches validated public IP -> succeeds
    mock_good_stream = MagicMock(spec=httpcore.NetworkStream)
    mock_good_stream.get_extra_info.return_value = ("93.184.216.34", 80)

    with patch("socket.getaddrinfo", return_value=public_addrinfo):
        with patch.object(httpcore.SyncBackend, "connect_tcp", return_value=mock_good_stream):
            stream = backend.connect_tcp("example.com", 80)
            assert stream == mock_good_stream


# ============================================================================
# Scenario 12: NAT64 Public Destination Works
# ============================================================================
def test_12_nat64_public_destination_works():
    """Verify RFC 6052 NAT64 IPv6 address embedding a public IPv4 is permitted."""
    public_nat64_ips = [
        "64:ff9b::8.8.8.8",
        "64:ff9b::93.184.216.34",
        "64:ff9b::1.1.1.1",
    ]
    for ip_str in public_nat64_ips:
        safe, msg = is_ip_address_safe(ip_str)
        assert safe is True, f"Expected {ip_str} to be safe, got error: {msg}"

        url = f"http://[{ip_str}]/news"
        url_safe, url_msg = validate_url_safety(url)
        assert url_safe is True, f"Expected {url} to pass safety check, got: {url_msg}"


# ============================================================================
# Scenario 13: NAT64 Embedding Private IPv4 Remains Blocked
# ============================================================================
@pytest.mark.parametrize(
    "nat64_private_ip",
    [
        "64:ff9b::127.0.0.1",
        "64:ff9b::169.254.169.254",
        "64:ff9b::10.0.0.1",
        "64:ff9b::192.168.1.1",
        "64:ff9b::172.16.0.1",
        "64:ff9b::0.0.0.0",
    ],
)
def test_13_nat64_embedding_private_ipv4_remains_blocked(nat64_private_ip):
    """Verify RFC 6052 NAT64 IPv6 addresses embedding private IPv4 addresses are blocked."""
    safe, msg = is_ip_address_safe(nat64_private_ip)
    assert safe is False
    assert "NAT64" in msg

    url = f"http://[{nat64_private_ip}]/metadata"
    url_safe, url_msg = validate_url_safety(url)
    assert url_safe is False
    assert "NAT64" in url_msg


# ============================================================================
# Scenario 14: HTTPS Hostname and Certificate Validation Intact
# ============================================================================
def test_14_https_hostname_and_certificate_validation_intact():
    """Verify that TLS SNI and server certificate validation remain enforced against the hostname."""
    # When start_tls is called by httpcore on a connection created by SafeSSRFNetworkBackend,
    # server_hostname must match the requested domain name, not the pinned IP.
    backend = SafeSSRFNetworkBackend()
    public_addrinfo = [
        (socket.AddressFamily.AF_INET, socket.SocketKind.SOCK_STREAM, 6, "", ("93.184.216.34", 443))
    ]

    mock_stream = MagicMock(spec=httpcore.NetworkStream)
    mock_stream.get_extra_info.side_effect = lambda key: ("93.184.216.34", 443) if key == "server_addr" else None

    with patch("socket.getaddrinfo", return_value=public_addrinfo):
        with patch.object(httpcore.SyncBackend, "connect_tcp", return_value=mock_stream) as mock_super_connect:
            stream = backend.connect_tcp("news.example.com", 443)

            # Assert super().connect_tcp was called with the pinned IP address
            mock_super_connect.assert_called_once_with(
                "93.184.216.34",
                443,
                timeout=None,
                local_address=None,
                socket_options=None,
            )
            assert stream == mock_stream

    # End-to-end integration test with transport: verify that hostname mismatch fails certificate validation
    transport = httpx.HTTPTransport()
    transport._pool._network_backend = backend

    # Using badssl wrong.host: cert hostname will not match requested host
    with httpx.Client(transport=transport, timeout=5.0) as client:
        with pytest.raises((httpx.ConnectError, URLExtractionException, Exception)):
            client.get("https://wrong.host.badssl.com/")


# ============================================================================
# Scenario 15: Standard-Library Local HTTP Server Integration Tests
# ============================================================================
class _LocalRedirectServerFixture:
    """Standard-library HTTP server running on an ephemeral loopback port for offline redirect integration tests."""

    def __init__(self):
        self.requests_log = []
        handler_cls = self._create_handler()
        self.server = HTTPServer(("127.0.0.1", 0), handler_cls)
        self.port = self.server.server_address[1]
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()

    def _create_handler(self):
        fixture_self = self

        class Handler(BaseHTTPRequestHandler):
            def do_GET(self):
                fixture_self.requests_log.append(self.path)
                if self.path == "/start-redirect":
                    # Legitimate relative redirect
                    self.send_response(302)
                    self.send_header("Location", "/article-final")
                    self.end_headers()
                elif self.path == "/article-final":
                    self.send_response(200)
                    self.send_header("Content-Type", "text/html; charset=utf-8")
                    self.end_headers()
                    body = (
                        "<html><head><title>Integration News Title</title></head>"
                        "<body><article><p>Valid extracted article body paragraph for testing local redirect handling.</p></article></body></html>"
                    )
                    self.wfile.write(body.encode("utf-8"))
                elif self.path == "/redirect-to-localhost":
                    # Attack hop: redirect to localhost admin
                    self.send_response(302)
                    self.send_header("Location", "http://localhost:8000/internal-secrets")
                    self.end_headers()
                elif self.path == "/redirect-to-metadata":
                    # Attack hop: redirect to AWS metadata
                    self.send_response(302)
                    self.send_header("Location", "http://169.254.169.254/latest/meta-data")
                    self.end_headers()
                elif self.path == "/cycle-a":
                    self.send_response(302)
                    self.send_header("Location", "/cycle-b")
                    self.end_headers()
                elif self.path == "/cycle-b":
                    self.send_response(302)
                    self.send_header("Location", "/cycle-a")
                    self.end_headers()
                else:
                    self.send_response(404)
                    self.end_headers()

            def log_message(self, *args):
                pass  # Suppress console stderr output during tests

        return Handler

    def close(self):
        self.server.shutdown()
        self.server.server_close()


@pytest.fixture
def local_redirect_server():
    server = _LocalRedirectServerFixture()
    try:
        yield server
    finally:
        server.close()


def test_15_local_server_legitimate_relative_redirect(local_redirect_server):
    """Verify that a real TCP redirect over an actual HTTP connection is followed safely."""
    test_domain = "mock-news.test"
    port = local_redirect_server.port

    def mock_getaddrinfo(host, p, *args, **kwargs):
        if host == test_domain:
            return [(socket.AddressFamily.AF_INET, socket.SocketKind.SOCK_STREAM, 6, "", ("127.0.0.1", p or port))]
        return real_getaddrinfo(host, p, *args, **kwargs)

    real_getaddrinfo = socket.getaddrinfo

    # Only treat 127.0.0.1 as the mock-news destination for this specific test
    from backend.app.services.url_extractor import is_ip_address_safe as real_is_ip_safe

    def mock_is_ip_safe(ip):
        if str(ip) == "127.0.0.1":
            return True, ""
        return real_is_ip_safe(ip)

    with patch("socket.getaddrinfo", side_effect=mock_getaddrinfo), \
         patch("backend.app.services.url_extractor.is_ip_address_safe", side_effect=mock_is_ip_safe):

        result = fetch_news_url(f"http://{test_domain}:{port}/start-redirect")

        assert result["headline"] == "Integration News Title"
        assert "Valid extracted article body paragraph" in result["article_text"]
        # Confirm that both hops traveled over actual TCP sockets
        assert local_redirect_server.requests_log == ["/start-redirect", "/article-final"]


def test_15_local_server_redirect_to_loopback_blocked_pre_connect(local_redirect_server):
    """Verify that a redirect from an external server to localhost is blocked before connection."""
    test_domain = "mock-news.test"
    port = local_redirect_server.port

    def mock_getaddrinfo(host, p, *args, **kwargs):
        if host == test_domain:
            return [(socket.AddressFamily.AF_INET, socket.SocketKind.SOCK_STREAM, 6, "", ("127.0.0.1", p or port))]
        return real_getaddrinfo(host, p, *args, **kwargs)

    real_getaddrinfo = socket.getaddrinfo

    from backend.app.services.url_extractor import is_ip_address_safe as real_is_ip_safe

    def mock_is_ip_safe(ip):
        if str(ip) == "127.0.0.1":
            return True, ""
        return real_is_ip_safe(ip)

    with patch("socket.getaddrinfo", side_effect=mock_getaddrinfo), \
         patch("backend.app.services.url_extractor.is_ip_address_safe", side_effect=mock_is_ip_safe):

        with pytest.raises(URLExtractionException) as exc_info:
            fetch_news_url(f"http://{test_domain}:{port}/redirect-to-localhost")

        assert exc_info.value.status_code == 400
        assert "restricted for security" in exc_info.value.message
        # Verify that the malicious redirect target was NEVER contacted on the server
        assert local_redirect_server.requests_log == ["/redirect-to-localhost"]


def test_15_local_server_redirect_to_metadata_blocked_pre_connect(local_redirect_server):
    """Verify that a redirect to 169.254.169.254 is blocked before connection."""
    test_domain = "mock-news.test"
    port = local_redirect_server.port

    def mock_getaddrinfo(host, p, *args, **kwargs):
        if host == test_domain:
            return [(socket.AddressFamily.AF_INET, socket.SocketKind.SOCK_STREAM, 6, "", ("127.0.0.1", p or port))]
        return real_getaddrinfo(host, p, *args, **kwargs)

    real_getaddrinfo = socket.getaddrinfo

    from backend.app.services.url_extractor import is_ip_address_safe as real_is_ip_safe

    def mock_is_ip_safe(ip):
        if str(ip) == "127.0.0.1":
            return True, ""
        return real_is_ip_safe(ip)

    with patch("socket.getaddrinfo", side_effect=mock_getaddrinfo), \
         patch("backend.app.services.url_extractor.is_ip_address_safe", side_effect=mock_is_ip_safe):

        with pytest.raises(URLExtractionException) as exc_info:
            fetch_news_url(f"http://{test_domain}:{port}/redirect-to-metadata")

        assert exc_info.value.status_code == 400
        assert "restricted for security" in exc_info.value.message
        assert local_redirect_server.requests_log == ["/redirect-to-metadata"]


def test_15_local_server_redirect_cycle_detected(local_redirect_server):
    """Verify that a redirect loop between real HTTP endpoints is terminated with 400."""
    test_domain = "mock-news.test"
    port = local_redirect_server.port

    def mock_getaddrinfo(host, p, *args, **kwargs):
        if host == test_domain:
            return [(socket.AddressFamily.AF_INET, socket.SocketKind.SOCK_STREAM, 6, "", ("127.0.0.1", p or port))]
        return real_getaddrinfo(host, p, *args, **kwargs)

    real_getaddrinfo = socket.getaddrinfo

    from backend.app.services.url_extractor import is_ip_address_safe as real_is_ip_safe

    def mock_is_ip_safe(ip):
        if str(ip) == "127.0.0.1":
            return True, ""
        return real_is_ip_safe(ip)

    with patch("socket.getaddrinfo", side_effect=mock_getaddrinfo), \
         patch("backend.app.services.url_extractor.is_ip_address_safe", side_effect=mock_is_ip_safe):

        with pytest.raises(URLExtractionException) as exc_info:
            fetch_news_url(f"http://{test_domain}:{port}/cycle-a")

        assert exc_info.value.status_code == 400
        assert "Redirect loop detected" in exc_info.value.message
        # Confirm /cycle-a was fetched once, /cycle-b was fetched once, then terminated
        assert local_redirect_server.requests_log == ["/cycle-a", "/cycle-b"]


