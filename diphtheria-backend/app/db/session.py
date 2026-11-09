"""Synchronous SQLAlchemy engine and session dependencies."""

from collections.abc import Generator
from functools import lru_cache

from sqlalchemy import Engine, create_engine
from sqlalchemy.engine import URL
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import Settings, get_settings


def build_database_url(settings: Settings) -> URL:
    """Build a safe URL without manually quoting passwords."""
    return URL.create(
        drivername="postgresql+psycopg",
        username=settings.db_user,
        password=settings.db_password.get_secret_value(),
        host=settings.db_host,
        port=settings.db_port,
        database=settings.db_name,
    )


@lru_cache
def get_engine() -> Engine:
    """Create one engine per Python process, on first database use."""
    return create_engine(
        build_database_url(get_settings()),
        pool_pre_ping=True,
        connect_args={"connect_timeout": 5},
        echo=False,
    )


@lru_cache
def get_session_factory() -> sessionmaker[Session]:
    return sessionmaker(
        bind=get_engine(),
        autoflush=False,
        expire_on_commit=False,
    )


def get_db() -> Generator[Session, None, None]:
    """Yield a session; the future service layer commits successful writes."""
    with get_session_factory()() as session:
        try:
            yield session
        except Exception:
            session.rollback()
            raise