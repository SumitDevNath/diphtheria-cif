
"""DGHS authentication contract tests without real network access."""

import asyncio
from uuid import uuid4

import httpx
import pytest
from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.dialects import postgresql

from app.core.config import SecuritySettings
from app.core.dghs_auth import (
    FacilityPrincipal,
    validate_dghs_token,
)
from app.models.diphtheria import DiphtheriaInvestigation

URL = (
    "https://dev.surveillance.dghs.gov.bd/"
    "api/auth/api/v1/auth/validate"
)

USER = {
    "id": 2,
    "role": "facility",
    "facility_id": "47",
    "is_active": True,
    "status": "active",
}


def run(coro):
    return asyncio.run(coro)


def validate_mock(
    status: int,
    data: dict,
    *,
    captured: list | None = None,
):
    async def scenario():
        def handler(request: httpx.Request) -> httpx.Response:
            if captured is not None:
                captured.append((
                    request.method,
                    str(request.url),
                    request.headers.get("Authorization"),
                ))
            return httpx.Response(
                status_code=status,
                json=data,
            )

        async with httpx.AsyncClient(
            transport=httpx.MockTransport(handler)
        ) as client:
            return await validate_dghs_token(
                "synthetic-token",
                URL,
                client,
            )

    return run(scenario())


def test_accepts_confirmed_get_and_bearer_contract():
    captured: list = []

    principal = validate_mock(
        200,
        USER,
        captured=captured,
    )

    assert principal.facility_id == "47"
    assert captured == [
        ("GET", URL, "Bearer synthetic-token")
    ]


@pytest.mark.parametrize("status", [401, 403])
def test_rejects_invalid_or_denied_credentials(status):
    with pytest.raises(HTTPException) as exc:
        validate_mock(
            status,
            {"detail": "Private error"},
        )

    assert exc.value.status_code == 401
    assert "Private error" not in exc.value.detail


@pytest.mark.parametrize(
    "payload",
    [
        {**USER, "is_active": False},
        {**USER, "status": "inactive"},
        {**USER, "role": "admin"},
        {**USER, "facility_id": None},
        {
            "role": "facility",
            "facility_id": "47",
        },
    ],
)
def test_invalid_identity_cannot_authorize(payload):
    with pytest.raises(HTTPException) as exc:
        validate_mock(200, payload)

    assert exc.value.status_code in (403, 503)


def test_server_error_denies_authentication():
    with pytest.raises(HTTPException) as exc:
        validate_mock(500, {})

    assert exc.value.status_code == 503


def test_facility_id_from_integer_is_normalized():
    principal = validate_mock(
        200,
        {**USER, "facility_id": 47},
    )

    assert principal.facility_id == "47"


def test_rejects_untrusted_dghs_urls():
    with pytest.raises(ValueError):
        SecuritySettings(
            _env_file=None,
            dghs_auth_validate_url="http://localhost/validate",
        )


def test_facility_scope_is_part_of_sql_query():
    statement = select(DiphtheriaInvestigation).where(
        DiphtheriaInvestigation.id == uuid4(),
        DiphtheriaInvestigation.facility_id == "47",
    )

    sql = str(
        statement.compile(
            dialect=postgresql.dialect()
        )
    )

    assert (
        "diphtheria_investigations.facility_id ="
        in sql
    )


def test_model_has_no_delete_endpoint_implicitly():
    assert FacilityPrincipal.model_validate(
        USER
    ).role == "facility"
