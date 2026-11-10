"""Server-side live web evidence search service.

Queries live news feeds and knowledge bases to retrieve independent, verifiable
corroborating or disputing news sources with titles, original publisher domains,
clickable URLs, publication dates, and snippets.

Primary search engines (100% open, zero-credential, sanctioned):
1. Google News Live RSS Feed: Real-time accredited news reporting (English & Hindi).
2. Wikipedia API: Verified encyclopedic knowledge and historical context.
3. Optional external APIs (TAVILY_API_KEY / SERPAPI_API_KEY) if configured in .env.
"""

import logging
import os
import re
import urllib.parse
import xml.etree.ElementTree as ET
from html import unescape
from typing import Any, Dict, List, Optional
import httpx

logger = logging.getLogger(__name__)

SEARCH_TIMEOUT_SECONDS = 8.0
MAX_SEARCH_RESULTS = 6

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)


def clean_query_text(text: str, max_words: int = 12) -> str:
    """Prepare clean, high-signal search query from a news claim or headline."""
    # Remove URLs if present
    text = re.sub(r"https?://\S+", "", text)
    # Remove leading/trailing quotation marks
    cleaned = re.sub(r'["\'\“\”\‘\’]', "", text).strip()
    words = cleaned.split()
    if len(words) > max_words:
        return " ".join(words[:max_words])
    return " ".join(words)


def search_google_news_rss(
    query: str,
    language: str = "en",
    max_results: int = 4,
) -> List[Dict[str, Any]]:
    """Retrieve live accredited news articles from Google News RSS feed."""
    encoded_q = urllib.parse.quote(query)
    if language == "hi":
        rss_url = f"https://news.google.com/rss/search?q={encoded_q}&hl=hi&gl=IN&ceid=IN:hi"
    else:
        rss_url = f"https://news.google.com/rss/search?q={encoded_q}&hl=en-IN&gl=IN&ceid=IN:en"

    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "application/rss+xml,application/xml;q=0.9,*/*;q=0.8",
    }

    try:
        with httpx.Client(timeout=SEARCH_TIMEOUT_SECONDS, follow_redirects=True) as client:
            resp = client.get(rss_url, headers=headers)
            if resp.status_code != 200:
                return []
            xml_text = resp.text
    except Exception as exc:
        logger.warning("Google News RSS request error for query '%s': %s", query, exc)
        return []

    results: List[Dict[str, Any]] = []
    try:
        root = ET.fromstring(xml_text)
        items = root.findall(".//item")
        for item in items[:max_results]:
            raw_title = item.findtext("title", "").strip()
            link = item.findtext("link", "").strip()
            pub_date = item.findtext("pubDate", "").strip()
            source_el = item.find("source")
            publisher = source_el.text.strip() if (source_el is not None and source_el.text) else ""

            # Extract snippet from description HTML if available
            desc_html = item.findtext("description", "")
            snippet = unescape(re.sub(r"<[^>]+>", " ", desc_html)).strip()
            if not snippet or len(snippet) < 15:
                snippet = raw_title

            # Clean trailing " - Publisher Name" from title
            clean_title = raw_title
            if " - " in raw_title:
                parts = raw_title.rsplit(" - ", 1)
                clean_title = parts[0].strip()
                if not publisher:
                    publisher = parts[1].strip()

            if not publisher:
                parsed = urllib.parse.urlparse(link)
                publisher = parsed.netloc.replace("www.", "")

            # Format publication date nicely
            clean_date = None
            if pub_date:
                # e.g. "Tue, 29 Sep 2026 07:00:00 GMT" -> "29 Sep 2026"
                date_match = re.search(r"\d{1,2}\s+[A-Za-z]{3}\s+\d{4}", pub_date)
                if date_match:
                    clean_date = date_match.group(0)
                else:
                    clean_date = pub_date[:16]

            results.append(
                {
                    "title": clean_title,
                    "publisher": publisher,
                    "url": link,
                    "snippet": snippet[:240],
                    "date": clean_date,
                }
            )
    except Exception as exc:
        logger.warning("XML parsing error for Google News RSS: %s", exc)

    return results


