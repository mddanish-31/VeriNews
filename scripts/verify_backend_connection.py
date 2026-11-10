"""VeriNews — Live Backend Startup, Health-Check, and CORS/Predict Verification Script.

This script boots the FastAPI application on Uvicorn (127.0.0.1:8000), tests GET /api/health,
verifies CORS preflight headers, and tests POST /api/predict for both English and Hindi
to confirm safe HTTP 503 responses while inference is disabled.
"""

import json
import logging
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

import uvicorn
from backend.app.main import app

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("verify_backend")

PORT = 8000
HOST = "127.0.0.1"
BASE_URL = f"http://{HOST}:{PORT}"


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
    config = uvicorn.Config(
        app=app,
        host=HOST,
        port=PORT,
        log_level="warning",
        access_log=False,
    )
    server = uvicorn.Server(config)
    server_thread = threading.Thread(target=run_server, args=(server,), daemon=True)
    server_thread.start()

    logger.info("Starting Uvicorn server on %s:%d...", HOST, PORT)
    if not wait_for_server(BASE_URL, timeout=10.0):
        logger.error("Server failed to start within timeout.")
        server.should_exit = True
        sys.exit(1)

    logger.info("Server started successfully. Beginning verification checks...")
    results = {}

    # 1. Test GET /api/health
    try:
        req = urllib.request.Request(f"{BASE_URL}/api/health", headers={"Accept": "application/json"})
        with urllib.request.urlopen(req) as resp:
            status_code = resp.status
            body = json.loads(resp.read().decode("utf-8"))
            results["health"] = {
                "status_code": status_code,
                "body": body,
                "passed": status_code == 200 and body.get("status") == "healthy" and not body.get("models_loaded", {}).get("english") and not body.get("models_loaded", {}).get("hindi"),
            }
            logger.info("GET /api/health: Status %d, body: %s", status_code, body)
    except Exception as exc:
        results["health"] = {"passed": False, "error": str(exc)}
        logger.error("GET /api/health failed: %s", exc)

    # 2. Test CORS Preflight OPTIONS /api/predict from http://localhost:3000
    try:
        req = urllib.request.Request(
            f"{BASE_URL}/api/predict",
            method="OPTIONS",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type",
            },
        )
        with urllib.request.urlopen(req) as resp:
            headers = dict(resp.headers)
            results["cors_options"] = {
                "status_code": resp.status,
                "allow_origin": headers.get("Access-Control-Allow-Origin") or headers.get("access-control-allow-origin"),
                "allow_methods": headers.get("Access-Control-Allow-Methods") or headers.get("access-control-allow-methods"),
                "passed": resp.status == 200 and (headers.get("access-control-allow-origin") == "http://localhost:3000" or headers.get("Access-Control-Allow-Origin") == "http://localhost:3000"),
            }
            logger.info("OPTIONS /api/predict: Status %d, Allow-Origin: %s", resp.status, results["cors_options"]["allow_origin"])
    except Exception as exc:
        results["cors_options"] = {"passed": False, "error": str(exc)}
        logger.error("OPTIONS /api/predict failed: %s", exc)

    # 3. Test POST /api/predict for English headline (inference disabled)
    en_payload = json.dumps({
        "text": "The city council has approved a new public library for the east side, with construction expected to begin next spring. The final budget and timeline will be published next week.",
        "language_hint": "en",
    }).encode("utf-8")

    try:
        req = urllib.request.Request(
            f"{BASE_URL}/api/predict",
            data=en_payload,
            headers={
                "Content-Type": "application/json",
                "Origin": "http://localhost:3000",
            },
            method="POST",
        )
        with urllib.request.urlopen(req) as resp:
            results["predict_en"] = {"passed": False, "status_code": resp.status, "note": "Expected 503 but got 200"}
    except urllib.error.HTTPError as exc:
        body = json.loads(exc.read().decode("utf-8"))
        headers = dict(exc.headers)
        allow_origin = headers.get("Access-Control-Allow-Origin") or headers.get("access-control-allow-origin")
        results["predict_en"] = {
            "status_code": exc.code,
            "body": body,
            "allow_origin": allow_origin,
            "passed": exc.code == 503 and "English model service is not available" in body.get("detail", ""),
        }
        logger.info("POST /api/predict [English]: Status %d, Detail: '%s', Allow-Origin: %s", exc.code, body.get("detail"), allow_origin)
    except Exception as exc:
        results["predict_en"] = {"passed": False, "error": str(exc)}
        logger.error("POST /api/predict [English] failed: %s", exc)

    # 4. Test POST /api/predict for Hindi headline (inference disabled)
    hi_payload = json.dumps({
        "text": "नगर परिषद ने शहर के पूर्वी हिस्से में एक नए सार्वजनिक पुस्तकालय के निर्माण को मंजूरी दी है। निर्माण अगले वसंत में शुरू होगा।",
        "language_hint": "hi",
    }).encode("utf-8")

    try:
        req = urllib.request.Request(
            f"{BASE_URL}/api/predict",
            data=hi_payload,
            headers={
                "Content-Type": "application/json",
                "Origin": "http://localhost:3000",
            },
            method="POST",
        )
        with urllib.request.urlopen(req) as resp:
            results["predict_hi"] = {"passed": False, "status_code": resp.status, "note": "Expected 503 but got 200"}
    except urllib.error.HTTPError as exc:
        body = json.loads(exc.read().decode("utf-8"))
        headers = dict(exc.headers)
        allow_origin = headers.get("Access-Control-Allow-Origin") or headers.get("access-control-allow-origin")
        results["predict_hi"] = {
            "status_code": exc.code,
            "body": body,
            "allow_origin": allow_origin,
            "passed": exc.code == 503 and "Hindi model service is not available" in body.get("detail", ""),
        }
        logger.info("POST /api/predict [Hindi]: Status %d, Detail: '%s', Allow-Origin: %s", exc.code, body.get("detail"), allow_origin)
    except Exception as exc:
        results["predict_hi"] = {"passed": False, "error": str(exc)}
        logger.error("POST /api/predict [Hindi] failed: %s", exc)

    # 5. Run frontend fetch simulation via Node.js
    import subprocess
    try:
        logger.info("Executing Node.js frontend fetch simulation (scripts/verify_frontend_fetch.mjs)...")
        node_res = subprocess.run(
            ["node", str(PROJECT_ROOT / "scripts" / "verify_frontend_fetch.mjs")],
            capture_output=True,
            text=True,
            timeout=10,
        )
        logger.info("Node.js simulation stdout:\n%s", node_res.stdout)
        results["frontend_simulation"] = {
            "passed": node_res.returncode == 0,
            "stdout": node_res.stdout.strip(),
        }
    except Exception as exc:
        results["frontend_simulation"] = {"passed": False, "error": str(exc)}
        logger.error("Frontend simulation failed: %s", exc)

    # Clean shutdown
    server.should_exit = True
    server_thread.join(timeout=2.0)

    # Final summary report
    print("\n" + "=" * 60)
    print("VERIFICATION SUMMARY REPORT:")
    all_passed = all(r.get("passed", False) for r in results.values())
    print(f"Overall Result: {'ALL PASS' if all_passed else 'SOME CHECKS FAILED'}")
    for name, data in results.items():
        status_str = "PASS" if data.get("passed") else "FAIL"
        print(f"  [{status_str}] {name}: status={data.get('status_code')} passed={data.get('passed')}")
    print("=" * 60)

    if not all_passed:
        sys.exit(1)


if __name__ == "__main__":
    main()
