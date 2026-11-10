from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

VALID_EN_TEXT = (
    "The city council has approved a new public library for the east side, with construction "
    "expected to begin next spring. The project includes a reading room, community spaces, "
    "and expanded access to digital resources. Officials said the final budget and timeline "
    "will be published after the next planning meeting."
)

VALID_HI_TEXT = (
    "नगर परिषद ने शहर के पूर्वी हिस्से में एक नए सार्वजनिक पुस्तकालय के निर्माण को मंजूरी दी है। "
    "अधिकारियों के अनुसार, निर्माण अगले वसंत में शुरू होने की उम्मीद है। प्रस्तावित भवन में "
    "पढ़ने का कक्ष, सामुदायिक गतिविधियों के लिए स्थान और डिजिटल संसाधनों की सुविधा शामिल होगी।"
)


def test_predict_rejects_too_short_text():
    """Verify inputs shorter than 20 characters return HTTP 400."""
    response = client.post(
        "/api/predict",
        json={"text": "Short headline"},
    )
    assert response.status_code == 400
    data = response.json()
    assert "detail" in data
    assert data["error_code"] == "VALIDATION_ERROR"


def test_predict_rejects_too_long_text():
    """Verify inputs exceeding 500 characters return HTTP 400."""
    huge_text = "News headline report content sentence. " * 20  # > 500 characters
    response = client.post(
        "/api/predict",
        json={"text": huge_text},
    )
    assert response.status_code == 400
    data = response.json()
    assert data["error_code"] == "VALIDATION_ERROR"


def test_predict_rejects_unsupported_script():
    """Verify unsupported scripts (e.g., Cyrillic or Arabic) return HTTP 422."""
    cyrillic_text = (
        "Городской совет сегодня официально утвердил решение о строительстве новой публичной "
        "библиотеки в восточном районе города. Проект включает в себя просторные читальные залы "
        "и общественные центры для жителей."
    )
    response = client.post(
        "/api/predict",
        json={"text": cyrillic_text},
    )
    assert response.status_code == 422
    data = response.json()
    assert "Unsupported script" in data["detail"]


def test_predict_rejects_conflicting_language_hint():
    """Verify specifying 'hi' hint with Latin text returns HTTP 422."""
    response = client.post(
        "/api/predict",
        json={"text": VALID_EN_TEXT, "language_hint": "hi"},
    )
    assert response.status_code == 422
    data = response.json()
    assert "Hindi was specified" in data["detail"]


def test_predict_returns_503_for_valid_english_without_models():
    """
    Verify valid English text routes to English pipeline and returns HTTP 503
    because no trained approved model exists in Phase P06.
    Ensures zero fabricated predictions or hallucinated confidence scores.
    """
    response = client.post(
        "/api/predict",
        json={"text": VALID_EN_TEXT, "language_hint": "auto"},
    )
    assert response.status_code == 503
    data = response.json()
    assert "English model service is not available" in data["detail"]
    assert "never fabricates synthetic predictions" in data["detail"]


def test_predict_returns_503_for_valid_hindi_without_models():
    """
    Verify valid Hindi text routes to Hindi pipeline and returns HTTP 503
    because no trained approved model exists in Phase P06.
    """
    response = client.post(
        "/api/predict",
        json={"text": VALID_HI_TEXT, "language_hint": "auto"},
    )
    assert response.status_code == 503
    data = response.json()
    assert "Hindi model service is not available" in data["detail"]


def test_cors_preflight():
    """Verify CORS preflight OPTIONS request returns appropriate headers."""
    response = client.options(
        "/api/predict",
        headers={
            "Origin": "http://localhost:3000",
            "Access-Control-Request-Method": "POST",
        },
    )
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:3000"

