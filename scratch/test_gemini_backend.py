"""Test the backend /api/verify endpoint using the existing implementation and configured model."""

import os
import sys
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(ROOT_DIR / ".env")

if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

print("1. Checking GEMINI_API_KEY in environment...")
key_present = bool(os.getenv("GEMINI_API_KEY"))
print(f"   GEMINI_API_KEY detected: {key_present}")

print("\n2. Executing /api/verify with a verifiable claim...")
claim_payload = {
    "input_type": "headline",
    "text": "ISRO Chandrayaan mission successfully explores the lunar surface",
    "language_hint": "en",
}

response = client.post("/api/verify", json=claim_payload)
print(f"   HTTP Status: {response.status_code}")
data = response.json()
print(f"   Response Status: {data.get('status')}")
print(f"   Summary: {data.get('summary')}")
print(f"   Explanation: {data.get('explanation')[:120]}...")
print(f"   Sources retrieved: {len(data.get('sources', []))}")
print(f"   Missing context items: {data.get('missing_context', [])}")

# Check whether deterministic fallback was active
fallback_used = any("deterministic" in str(ctx).lower() for ctx in data.get("missing_context", []))
print(f"\n3. Fallback used: {fallback_used}")
