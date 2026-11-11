"""Secure URL extraction service with comprehensive Server-Side Request Forgery (SSRF) protections.

Enforces strict scheme checks, hostname validation, DNS resolution validation, connection-level
DNS pinning, peer IP verification, and bounded manual redirect following to eliminate SSRF
vulnerabilities, redirect bypasses, and DNS rebinding / TOCTOU attacks.
"""

import ipaddress
import logging
import re
import socket
import urllib.parse
from html import unescape
from typing import Any, Dict, Iterable, List, Optional, Set, Tuple, Union

import httpcore
import httpx

logger = logging.getLogger(__name__)

# Maximum response size allowed to prevent DoS (2 MB)
MAX_RESPONSE_BYTES = 2 * 1024 * 1024
REQUEST_TIMEOUT_SECONDS = 8.0
MAX_REDIRECTS = 3

# User-Agent representing VeriNews news verification crawler
USER_AGENT = (
    "VeriNewsBot/1.0 (+https://github.com/mddanish-31/VeriNews; news verification MVP)"
)

# Well-Known RFC 6052 Prefix for IPv4/IPv6 translation (NAT64)
NAT64_PREFIX = ipaddress.IPv6Network("64:ff9b::/96")


class URLExtractionException(Exception):
    """Raised when a submitted news URL fails validation or content extraction."""

    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


def is_ip_address_safe(
    ip_val: Union[str, ipaddress.IPv4Address, ipaddress.IPv6Address],
) -> Tuple[bool, str]:
    """Verify whether an IP address is a safe, globally routable public address.

    Rejects private, loopback, link-local, multicast, unspecified, reserved,
    IPv4-mapped private, NAT64-embedded private, and 6to4-embedded private addresses.
    """
    if isinstance(ip_val, (ipaddress.IPv4Address, ipaddress.IPv6Address)):
        ip = ip_val
    else:
        try:
            ip = ipaddress.ip_address(ip_val)
        except ValueError:
            return False, f"Invalid IP address format: {ip_val}"

    ip_str = str(ip)

    if isinstance(ip, ipaddress.IPv6Address):
        # 1. IPv4-mapped IPv6 address (::ffff:0:0/96)
        if ip.ipv4_mapped:
            v4 = ip.ipv4_mapped
            if (
                not v4.is_global
                or v4.is_private
                or v4.is_loopback
                or v4.is_link_local
                or v4.is_reserved
                or v4.is_multicast
                or v4.is_unspecified
            ):
                return (
                    False,
                    f"Access to private or internal IPv4-mapped address ({ip_str}) is blocked for security.",
                )
            return True, ""

        # 2. RFC 6052 Well-Known Prefix for NAT64 (64:ff9b::/96)
        if ip in NAT64_PREFIX:
            embedded_v4 = ipaddress.IPv4Address(ip.packed[-4:])
            if (
                not embedded_v4.is_global
                or embedded_v4.is_private
                or embedded_v4.is_loopback
                or embedded_v4.is_link_local
                or embedded_v4.is_reserved
                or embedded_v4.is_multicast
                or embedded_v4.is_unspecified
            ):
                return (
                    False,
                    f"Access to private or internal NAT64 address ({ip_str}) is blocked for security.",
                )
            return True, ""

        # 3. 6to4 encapsulation prefix (2002::/16)
        if ip.sixtofour:
            v4 = ip.sixtofour
            if (
                not v4.is_global
                or v4.is_private
                or v4.is_loopback
                or v4.is_link_local
                or v4.is_reserved
                or v4.is_multicast
                or v4.is_unspecified
            ):
                return (
                    False,
                    f"Access to private or internal 6to4 address ({ip_str}) is blocked for security.",
                )
            return True, ""

    # Standard check for IPv4 and regular IPv6
    if (
        not ip.is_global
        or ip.is_private
        or ip.is_loopback
        or ip.is_link_local
        or ip.is_reserved
        or ip.is_multicast
        or ip.is_unspecified
    ):
        return (
            False,
            f"Access to private or internal network address ({ip_str}) is blocked for security.",
        )

    return True, ""


