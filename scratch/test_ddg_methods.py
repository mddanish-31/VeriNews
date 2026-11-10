import httpx

query = "ISRO Chandrayaan mission"
headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
}

with httpx.Client(timeout=10.0, follow_redirects=True) as client:
    r = client.post("https://lite.duckduckgo.com/lite/", data={"q": query}, headers=headers)
    print("\n".join(r.text.splitlines()[35:100]))
