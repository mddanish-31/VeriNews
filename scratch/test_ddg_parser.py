import httpx
import urllib.parse
import re
from html import unescape

def search_ddg(query: str, max_results: int = 5):
    url = "https://html.duckduckgo.com/html/?q=" + urllib.parse.quote(query)
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }
    with httpx.Client(timeout=10.0, follow_redirects=True) as client:
        resp = client.get(url, headers=headers)
        html = resp.text

    results = []
    pattern = re.compile(
        r'<div class="result results_links results_links_deep web-result\s*">(.*?)<!-- This is the visible part -->\s*<h2 class="result__title">\s*<a[^>]*class="result__a"[^>]*href="(?P<url>[^"]+)"[^>]*>(?P<title>.*?)</a>.*?<a[^>]*class="result__snippet"[^>]*>(?P<snippet>.*?)</a>',
        re.DOTALL
    )

    for m in pattern.finditer(html):
        raw_url = m.group("url")
        qs = urllib.parse.parse_qs(urllib.parse.urlparse(raw_url).query)
        clean_url = qs.get("uddg", [raw_url])[0]
        
        clean_title = unescape(re.sub(r'<[^>]+>', '', m.group("title")).strip())
        clean_snippet = unescape(re.sub(r'<[^>]+>', '', m.group("snippet")).strip())
        
        publisher = urllib.parse.urlparse(clean_url).netloc
        if publisher.startswith("www."):
            publisher = publisher[4:]
            
        results.append({
            "title": clean_title,
            "url": clean_url,
            "snippet": clean_snippet,
            "publisher": publisher
        })
        if len(results) >= max_results:
            break

    return results

if __name__ == "__main__":
    res = search_ddg("चंद्रयान मिशन भारत इसरो")
    print(f"Parsed {len(res)} Hindi results:")
    for r in res[:3]:
        print("---")
        print("Title:", r["title"])
        print("Publisher:", r["publisher"])
        print("URL:", r["url"])
        print("Snippet:", r["snippet"])
