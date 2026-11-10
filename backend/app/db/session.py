"""Database engine and session management."""

from functools import lru_cache
from typing import Generator, Optional
from fastapi import HTTPException, status
from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from backend.app.core.config import settings


@lru_cache(maxsize=1)
def get_engine(database_url: Optional[str] = None) -> Engine:
    """Create and cache the SQLAlchemy engine.

    Args:
        database_url: Optional override for the database connection URL.
            Defaults to settings.DATABASE_URL.

    Returns:
        SQLAlchemy Engine instance.

    Raises:
        RuntimeError: If no database URL is configured.
    """
    url = database_url or settings.DATABASE_URL
    if not url:
        raise RuntimeError("DATABASE_URL is not configured in the application environment.")

    engine = create_engine(
        url,
        pool_pre_ping=True,
        pool_recycle=300,
        pool_size=5,
        max_overflow=10,
    )
    return engine


@lru_cache(maxsize=1)
def get_session_factory(database_url: Optional[str] = None) -> sessionmaker[Session]:
    """Create and cache a sessionmaker bound to the active engine."""
    engine = get_engine(database_url)
    return sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency for yielding transactional database sessions.

    Yields:
        Active SQLAlchemy Session that automatically closes upon request completion.

    Raises:
        HTTPException: If database is not configured in environment.
    """
    if not settings.DATABASE_URL:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Database service is not configured.",
        )
    session_factory = get_session_factory()
    db = session_factory()
    try:
        yield db
    finally:
        db.close()


def get_optional_db() -> Generator[Optional[Session], None, None]:
    """FastAPI dependency for yielding an optional database session.

    Yields:
        Active SQLAlchemy Session if configured, or None if database is decoupled/unconfigured.
    """
    if not settings.DATABASE_URL:
        yield None
        return
    session_factory = get_session_factory()
    db = session_factory()
    try:
        yield db
    finally:
        db.close()
