
"""Alembic migrations via SQLAlchemy's async engine and Psycopg 3."""

import asyncio
import sys

from alembic import context
from sqlalchemy import Connection, pool
from sqlalchemy.ext.asyncio import create_async_engine

from app.core.config import get_settings
from app.db.base import Base
from app.db.session import build_database_url
import app.models  # noqa: F401 - Register ORM models for Alembic.

config = context.config
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    url = build_database_url(
        get_settings()
    ).render_as_string(hide_password=False)

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
    )

    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    engine = create_async_engine(
        build_database_url(get_settings()),
        poolclass=pool.NullPool,
        connect_args={"connect_timeout": 5},
    )

    try:
        async with engine.connect() as connection:
            await connection.run_sync(do_run_migrations)
    finally:
        await engine.dispose()


def windows_selector_loop() -> asyncio.AbstractEventLoop:
    """Create a Psycopg-compatible Windows event loop."""
    loop = asyncio.SelectorEventLoop()
    asyncio.set_event_loop(loop)
    return loop


def run_migrations_online() -> None:
    """Run migrations asynchronously on Windows and other platforms."""
    loop_factory = (
        windows_selector_loop
        if sys.platform == "win32"
        else None
    )

    with asyncio.Runner(loop_factory=loop_factory) as runner:
        runner.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
