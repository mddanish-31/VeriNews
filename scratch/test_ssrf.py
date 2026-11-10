import ipaddress
import socket
import urllib.parse

def is_safe_url(url: str) -> tuple[bool, str]:
    try:
        parsed = urllib.parse.urlparse(url)
    except Exception:
        return False, "Invalid URL structure."
    
    if parsed.scheme.lower() not in ("http", "https"):
        return False, f"Unsupported protocol '{parsed.scheme}'. Only HTTP and HTTPS are permitted."
    
    hostname = parsed.hostname
    if not hostname:
        return False, "URL must include a valid hostname."
    
    if hostname.lower() in ("localhost", "127.0.0.1", "0.0.0.0", "::1"):
        return False, "Requests to localhost or loopback addresses are blocked."
        
    try:
        addr_info = socket.getaddrinfo(hostname, None)
    except socket.gaierror:
        return False, f"Could not resolve host '{hostname}'."
    
    for family, _, _, _, sockaddr in addr_info:
        ip_str = sockaddr[0]
        try:
            ip = ipaddress.ip_address(ip_str)
            if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_multicast:
                return False, f"Access to private/internal network addresses ({ip_str}) is forbidden."
        except ValueError:
            return False, "Invalid IP address resolution."
            
    return True, ""

test_cases = [
    ("http://localhost:8000/api/predict", False),
    ("http://127.0.0.1:3000", False),
    ("http://192.168.1.100/admin", False),
    ("http://169.254.169.254/latest/meta-data", False),
    ("file:///etc/passwd", False),
    ("ftp://ftp.example.com", False),
    ("https://en.wikipedia.org/wiki/Chandrayaan_programme", True),
]

for url, expected in test_cases:
    safe, msg = is_safe_url(url)
    print(f"URL: {url} -> Safe: {safe} (Expected: {expected}) - Msg: {msg}")
    assert safe == expected
print("All SSRF unit tests passed!")