def search_wikipedia_api(
    query: str,
    language: str = "en",
    max_results: int = 2,
) -> List[Dict[str, Any]]:
    """Retrieve verified encyclopedic background evidence from Wikipedia API."""
    wiki_lang = "hi" if language == "hi" else "en"
    endpoint = f"https://{wiki_lang}.wikipedia.org/w/api.php"
    params = {
        "action": "query",
        "list": "search",
        "srsearch": query,
        "format": "json",
        "srlimit": max_results,
    }
    headers = {
        "User-Agent": "VeriNewsBot/1.0 (+https://github.com/mddanish-31/VeriNews; news verification MVP)",
    }

    try:
        with httpx.Client(timeout=SEARCH_TIMEOUT_SECONDS) as client:
            resp = client.get(endpoint, params=params, headers=headers)
            if resp.status_code != 200:
                return []
            data = resp.json()
            hits = data.get("query", {}).get("search", [])
            results = []
            for hit in hits:
                title = hit.get("title", "")
                snippet_html = hit.get("snippet", "")
                clean_snippet = unescape(re.sub(r"<[^>]+>", "", snippet_html)).strip()
                encoded_title = urllib.parse.quote(title.replace(" ", "_"))
                url = f"https://{wiki_lang}.wikipedia.org/wiki/{encoded_title}"
                results.append(
                    {
                        "title": f"{title} (Wikipedia)",
                        "publisher": f"{wiki_lang.upper()} Wikipedia",
                        "url": url,
                        "snippet": clean_snippet,
                        "date": None,
                    }
                )
            return results
    except Exception as exc:
        logger.warning("Wikipedia search error for query '%s': %s", query, exc)
        return []


def search_web_evidence(
    query: str,
    language: str = "en",
    max_results: int = MAX_SEARCH_RESULTS,
) -> List[Dict[str, Any]]:
    """Retrieve independent live web evidence for a submitted news claim.

    Combines live Google News reporting with Wikipedia encyclopedic background,
    ensuring multi-source diversity, real publisher citations, and clickable URLs.
    """
    clean_q = clean_query_text(query)
    if not clean_q or len(clean_q) < 3:
        return []

    # 1. Check for Tavily Search API key
    tavily_key = os.getenv("TAVILY_API_KEY")
    if tavily_key:
        try:
            with httpx.Client(timeout=SEARCH_TIMEOUT_SECONDS) as client:
                resp = client.post(
                    "https://api.tavily.com/search",
                    json={
                        "api_key": tavily_key,
                        "query": clean_q,
                        "search_depth": "basic",
                        "max_results": max_results,
                    },
                )
                if resp.status_code == 200:
                    data = resp.json()
                    results = []
                    for item in data.get("results", []):
                        domain = urllib.parse.urlparse(item.get("url", "")).netloc
                        if domain.startswith("www."):
                            domain = domain[4:]
                        results.append(
                            {
                                "title": item.get("title", ""),
                                "publisher": domain,
                                "url": item.get("url", ""),
                                "snippet": item.get("content", ""),
                                "date": item.get("published_date"),
                            }
                        )
                    if results:
                        return results
        except Exception as exc:
            logger.warning("Tavily search fallback to standard web search: %s", exc)

    # 2. Live Google News RSS (accredited media coverage)
    news_results = search_google_news_rss(clean_q, language=language, max_results=4)

    # 3. Wikipedia API (encyclopedic background)
    wiki_results = search_wikipedia_api(clean_q, language=language, max_results=2)

    # Combine & deduplicate by domain / title
    combined = list(news_results)
    seen_titles = {r["title"].lower() for r in combined}

    for wr in wiki_results:
        if wr["title"].lower() not in seen_titles:
            combined.append(wr)
            seen_titles.add(wr["title"].lower())

    return combined[:max_results]
