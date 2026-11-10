"""Secure URL extraction service with comprehensive Server-Side Request Forgery (SSRF) protections.

Enforces strict scheme checks, hostname validation, and DNS resolution validation
to ensure requests never reach localhost, loopback, private, link-local, or reserved network destinations.
"""

import ipaddress
import logging
import re
import socket
import urllib.parse
from html import unescape
from typing import Dict, Optional, Tuple
import httpx

logger = logging.getLogger(__name__)

# Maximum response size allowed to prevent DoS (2 MB)
MAX_RESPONSE_BYTES = 2 * 1024 * 1024
REQUEST_TIMEOUT_SECONDS = 8.0

# User-Agent representing VeriNews news verification crawler
USER_AGENT = (
    "VeriNewsBot/1.0 (+https://github.com/mddanish-31/VeriNews; news verification MVP)"
)


class URLExtractionException(Exception):
    """Raised when a submitted news URL fails validation or content extraction."""

    def __init__(self, message: str, status_code: int = 400):
        super().__init__(message)
        self.message = message
        self.status_code = status_code


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
    try:
        addr_info = socket.getaddrinfo(hostname, None)
    except socket.gaierror as exc:
        return False, f"Could not resolve domain '{hostname}': {exc}"
    except Exception as exc:
        return False, f"Host resolution failed for '{hostname}': {exc}"

    if not addr_info:
        return False, f"No IP addresses resolved for domain '{hostname}'."

    for item in addr_info:
        ip_str = item[4][0]
        try:
            ip = ipaddress.ip_address(ip_str)
            if (
                ip.is_private
                or ip.is_loopback
                or ip.is_link_local
                or ip.is_reserved
                or ip.is_multicast
            ):
                return (
                    False,
                    f"Access to private or internal network address ({ip_str}) is blocked for security.",
                )
        except ValueError:
            return False, f"Invalid IP address returned during DNS resolution: {ip_str}"

    return True, ""


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
    # First search for <article> content if present
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

    Returns:
        dict with keys: 'url', 'headline', 'article_text', 'domain'
    Raises:
        URLExtractionException if URL is unsafe, unreachable, or unreadable.
    """
    is_safe, error_msg = validate_url_safety(url)
    if not is_safe:
        raise URLExtractionException(message=error_msg, status_code=400)

    parsed = urllib.parse.urlparse(url)
    domain = parsed.netloc
    if domain.startswith("www."):
        domain = domain[4:]

    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9,hi;q=0.8",
    }

    try:
        with httpx.Client(
            timeout=REQUEST_TIMEOUT_SECONDS,
            follow_redirects=True,
            max_redirects=3,
        ) as client:
            resp = client.get(url, headers=headers)
            resp.raise_for_status()

            # Check content length
            if len(resp.content) > MAX_RESPONSE_BYTES:
                raise URLExtractionException(
                    message="Webpage content exceeds the 2 MB maximum size limit.",
                    status_code=413,
                )

            html_content = resp.text

    except httpx.TimeoutException:
        raise URLExtractionException(
            message=f"Connection timed out while attempting to reach {domain}. The news site may be slow or blocking requests.",
            status_code=504,
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
        "url": url,
        "headline": effective_headline,
        "article_text": body_text,
        "domain": domain,
    }

