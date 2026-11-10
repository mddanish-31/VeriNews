from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_root_endpoint():
    """Verify root endpoint returns basic service metadata."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "VeriNews API"
    assert data["version"] == "0.1.0"
    assert "health_endpoint" in data
    assert data["health_endpoint"] == "/api/health"


def test_health_endpoint():
    """Verify /api/health probe returns 200 and unready model status in P06."""
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["version"] == "0.1.0"
    # In P06, models must strictly report not ready
    assert data["models_loaded"]["english"] is False
    assert data["models_loaded"]["hindi"] is False


def test_root_health_returns_404_by_contract():
    """Verify un-prefixed /health returns 404 by contract, directing clients to /api/health."""
    response = client.get("/health")
    assert response.status_code == 404

