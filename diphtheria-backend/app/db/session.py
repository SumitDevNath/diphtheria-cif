
"""Async SQLAlchemy connection and session dependencies."""

from collections.abc import AsyncGenerator
from functools import lru_cache

from sqlalchemy.engine import URL
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import Settings, get_settings


def build_database_url(settings: Settings) -> URL:
    """Create a URL without manual password interpolation or escaping."""
    return URL.create(
        drivername="postgresql+psycopg",
        username=settings.db_user,
        password=settings.db_password.get_secret_value(),
        host=settings.db_host,
        port=settings.db_port,
        database=settings.db_name,
    )


@lru_cache
def get_engine() -> AsyncEngine:
    """Create a process-scoped async engine lazily."""
    return create_async_engine(
        build_database_url(get_settings()),
        pool_pre_ping=True,
        connect_args={"connect_timeout": 5},
        echo=False,
    )


@lru_cache
def get_session_factory() -> async_sessionmaker[AsyncSession]:
    return async_sessionmaker(
        bind=get_engine(),
        autoflush=False,
        expire_on_commit=False,
    )


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """One AsyncSession per request; future services own commit boundaries."""
    async with get_session_factory()() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