def validate_url_safety(url: str) -> Tuple[bool, str]:
    """Validate that the URL uses permitted schemes and resolves exclusively to public IP addresses.

    Returns:
        (is_safe, error_message)
    """
    if not url or not isinstance(url, str):
        return False, "URL must be a non-empty string."

    trimmed = url.strip()
    try:
        parsed = urllib.parse.urlparse(trimmed)
    except Exception as exc:
        return False, f"Invalid URL syntax: {exc}"

    # 1. Strict protocol whitelist
    scheme = parsed.scheme.lower()
    if scheme not in ("http", "https"):
        return (
            False,
            f"Unsupported protocol '{scheme}'. Only HTTP and HTTPS URLs are supported.",
        )

    # 2. Hostname validation
    hostname = parsed.hostname
    if not hostname:
        return False, "URL must contain a valid domain hostname."

    # Direct loopback / localhost keyword rejection
    lower_host = hostname.lower()
    if lower_host in ("localhost", "127.0.0.1", "0.0.0.0", "::1", "local"):
        return False, "Access to localhost or loopback destinations is strictly prohibited."

    # 3. DNS resolution & IP space verification (SSRF defense)
    clean_host = hostname.strip("[]")
    try:
        addr_info = socket.getaddrinfo(clean_host, None)
    except socket.gaierror:
        return False, f"The domain '{hostname}' could not be resolved. Please verify the URL or ensure the website is online."
    except Exception as exc:
        logger.warning("Host resolution failed for '%s': %s", hostname, exc)
        return False, f"Could not connect to '{hostname}'. Please check the URL syntax and network connectivity."

    if not addr_info:
        return False, f"The domain '{hostname}' could not be resolved. Please verify the URL."

    for item in addr_info:
        ip_str = item[4][0]
        is_safe, err_msg = is_ip_address_safe(ip_str)
        if not is_safe:
            return False, err_msg

    return True, ""


class SafeSSRFNetworkBackend(httpcore.SyncBackend):
    """Custom network backend that enforces strict DNS pinning and SSRF defense at socket connect time.

    Eliminates DNS rebinding and TOCTOU race conditions by:
    1. Performing DNS resolution directly inside connect_tcp.
    2. Validating every single resolved IP against SSRF rules (rejecting mixed public/private answers).
    3. Connecting directly to the validated IP address (pinning).
    4. Verifying that the connected socket's peer IP matches a validated public address.
    5. Preserving the original hostname for TLS SNI and server certificate validation in start_tls.
    """

    def connect_tcp(
        self,
        host: str,
        port: int,
        timeout: Optional[float] = None,
        local_address: Optional[str] = None,
        socket_options: Optional[Iterable[Any]] = None,
    ) -> httpcore.NetworkStream:
        clean_host = host.strip("[]")

        # 1. Resolve host with socket.getaddrinfo
        try:
            addr_info = socket.getaddrinfo(
                clean_host,
                port,
                family=socket.AF_UNSPEC,
                type=socket.SOCK_STREAM,
            )
        except socket.gaierror as exc:
            raise URLExtractionException(
                f"The domain '{clean_host}' could not be resolved. Please verify the URL or ensure the website is online.",
                status_code=502,
            ) from exc
        except Exception as exc:
            raise URLExtractionException(
                f"Could not resolve host '{clean_host}': {exc}",
                status_code=502,
            ) from exc

        if not addr_info:
            raise URLExtractionException(
                f"The domain '{clean_host}' could not be resolved.",
                status_code=502,
            )

        # 2. Validate EVERY returned IP to protect against mixed DNS answers
        safe_ips: List[str] = []
        for item in addr_info:
            ip_str = item[4][0]
            is_safe, err = is_ip_address_safe(ip_str)
            if not is_safe:
                raise URLExtractionException(
                    f"Access to address ({ip_str}) for host '{clean_host}' is blocked for security: {err}",
                    status_code=400,
                )
            safe_ips.append(ip_str)

        if not safe_ips:
            raise URLExtractionException(
                f"No safe public IP addresses available for host '{clean_host}'.",
                status_code=400,
            )

        # 3. Connect to validated safe IPs with dual-stack fallback support
        last_exc: Optional[Exception] = None
        for target_ip in safe_ips:
            try:
                stream = super().connect_tcp(
                    target_ip,
                    port,
                    timeout=timeout,
                    local_address=local_address,
                    socket_options=socket_options,
                )

                # 4. Verify connected peer IP (Strict Fail-Closed)
                peer_addr = stream.get_extra_info("server_addr")
                if not peer_addr or not isinstance(peer_addr, (tuple, list)) or len(peer_addr) < 1:
                    stream.close()
                    raise URLExtractionException(
                        f"Unable to verify socket peer address for host '{clean_host}'. Connection rejected for security.",
                        status_code=400,
                    )

                peer_ip = peer_addr[0]
                if not peer_ip or not isinstance(peer_ip, str):
                    stream.close()
                    raise URLExtractionException(
                        f"Malformed socket peer IP for host '{clean_host}'. Connection rejected for security.",
                        status_code=400,
                    )

                is_peer_safe, peer_err = is_ip_address_safe(peer_ip)
                if not is_peer_safe:
                    stream.close()
                    raise URLExtractionException(
                        f"Connected peer IP ({peer_ip}) is not a permitted public address: {peer_err}",
                        status_code=400,
                    )

                if peer_ip not in safe_ips:
                    stream.close()
                    raise URLExtractionException(
                        f"Connected peer IP ({peer_ip}) does not match any validated IP for host '{clean_host}'.",
                        status_code=400,
                    )

                return stream
            except URLExtractionException:
                raise
            except Exception as exc:
                last_exc = exc
                continue

        if last_exc:
            raise last_exc

        raise URLExtractionException(
            f"Failed to connect to any resolved IP address for '{clean_host}'.",
            status_code=502,
        )


