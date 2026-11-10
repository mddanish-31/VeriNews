"""Test gemini-3.8-flash."""

import os
from pathlib import Path
from dotenv import load_dotenv
import httpx

ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(ROOT_DIR / ".env")

key = os.getenv("GEMINI_API_KEY")

prompt = "Hello"
payload = {"contents": [{"parts": [{"text": prompt}]}]}

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key={key}"
with httpx.Client(timeout=10.0) as client:
    r = client.post(url, json=payload)
    print("Status:", r.status_code)
    print("Body:", r.text[:300])
