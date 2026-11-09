
"""Real API persistence tests: opt-in, dedicated migrated PostgreSQL test DB only."""

import asyncio
import sys
from copy import deepcopy
from datetime import date
from pathlib import Path
from uuid import UUID

import httpx
import pytest
from sqlalchemy import delete, inspect
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.api.dependencies import (
    get_trusted_submission_context,
    require_ndss_access,
)
from app.core.config import Settings, get_settings
from app.db.session import build_database_url, get_db
from app.main import app
from app.models.diphtheria import DiphtheriaInvestigation
from app.validation.diphtheria import SubmissionContext
from tests.test_diphtheria_validation import complete_form


TEST_ENV_FILE = Path(__file__).resolve().parents[1] / ".env.test"


def run_async(coroutine):
    if sys.platform == "win32":
        with asyncio.Runner(
            loop_factory=asyncio.SelectorEventLoop
        ) as runner:
            return runner.run(coroutine)

    return asyncio.run(coroutine)


def test_create_get_replace_with_isolated_postgres() -> None:
    if not TEST_ENV_FILE.is_file():
        pytest.skip(
            "Create a dedicated .env.test before running PostgreSQL API tests."
        )

    test_settings = Settings(_env_file=TEST_ENV_FILE)
    dev_settings = get_settings()

    assert test_settings.db_name.endswith("_test")
    assert (
        test_settings.db_host,
        test_settings.db_port,
        test_settings.db_name,
    ) != (
        dev_settings.db_host,
        dev_settings.db_port,
        dev_settings.db_name,
    ), "Test DB must differ from the development DB."

    async def scenario() -> None:
        engine = create_async_engine(
            build_database_url(test_settings),
            pool_pre_ping=True,
        )
        factory = async_sessionmaker(
            engine,
            expire_on_commit=False,
        )
        created_id: UUID | None = None

        async def isolated_session():
            async with factory() as session:
                yield session

        # Overrides exist only inside this synthetic test.
        app.dependency_overrides[require_ndss_access] = lambda: None
        app.dependency_overrides[get_trusted_submission_context] = lambda: (
            SubmissionContext(
                date_of_birth=date(2010, 1, 1),
                today=date(2026, 11, 9),
            )
        )
        app.dependency_overrides[get_db] = isolated_session

        try:
            async with engine.connect() as connection:
                tables = await connection.run_sync(
                    lambda sync_conn: inspect(
                        sync_conn
                    ).get_table_names()
                )

                assert {
                    "diphtheria_investigations",
                    "diphtheria_antibiotic_therapies",
                } <= set(tables), (
                    "Apply Alembic migrations to the separate test database first."
                )

            async with httpx.AsyncClient(
                transport=httpx.ASGITransport(app=app),
                base_url="http://testserver",
            ) as client:
                data = complete_form()
                data["background"]["similarIllnessInFamily"] = None
                data["background"]["healthcareVisit"] = None

                base = "/api/v1/diphtheria/investigations"

                created = await client.post(base, json=data)
                assert created.status_code == 201, created.text

                created_id = UUID(created.json()["id"])
                assert created.json()["form"] == data
                etag = created.headers["ETag"]

                endpoint = f"{base}/{created_id}"

                got = await client.get(endpoint)
                assert got.status_code == 200
                assert got.json()["form"] == data

                updated = deepcopy(data)
                updated["vitals"]["temperature"] = "37.5"

                changed = await client.put(
                    endpoint,
                    json=updated,
                    headers={"If-Match": etag},
                )

                assert changed.status_code == 200, changed.text
                assert changed.json()["form"] == updated
                assert changed.headers["ETag"] != etag

                stale = await client.put(
                    endpoint,
                    json=data,
                    headers={"If-Match": etag},
                )
                assert stale.status_code == 412

                after = await client.get(endpoint)
                assert after.json()["form"] == updated

                # Bad dates cannot partially modify the saved investigation.
                invalid = deepcopy(updated)
                invalid["background"]["healthcareVisitDate"] = "31-02-2026"

                rejected = await client.put(
                    endpoint,
                    json=invalid,
                    headers={"If-Match": changed.headers["ETag"]},
                )
                assert rejected.status_code == 422

                unchanged = await client.get(endpoint)
                assert unchanged.json()["form"] == updated

        finally:
            # Delete only the synthetic record created in the isolated test DB.
            try:
                if created_id is not None:
                    async with factory() as session:
                        await session.execute(
                            delete(DiphtheriaInvestigation).where(
                                DiphtheriaInvestigation.id == created_id
                            )
                        )
                        await session.commit()
            finally:
                app.dependency_overrides.clear()
                await engine.dispose()

    run_async(scenario())
