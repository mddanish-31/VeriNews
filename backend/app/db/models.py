"""SQLAlchemy ORM models for VeriNews.

Adheres strictly to the P05-approved database schema and the Strict
Zero-Content-Retention principle:
- NO article text or snippets (input_snippet omitted)
- NO deterministic content hashes (input_hash omitted)
- NO raw tokens or feature indices (influential_tokens/features omitted)
- NO free-text comments in user feedback (comment omitted)
"""

import uuid
from decimal import Decimal
from typing import List, Optional
from datetime import datetime

from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Uuid,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class User(Base):
    """User entity for persistent account data and authentication (future).

    Zero Content Retention applies strictly to submitted news text and
    article-derived features. The users table stores standard account credentials
    for registered accounts, separate from any news content.
    """

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        nullable=False,
        index=True,
    )
    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
    )
    is_verified: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    # Relationships
    analyses: Mapped[List["Analysis"]] = relationship(
        "Analysis",
        back_populates="user",
    )
    feedback: Mapped[List["UserFeedback"]] = relationship(
        "UserFeedback",
        back_populates="user",
    )

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} is_active={self.is_active}>"


class Analysis(Base):
    """Analysis entity storing non-content operational and statistical metadata.

    Enforces Strict Zero Content Retention:
    - Never stores submitted news articles, excerpts, or raw word tokens.
    - Never stores feature IDs, vectors, or deterministic hashes.
    - Explainability information is transient and returned in API responses only.
    """

    __tablename__ = "analyses"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    input_char_length: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    detected_language: Mapped[str] = mapped_column(
        String(10),
        nullable=False,
    )
    language_routing_method: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    prediction_label: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )
    is_credible: Mapped[Optional[bool]] = mapped_column(
        Boolean,
        nullable=True,
    )
    confidence_score: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(5, 4),
        nullable=True,
    )
    confidence_tier: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
    )
    model_version: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    latency_ms: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(8, 2),
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        index=True,
    )

    # Relationships
    user: Mapped[Optional["User"]] = relationship(
        "User",
        back_populates="analyses",
    )
    feedback: Mapped[List["UserFeedback"]] = relationship(
        "UserFeedback",
        back_populates="analysis",
        cascade="all, delete-orphan",
    )

    def __repr__(self) -> str:
        return (
            f"<Analysis id={self.id} lang={self.detected_language} "
            f"label={self.prediction_label} model={self.model_version}>"
        )


class UserFeedback(Base):
    """User feedback entity capturing qualitative model diagnostics.

    Zero Content Retention:
    - Ommits free-text comment inputs to prevent ingestion of PII or article text.
    - Captures structured classifications and binary agreement flags only.
    """

    __tablename__ = "user_feedback"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )
    analysis_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("analyses.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    agreed_with_prediction: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
    )
    feedback_category: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    # Relationships
    analysis: Mapped["Analysis"] = relationship(
        "Analysis",
        back_populates="feedback",
    )
    user: Mapped[Optional["User"]] = relationship(
        "User",
        back_populates="feedback",
    )

    def __repr__(self) -> str:
        return (
            f"<UserFeedback id={self.id} analysis_id={self.analysis_id} "
            f"agreed={self.agreed_with_prediction} category={self.feedback_category}>"
        )

