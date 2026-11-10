"""Unit and integration tests for VeriNews database layer."""

import uuid
from decimal import Decimal
import pytest
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session

from backend.app.core.config import settings
from backend.app.db.base import Base
from backend.app.db.models import Analysis, User, UserFeedback
from backend.app.db.session import (
    get_db,
    get_engine,
    get_optional_db,
    get_session_factory,
)


@pytest.fixture(scope="module")
def db_engine():
    """Fixture providing the SQLAlchemy engine configured for testing."""
    if not settings.DATABASE_URL:
        pytest.skip("DATABASE_URL is not set; skipping live database tests.")
    engine = get_engine()
    yield engine
    engine.dispose()


@pytest.fixture
def db_session(db_engine):
    """Fixture providing a transactional database session that rolls back after each test."""
    connection = db_engine.connect()
    transaction = connection.begin()
    session = Session(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


def test_database_connectivity(db_engine):
    """Verify that the engine connects to PostgreSQL and identifies the current database."""
    with db_engine.connect() as conn:
        result = conn.execute(text("SELECT 1")).scalar()
        assert result == 1

        db_name = conn.execute(text("SELECT current_database()")).scalar()
        assert db_name is not None
        assert db_name.lower() in ("neondb", "verinews")


def test_schema_zero_content_retention_invariants():
    """Verify that models and tables enforce Strict Zero Content Retention."""
    analysis_columns = {c.name for c in Analysis.__table__.columns}
    feedback_columns = {c.name for c in UserFeedback.__table__.columns}

    # Prohibited columns must NEVER exist
    forbidden_analysis_fields = {
        "input_snippet",
        "input_hash",
        "influential_tokens",
        "influential_features",
        "article_text",
        "raw_text",
    }
    for field in forbidden_analysis_fields:
        assert field not in analysis_columns, f"Forbidden field '{field}' detected in Analysis entity!"

    assert "comment" not in feedback_columns, "Forbidden field 'comment' detected in UserFeedback entity!"

    # Required metadata columns must exist
    required_analysis_fields = {
        "id",
        "user_id",
        "input_char_length",
        "detected_language",
        "language_routing_method",
        "prediction_label",
        "is_credible",
        "confidence_score",
        "confidence_tier",
        "model_version",
        "latency_ms",
        "created_at",
    }
    assert required_analysis_fields.issubset(analysis_columns)


def test_database_tables_exist_in_rdbms(db_engine):
    """Verify that Alembic migrations created all expected tables in Neon."""
    insp = inspect(db_engine)
    table_names = set(insp.get_table_names())

    assert "alembic_version" in table_names
    assert "users" in table_names
    assert "analyses" in table_names
    assert "user_feedback" in table_names


def test_session_lifecycle():
    """Verify that get_db and get_optional_db yield and properly close sessions."""
    # Test get_optional_db
    gen_opt = get_optional_db()
    session_opt = next(gen_opt)
    assert session_opt is not None
    assert isinstance(session_opt, Session)
    try:
        pass
    finally:
        with pytest.raises(StopIteration):
            next(gen_opt)

    # Test get_db
    gen = get_db()
    session = next(gen)
    assert session is not None
    assert isinstance(session, Session)
    try:
        pass
    finally:
        with pytest.raises(StopIteration):
            next(gen)


def test_crud_and_foreign_key_constraints(db_session: Session):
    """Test full CRUD lifecycle with rollback to verify constraints without persisting test data."""
    # 1. Create a registered User
    test_user_id = uuid.uuid4()
    user = User(
        id=test_user_id,
        email=f"test_{test_user_id.hex[:8]}@example.com",
        password_hash="argon2id$mock_hash_for_test",
        is_active=True,
        is_verified=False,
    )
    db_session.add(user)
    db_session.flush()

    assert user.id == test_user_id
    assert user.created_at is not None

    # 2. Create an Analysis record linked to the user
    analysis = Analysis(
        user_id=user.id,
        input_char_length=250,
        detected_language="en",
        language_routing_method="unicode_script",
        prediction_label="Unverified Pattern",
        is_credible=False,
        confidence_score=Decimal("0.8520"),
        confidence_tier="Uncalibrated",
        model_version="test-v1.0.0",
        latency_ms=Decimal("12.45"),
    )
    db_session.add(analysis)
    db_session.flush()

    assert analysis.id is not None
    assert analysis.user_id == user.id

    # 3. Create a Guest Analysis record (user_id is None)
    guest_analysis = Analysis(
        user_id=None,
        input_char_length=320,
        detected_language="hi",
        language_routing_method="unicode_script",
        prediction_label="Credible Pattern",
        is_credible=True,
        confidence_score=Decimal("0.9100"),
        confidence_tier="Uncalibrated",
        model_version="test-v1.0.0",
        latency_ms=Decimal("15.10"),
    )
    db_session.add(guest_analysis)
    db_session.flush()

    assert guest_analysis.id is not None
    assert guest_analysis.user_id is None

    # 4. Create UserFeedback linked to the analysis
    feedback = UserFeedback(
        analysis_id=analysis.id,
        user_id=user.id,
        agreed_with_prediction=True,
        feedback_category="neutral_reporting",
    )
    db_session.add(feedback)
    db_session.flush()

    assert feedback.id is not None
    assert feedback.analysis_id == analysis.id

    # Query back and verify relations
    queried_user = db_session.query(User).filter_by(id=user.id).first()
    assert queried_user is not None
    assert len(queried_user.analyses) == 1
    assert queried_user.analyses[0].id == analysis.id
    assert len(queried_user.feedback) == 1
