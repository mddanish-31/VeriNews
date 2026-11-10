import collections
import logging
import time
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.app.api.routes import router as api_router
from backend.app.core.config import settings

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("verinews.api")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "VeriNews REST API — A research-oriented platform for multilingual news language-pattern analysis. "
        "Explores news-style patterns in English and Hindi with context, not certainty."
    ),
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# Configure CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

# Request Size Limit & In-Memory Rate Limiting Guard
# Architecture Notes & Production Deployment Limitations:
# 1. Scope: In-memory dictionary is process-local. It is NOT shared across multiple Uvicorn
#    workers or horizontally scaled container instances. Each process enforces its own window.
# 2. Reverse Proxies: `request.client.host` is used to identify the caller. Behind a reverse
#    proxy (e.g. Nginx, Cloudflare, ALB), Uvicorn MUST be run with `--proxy-headers` and
#    `--forwarded-allow-ips` configured to trust the proxy. We intentionally DO NOT trust
#    arbitrary `X-Forwarded-For` headers directly without proxy verification to prevent IP spoofing.
# 3. Memory Lifecycle: Periodic pruning runs when active IP tracker size exceeds 500 keys.
MAX_PAYLOAD_BYTES = 64 * 1024  # 64 KB limit
RATE_LIMIT_REQUESTS = 60
RATE_LIMIT_WINDOW_SECONDS = 60
_request_history = collections.defaultdict(list)
_last_prune_time = 0.0


def prune_stale_rate_limit_ips(now: float = None) -> int:
    """Evict expired IP rate-limit history entries to prevent memory accumulation."""
    if now is None:
        now = time.monotonic()
    stale_ips = [
        ip for ip, ts_list in _request_history.items()
        if not ts_list or (now - ts_list[-1] >= RATE_LIMIT_WINDOW_SECONDS)
    ]
    for ip in stale_ips:
        _request_history.pop(ip, None)
    return len(stale_ips)


@app.middleware("http")
async def security_and_rate_limit_middleware(request: Request, call_next):
    """Enforce request body size protection and rate limiting for prediction endpoints."""
    global _last_prune_time

    # 1. Payload size protection
    content_length = request.headers.get("content-length")
    if content_length:
        try:
            if int(content_length) > MAX_PAYLOAD_BYTES:
                return JSONResponse(
                    status_code=status.HTTP_413_CONTENT_TOO_LARGE,
                    content={
                        "detail": f"Payload size exceeds maximum allowed limit of {MAX_PAYLOAD_BYTES // 1024} KB.",
                        "error_code": "PAYLOAD_TOO_LARGE",
                    },
                )
        except ValueError:
            pass

    # 2. Rate limiting for /api/predict and /api/verify
    if (request.url.path.endswith("/predict") or request.url.path.endswith("/verify")) and request.method == "POST":
        client_ip = request.client.host if request.client else "unknown"
        now = time.monotonic()

        # Periodic dictionary pruning every 60s or when tracker has > 500 entries
        if now - _last_prune_time > 60.0 or len(_request_history) > 500:
            prune_stale_rate_limit_ips(now)
            _last_prune_time = now

        # Evict timestamps older than 60s for current client
        timestamps = [ts for ts in _request_history[client_ip] if now - ts < RATE_LIMIT_WINDOW_SECONDS]
        if len(timestamps) >= RATE_LIMIT_REQUESTS:
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "detail": "Rate limit exceeded. Maximum 60 analysis requests per minute allowed.",
                    "error_code": "RATE_LIMIT_EXCEEDED",
                },
            )
        timestamps.append(now)
        _request_history[client_ip] = timestamps

    return await call_next(request)


# Exception Handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Sanitize and format Pydantic validation errors cleanly."""
    error_messages = []
    for error in exc.errors():
        field = " -> ".join(str(loc) for loc in error.get("loc", []))
        msg = error.get("msg", "Invalid value")
        error_messages.append(f"{field}: {msg}")

    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={
            "detail": "; ".join(error_messages),
            "error_code": "VALIDATION_ERROR",
        },
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Return uniform structured error JSON."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "detail": exc.detail,
            "error_code": f"HTTP_{exc.status_code}",
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    """
    Catch unhandled exceptions without leaking Python stack traces or user text
    to the client or logs.
    """
    logger.error("Unhandled server exception: %s", type(exc).__name__, exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "An internal server error occurred. Please try again later.",
            "error_code": "INTERNAL_SERVER_ERROR",
        },
    )


# Attach API router
app.include_router(api_router, prefix=settings.API_PREFIX)


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint welcoming clients and directing to the API health probe."""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "health_endpoint": f"{settings.API_PREFIX}/health",
        "documentation": "/api/docs",
    }