def extract_headline_and_body(html: str) -> Tuple[str, str]:
    """Extract page title/headline and article body text from raw HTML using standard library regex."""
    # 1. Strip comments, script, style, header, nav, footer tags
    cleaned = re.sub(r"<!--.*?-->", " ", html, flags=re.DOTALL)
    cleaned = re.sub(
        r"<(script|style|nav|header|footer|aside|noscript|svg)[^>]*>.*?</\1>",
        " ",
        cleaned,
        flags=re.DOTALL | re.IGNORECASE,
    )

    # 2. Extract headline candidate: OpenGraph title -> <title> -> <h1>
    headline = ""
    og_title_match = re.search(
        r'<meta[^>]*property=["\']og:title["\'][^>]*content=["\']([^"\']+)["\']',
        cleaned,
        re.IGNORECASE,
    )
    if og_title_match:
        headline = unescape(og_title_match.group(1)).strip()

    if not headline:
        title_match = re.search(r"<title[^>]*>(.*?)</title>", cleaned, re.IGNORECASE | re.DOTALL)
        if title_match:
            headline = unescape(re.sub(r"<[^>]+>", "", title_match.group(1))).strip()

    if not headline:
        h1_match = re.search(r"<h1[^>]*>(.*?)</h1>", cleaned, re.IGNORECASE | re.DOTALL)
        if h1_match:
            headline = unescape(re.sub(r"<[^>]+>", "", h1_match.group(1))).strip()

    # Clean up trailing site suffixes (e.g., "Headline - News Site Name")
    if " - " in headline:
        headline = headline.split(" - ")[0].strip()
    elif " | " in headline:
        headline = headline.split(" | ")[0].strip()

    # 3. Extract article body paragraphs
    article_match = re.search(r"<article[^>]*>(.*?)</article>", cleaned, re.DOTALL | re.IGNORECASE)
    search_space = article_match.group(1) if article_match else cleaned

    p_tags = re.findall(r"<p[^>]*>(.*?)</p>", search_space, re.DOTALL | re.IGNORECASE)
    paragraphs = []
    for p in p_tags:
        text = unescape(re.sub(r"<[^>]+>", "", p)).strip()
        # Filter out short disclaimers, cookie notices, share prompts
        if len(text) > 30 and not any(
            skip in text.lower()
            for skip in ("cookie", "subscribe", "newsletter", "sign in", "all rights reserved")
        ):
            paragraphs.append(text)

    body_text = "\n\n".join(paragraphs).strip()

    # If body text could not be extracted from paragraphs, fallback to cleaned general text
    if not body_text:
        raw_text = unescape(re.sub(r"<[^>]+>", " ", search_space))
        lines = [line.strip() for line in raw_text.splitlines() if len(line.strip()) > 35]
        body_text = "\n\n".join(lines[:15]).strip()

    return headline, body_text


