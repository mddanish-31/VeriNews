from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_samples_endpoint():
    """Verify /api/samples returns English and Hindi illustrative excerpts."""
    response = client.get("/api/samples")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2

    languages = {item["language"] for item in data}
    assert "en" in languages
    assert "hi" in languages

    for sample in data:
        assert sample["is_illustrative"] is True
        assert "disclaimer" in sample
        assert len(sample["text"]) >= 100
        assert len(sample["title"]) > 0

