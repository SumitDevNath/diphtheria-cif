
"""Opt-in PostgreSQL test against an empty, isolated *_test database."""

import asyncio
import sys
from copy import deepcopy
from datetime import date
from pathlib import Path
from uuid import UUID

import httpx
import pytest
from sqlalchemy import delete, func, inspect, select
from sqlalchemy.ext.asyncio import (
    async_sessionmaker,
    create_async_engine,
)

from app.api.dependencies import (
    get_trusted_submission_context,
    require_ndss_access,
)
from app.core.config import Settings, get_settings
from app.core.dghs_auth import FacilityPrincipal
from app.db.session import build_database_url, get_db
from app.main import app
from app.models.diphtheria import DiphtheriaInvestigation
from app.validation.diphtheria import SubmissionContext
from tests.test_diphtheria_validation import complete_form


TEST_ENV_FILE = (
    Path(__file__).resolve().parents[1] / ".env.test"
)

BASE = "/api/v1/diphtheria/investigations"


def principal(facility_id: str) -> FacilityPrincipal:
    return FacilityPrincipal(
        id=2,
        role="facility",
        facility_id=facility_id,
        is_active=True,
        status="active",
    )


def test_crud_and_cross_facility_isolation():
    if not TEST_ENV_FILE.is_file():
        pytest.skip(
            "Dedicated .env.test is not configured."
        )

    test_settings = Settings(
        _env_file=TEST_ENV_FILE
    )
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
    )

    async def scenario():
        engine = create_async_engine(
            build_database_url(test_settings)
        )

        factory = async_sessionmaker(
            engine,
            expire_on_commit=False,
        )

        created_id: UUID | None = None

        async def test_db():
            async with factory() as session:
                yield session

        app.dependency_overrides[
            require_ndss_access
        ] = lambda: principal("47")

        app.dependency_overrides[
            get_trusted_submission_context
        ] = lambda: SubmissionContext(
            date_of_birth=date(2010, 1, 1),
            today=date(2026, 11, 9),
        )

        app.dependency_overrides[
            get_db
        ] = test_db

        try:
            async with engine.connect() as connection:
                tables = await connection.run_sync(
                    lambda conn: inspect(
                        conn
                    ).get_table_names()
                )

                assert {
                    "diphtheria_investigations",
                    "diphtheria_antibiotic_therapies",
                } <= set(tables)

                existing_count = (
                    await connection.execute(
                        select(func.count()).select_from(
                            DiphtheriaInvestigation
                        )
                    )
                ).scalar_one()

                assert existing_count == 0, (
                    "Test DB must initially contain no investigations."
                )

            async with httpx.AsyncClient(
                transport=httpx.ASGITransport(app=app),
                base_url="http://testserver",
            ) as client:
                payload = complete_form()

                payload["background"][
                    "similarIllnessInFamily"
                ] = None

                payload["background"][
                    "healthcareVisit"
                ] = None

                created = await client.post(
                    BASE,
                    json=payload,
                )

                assert created.status_code == 201, created.text

                created_id = UUID(
                    created.json()["id"]
                )

                assert created.json()["form"] == payload

                first_etag = created.headers["ETag"]
                path = f"{BASE}/{created_id}"

                async with factory() as session:
                    saved = await session.get(
                        DiphtheriaInvestigation,
                        created_id,
                    )

                    assert saved is not None
                    assert saved.facility_id == "47"

                owned_get = await client.get(path)
                assert owned_get.status_code == 200

                # Simulate a different DGHS facility.
                app.dependency_overrides[
                    require_ndss_access
                ] = lambda: principal("99")

                assert (
                    await client.get(path)
                ).status_code == 404

                assert (
                    await client.put(
                        path,
                        json=payload,
                        headers={
                            "If-Match": first_etag,
                        },
                    )
                ).status_code == 404

                # Restore the authorized facility.
                app.dependency_overrides[
                    require_ndss_access
                ] = lambda: principal("47")

                updated = deepcopy(payload)

                updated["vitals"]["temperature"] = "37.5"

                changed = await client.put(
                    path,
                    json=updated,
                    headers={
                        "If-Match": first_etag,
                    },
                )

                assert changed.status_code == 200, changed.text
                assert changed.json()["form"] == updated

                assert changed.headers["ETag"] != first_etag

                assert (
                    await client.put(
                        path,
                        json=payload,
                        headers={
                            "If-Match": first_etag,
                        },
                    )
                ).status_code == 412

                assert (
                    await client.get(path)
                ).json()["form"] == updated

                assert (
                    await client.delete(path)
                ).status_code == 405

        finally:
            try:
                if created_id is not None:
                    # Delete only this test's own synthetic record.
                    async with factory() as session:
                        await session.execute(
                            delete(
                                DiphtheriaInvestigation
                            ).where(
                                DiphtheriaInvestigation.id
                                == created_id
                            )
                        )

                        await session.commit()
            finally:
                app.dependency_overrides.clear()
                await engine.dispose()

    if sys.platform == "win32":
        with asyncio.Runner(
            loop_factory=asyncio.SelectorEventLoop
        ) as runner:
            runner.run(scenario())
    else:
        asyncio.run(scenario())
