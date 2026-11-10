
"""API contract tests without live DGHS calls or PostgreSQL writes."""

import asyncio
from datetime import date, datetime, timezone
from uuid import uuid4

import httpx
import pytest

from app.api.dependencies import (
    get_trusted_submission_context,
    require_ndss_access,
)
from app.core.dghs_auth import FacilityPrincipal
from app.db.session import get_db
from app.main import app
from app.models.diphtheria import DiphtheriaInvestigation
from app.schemas.diphtheria import DiphtheriaSubmitRequest
from app.services.diphtheria import (
    database_values,
    etag_for,
    make_antibiotic_rows,
    to_form,
)
from app.validation.diphtheria import (
    SubmissionContext,
    SubmissionValidationError,
)
from tests.test_facility_routes import form

BASE = "/api/v1/diphtheria/investigations"

PRINCIPAL = FacilityPrincipal(
    id=2,
    role="facility",
    facility_id="47",
    is_active=True,
    status="active",
)


def call(method, path, **kwargs):
    async def run():
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app),
            base_url="http://testserver",
        ) as client:
            return await client.request(
                method,
                path,
                **kwargs,
            )

    return asyncio.run(run())


def test_unconfigured_auth_denies_patient_endpoints():
    identifier = uuid4()

    assert call(
        "GET",
        f"{BASE}/{identifier}",
    ).status_code == 401

    assert call(
        "POST",
        BASE,
        json=form(),
    ).status_code == 401

    assert call(
        "PUT",
        f"{BASE}/{identifier}",
        json=form(),
    ).status_code == 401


def test_health_and_openapi_remain_public():
    assert call(
        "GET",
        "/health",
    ).json() == {"status": "ok"}

    paths = call(
        "GET",
        "/openapi.json",
    ).json()["paths"]

    assert BASE in paths


def test_structural_validation_errors_redact_patient_values():
    app.dependency_overrides[
        require_ndss_access
    ] = lambda: PRINCIPAL

    app.dependency_overrides[
        get_trusted_submission_context
    ] = lambda: SubmissionContext(
        date_of_birth=date(2010, 1, 1),
        today=date(2026, 11, 9),
    )

    app.dependency_overrides[
        get_db
    ] = lambda: None

    try:
        payload = form()
        payload["identification"]["motherName"] = (
            "PRIVATE PATIENT NAME"
        )
        payload["vitals"]["heartRate"] = 45

        result = call(
            "POST",
            BASE,
            json=payload,
        )

        assert result.status_code == 422
        assert "PRIVATE PATIENT NAME" not in result.text
        assert "vitals-heartRate" in result.json()["errors"]
    finally:
        app.dependency_overrides.clear()


def test_model_roundtrip_excludes_facility_owner_from_form_json():
    payload = form()
    form_model = DiphtheriaSubmitRequest.model_validate(payload)

    record = DiphtheriaInvestigation(
        facility_id="47",
        **database_values(form_model),
        antibiotic_rows=make_antibiotic_rows(form_model),
    )

    record.id = uuid4()
    record.created_at = datetime.now(timezone.utc)
    record.updated_at = datetime.now(timezone.utc)

    assert to_form(
        record
    ).model_dump(mode="json") == payload

    assert "facility_id" not in payload
    assert etag_for(record).startswith('"')


def test_integer_overflow_rejected_before_database_write():
    payload = form()
    payload["vaccination"].update({
        "available": True,
        "source": "card",
        "doses": 2_147_483_648,
        "lastVaccinationDate": "09-11-2026",
    })

    model = DiphtheriaSubmitRequest.model_validate(payload)

    with pytest.raises(SubmissionValidationError) as exc:
        database_values(model)

    assert "vaccination-doses" in exc.value.errors
