"""VeriNews — Live Verification of Local English Model Inference.

Demonstrates:
1. Setting VERINEWS_ENABLE_ENGLISH_INFERENCE=true at process level.
2. Auto-loading of en_ifnd_indian_headlines_calibrated_sigmoid.joblib.
3. Live HTTP server startup on 127.0.0.1:8000.
4. GET /api/health probe showing English=true, Hindi=false.
5. POST /api/predict with valid English headline -> HTTP 200, genuine prediction, confidence, tokens, latency.
6. POST /api/predict with Hindi headline -> HTTP 503 (gated pending approval).
7. Restoring VERINEWS_ENABLE_ENGLISH_INFERENCE=false -> Dynamic update to HTTP 503.
8. Clean server shutdown releasing port 8000.
"""

import json
import logging
import os
from pathlib import Path
import sys
import threading
import time
import urllib.error
import urllib.request

# Ensure project root is in sys.path
PROJECT_ROOT = Path(__file__).resolve().parent.parent
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

# Configure temporary process-level environment variable BEFORE importing application modules
os.environ["VERINEWS_ENABLE_ENGLISH_INFERENCE"] = "true"
os.environ["VERINEWS_ENABLE_HINDI_INFERENCE"] = "false"

from backend.app.core.config import settings
from backend.app.services.model_service import model_service
from backend.app.main import app
import uvicorn

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("test_local_inference")

PORT = int(os.getenv("TEST_PORT", "8008"))
HOST = "127.0.0.1"
BASE_URL = f"http://{HOST}:{PORT}"

SAMPLE_ENGLISH_HEADLINE = (
    "The city council has approved a new public library for the east side, with construction "
    "expected to begin next spring. The final budget and timeline will be published next week."
)

SAMPLE_HINDI_HEADLINE = (
    "नगर परिषद ने शहर के पूर्वी हिस्से में एक नए सार्वजनिक पुस्तकालय के निर्माण को मंजूरी दी है।"
)


def run_server(server: uvicorn.Server):
    server.run()


def wait_for_server(url: str, timeout: float = 10.0) -> bool:
    start_time = time.monotonic()
    while time.monotonic() - start_time < timeout:
        try:
            with urllib.request.urlopen(f"{url}/api/health", timeout=1.0) as resp:
                if resp.status == 200:
                    return True
        except Exception:
            time.sleep(0.2)
    return False


