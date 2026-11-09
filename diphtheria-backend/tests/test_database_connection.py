
"""Read-only async database checks against local PostgreSQL."""

import asyncio
import sys

from sqlalchemy import inspect, text

from app.core.config import get_settings
from app.db.session import get_engine, get_session_factory


def windows_selector_loop() -> asyncio.AbstractEventLoop:
    """Create a compatible event loop for Psycopg on Windows."""
    loop = asyncio.SelectorEventLoop()
    asyncio.set_event_loop(loop)
    return loop


def test_async_postgres_connection_and_migrated_tables() -> None:
    async def verify() -> None:
        engine = get_engine()

        try:
            async with engine.connect() as conn:
                db_name = (
                    await conn.execute(
                        text("SELECT current_database()")
                    )
                ).scalar_one()

                tables = await conn.run_sync(
                    lambda sync_conn: inspect(
                        sync_conn
                    ).get_table_names()
                )

            assert db_name == get_settings().db_name

            assert {
                "diphtheria_investigations",
                "diphtheria_antibiotic_therapies",
            }.issubset(tables)

            async with get_session_factory()() as session:
                result = await session.execute(
                    text("SELECT 1")
                )
                assert result.scalar_one() == 1

        finally:
            await engine.dispose()

    loop_factory = (
        windows_selector_loop
        if sys.platform == "win32"
        else None
    )

    with asyncio.Runner(loop_factory=loop_factory) as runner:
        runner.run(verify())