def fetch_news_url(url: str) -> Dict[str, str]:
    """Fetch article content from a news URL with SSRF protection and readable text extraction.

    Enforces:
    - Pre-flight URL and DNS safety validation.
    - Connection-level DNS pinning and peer-IP verification via SafeSSRFNetworkBackend.
    - Bounded manual redirect loop (max 3 redirects) with per-hop destination validation.
    - Protection against redirect cycles, SSRF hops, and DNS rebinding.

    Returns:
        dict with keys: 'url', 'headline', 'article_text', 'domain'
    Raises:
        URLExtractionException if URL is unsafe, unreachable, or unreadable.
    """
    is_safe, error_msg = validate_url_safety(url)
    if not is_safe:
        raise URLExtractionException(message=error_msg, status_code=400)

    current_url = url
    visited_urls: Set[str] = {current_url}
    redirect_count = 0

    parsed_initial = urllib.parse.urlparse(url)
    domain = parsed_initial.netloc
    if domain.startswith("www."):
        domain = domain[4:]

    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,hi;q=0.8",
    }

    transport = httpx.HTTPTransport()
    transport._pool._network_backend = SafeSSRFNetworkBackend()

    try:
        with httpx.Client(
            transport=transport,
            timeout=REQUEST_TIMEOUT_SECONDS,
            follow_redirects=False,
        ) as client:
            while True:
                parsed_cur = urllib.parse.urlparse(current_url)
                cur_domain = parsed_cur.netloc
                if cur_domain.startswith("www."):
                    cur_domain = cur_domain[4:]
                domain = cur_domain or domain

                resp = client.get(current_url, headers=headers)

                # Bounded manual redirect loop (Finding A)
                if resp.status_code in (301, 302, 303, 307, 308):
                    redirect_count += 1
                    if redirect_count > MAX_REDIRECTS:
                        raise URLExtractionException(
                            message=f"Too many redirects (maximum {MAX_REDIRECTS} allowed).",
                            status_code=400,
                        )

                    location = resp.headers.get("Location")
                    if not location:
                        raise URLExtractionException(
                            message=f"Redirect response from {domain} missing Location header.",
                            status_code=502,
                        )

                    next_url = urllib.parse.urljoin(current_url, location)

                    # Cycle detection
                    if next_url in visited_urls:
                        raise URLExtractionException(
                            message=f"Redirect loop detected: '{next_url}' was visited more than once.",
                            status_code=400,
                        )

                    # Validate every redirect destination before following
                    is_hop_safe, hop_err = validate_url_safety(next_url)
                    if not is_hop_safe:
                        raise URLExtractionException(
                            message=f"Redirect destination is restricted for security: {hop_err}",
                            status_code=400,
                        )

                    visited_urls.add(next_url)
                    current_url = next_url
                    continue

                resp.raise_for_status()

                # Check content length
                if len(resp.content) > MAX_RESPONSE_BYTES:
                    raise URLExtractionException(
                        message="Webpage content exceeds the 2 MB maximum size limit.",
                        status_code=413,
                    )

                html_content = resp.text
                break

    except URLExtractionException:
        raise
    except httpx.ConnectTimeout:
        raise URLExtractionException(
            message=f"Connection timed out while attempting to reach {domain}. The news site may be offline, slow, or blocking automated requests.",
            status_code=504,
        )
    except httpx.TimeoutException:
        raise URLExtractionException(
            message=f"Request to {domain} timed out. The news website took too long to respond.",
            status_code=504,
        )
    except (httpx.ConnectError, httpx.NetworkError):
        raise URLExtractionException(
            message=f"Could not establish a connection to {domain}. The website may be unreachable or offline. Please verify the URL.",
            status_code=502,
        )
    except httpx.HTTPStatusError as exc:
        code = exc.response.status_code
        if code in (401, 403):
            raise URLExtractionException(
                message=f"Access denied ({code}) by {domain}. The article may be behind a subscription paywall or require a login.",
                status_code=403,
            )
        elif code == 404:
            raise URLExtractionException(
                message=f"The requested article was not found on {domain} (HTTP 404). Please verify the link.",
                status_code=404,
            )
        else:
            raise URLExtractionException(
                message=f"The remote server at {domain} returned an error (HTTP {code}).",
                status_code=502,
            )
    except Exception as exc:
        logger.warning("Error fetching URL '%s': %s", url, exc)
        raise URLExtractionException(
            message=f"Could not connect to {domain}. Please verify the URL or paste the headline/text directly.",
            status_code=502,
        )

    headline, body_text = extract_headline_and_body(html_content)

    if not headline and not body_text:
        raise URLExtractionException(
            message=(
                f"Could not extract readable news content from {domain}. "
                "The page may rely on client-side JavaScript rendering (SPA) or anti-scraping protections. "
                "Please copy and paste the headline or article text directly into the analyzer."
            ),
            status_code=422,
        )

    effective_headline = headline or (body_text[:120] + "...")
    return {
        "url": current_url,
        "headline": effective_headline,
        "article_text": body_text,
        "domain": domain,
    }