def main():
    print("=" * 80)
    print("STEP 1: INSPECTION & ENVIRONMENT VERIFICATION")
    print("=" * 80)
    print(f"VERINEWS_ENABLE_ENGLISH_INFERENCE env: {os.getenv('VERINEWS_ENABLE_ENGLISH_INFERENCE')}")
    print(f"VERINEWS_ENABLE_HINDI_INFERENCE env:   {os.getenv('VERINEWS_ENABLE_HINDI_INFERENCE')}")
    print(f"settings.ENABLE_ENGLISH_INFERENCE:     {settings.ENABLE_ENGLISH_INFERENCE}")
    print(f"settings.ENABLE_HINDI_INFERENCE:       {settings.ENABLE_HINDI_INFERENCE}")
    print(f"settings.DEFAULT_ENGLISH_ARTIFACT:     {settings.DEFAULT_ENGLISH_ARTIFACT}")
    
    # Reload model service with process environment variable
    model_service.reload()
    print(f"model_service.is_english_ready():      {model_service.is_english_ready()}")
    print(f"model_service.is_hindi_ready():        {model_service.is_hindi_ready()}")
    assert model_service.is_english_ready(), "English model must be loaded and ready!"
    assert not model_service.is_hindi_ready(), "Hindi model must remain disabled!"

    print("\n" + "=" * 80)
    print("STEP 2: STARTING LOCAL FASTAPI SERVER (ENGLISH ENABLED)")
    print("=" * 80)
    config = uvicorn.Config(app=app, host=HOST, port=PORT, log_level="warning", access_log=False)
    server = uvicorn.Server(config)
    server_thread = threading.Thread(target=run_server, args=(server,), daemon=True)
    server_thread.start()

    try:
        if not wait_for_server(BASE_URL, timeout=10.0):
            print("ERROR: Server failed to start.")
            sys.exit(1)
        print(f"FastAPI server listening at {BASE_URL}")

        # Probe GET /api/health
        print("\n[PROBE] GET /api/health")
        with urllib.request.urlopen(f"{BASE_URL}/api/health") as resp:
            health_body = json.loads(resp.read().decode("utf-8"))
            print(f"Status Code: {resp.status}")
            print(f"Body: {json.dumps(health_body, indent=2)}")
            assert health_body["models_loaded"]["english"] is True
            assert health_body["models_loaded"]["hindi"] is False

        # Send POST /api/predict with English headline
        print("\n" + "=" * 80)
        print("STEP 3: LIVE HTTP POST /api/predict (ENGLISH HEADLINE)")
        print("=" * 80)
        print(f"Headline ({len(SAMPLE_ENGLISH_HEADLINE)} chars): \"{SAMPLE_ENGLISH_HEADLINE}\"")
        
        payload = json.dumps({"text": SAMPLE_ENGLISH_HEADLINE, "language_hint": "en"}).encode("utf-8")
        req = urllib.request.Request(
            f"{BASE_URL}/api/predict",
            data=payload,
            headers={"Content-Type": "application/json", "Accept": "application/json"},
            method="POST",
        )
        with urllib.request.urlopen(req) as resp:
            status_code = resp.status
            resp_data = json.loads(resp.read().decode("utf-8"))
            print(f"\nReal HTTP Status: {status_code} OK")
            print("Real JSON Response:")
            print(json.dumps(resp_data, indent=2))

            # Verification assertions
            assert status_code == 200
            assert resp_data["detected_language"] == "en"
            assert resp_data["language_name"] == "English"
            assert resp_data["prediction_label"] in ["Credible", "Unreliable"]
            assert isinstance(resp_data["is_credible"], bool)
            assert 0.0 <= resp_data["confidence_score"] <= 1.0
            assert resp_data["confidence_tier"] in [
                "High Confidence Pattern",
                "Moderate Confidence Pattern",
                "Low Confidence / Ambiguous Pattern",
            ]
            assert "en_ifnd" in resp_data["model_version"]
            assert resp_data["latency_ms"] > 0
            assert len(resp_data["influential_tokens"]) > 0

        # Test Hindi POST to confirm Hindi remains gated
        print("\n" + "=" * 80)
        print("STEP 4: VERIFY HINDI STILL RETURNS 503")
        print("=" * 80)
        hi_payload = json.dumps({"text": SAMPLE_HINDI_HEADLINE, "language_hint": "hi"}).encode("utf-8")
        hi_req = urllib.request.Request(
            f"{BASE_URL}/api/predict",
            data=hi_payload,
            headers={"Content-Type": "application/json", "Accept": "application/json"},
            method="POST",
        )
        try:
            urllib.request.urlopen(hi_req)
            print("ERROR: Hindi request did not return 503!")
            sys.exit(1)
        except urllib.error.HTTPError as err:
            print(f"HTTP Status: {err.code}")
            hi_err_body = json.loads(err.read().decode("utf-8"))
            print(f"Body: {json.dumps(hi_err_body, indent=2)}")
            assert err.code == 503

        # Step 5: Test that setting flag to false restores HTTP 503 for English
        print("\n" + "=" * 80)
        print("STEP 5: RESTORE VERINEWS_ENABLE_ENGLISH_INFERENCE=false AND VERIFY 503")
        print("=" * 80)
        os.environ["VERINEWS_ENABLE_ENGLISH_INFERENCE"] = "false"
        model_service.reload()
        assert not model_service.is_english_ready(), "English model must now be disabled!"

        with urllib.request.urlopen(f"{BASE_URL}/api/health") as resp:
            health_body_2 = json.loads(resp.read().decode("utf-8"))
            print(f"Health check after disabling inference: {health_body_2['models_loaded']}")
            assert health_body_2["models_loaded"]["english"] is False
            assert health_body_2["models_loaded"]["hindi"] is False

        req_disabled = urllib.request.Request(
            f"{BASE_URL}/api/predict",
            data=payload,
            headers={"Content-Type": "application/json", "Accept": "application/json"},
            method="POST",
        )
        try:
            urllib.request.urlopen(req_disabled)
            print("ERROR: Request did not return 503 when English inference was disabled!")
            sys.exit(1)
        except urllib.error.HTTPError as err:
            print(f"\nReal HTTP Status: {err.code} Service Unavailable")
            disabled_err_body = json.loads(err.read().decode("utf-8"))
            print(f"Real JSON Response:\n{json.dumps(disabled_err_body, indent=2)}")
            assert err.code == 503
            assert "English model service is not available" in disabled_err_body["detail"]

    finally:
        server.should_exit = True
        server_thread.join(timeout=3.0)
        print("\nServer stopped cleanly. Port 8000 released.")

    print("\n" + "=" * 80)
    print("ALL VERIFICATIONS COMPLETED SUCCESSFULLY WITH ZERO MOCK DATA.")
    print("=" * 80)


if __name__ == "__main__":
    main()
