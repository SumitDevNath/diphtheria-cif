
"""Privacy-safe endpoint contract tests; no database or patient records required."""

import asyncio
from datetime import date, datetime, timezone
from uuid import uuid4

import httpx
import pytest

from app.api.dependencies import (
    get_trusted_submission_context,
    require_ndss_access,
)
from app.db.session import get_db
from app.main import app
from app.models.diphtheria import DiphtheriaInvestigation
from app.schemas.diphtheria import DiphtheriaSubmitRequest
from app.services.diphtheria import (
    database_values,
    etag_for,
    make_antibiotic_rows,
    to_form,
    to_response,
)
from app.validation.diphtheria import (
    SubmissionContext,
    SubmissionValidationError,
)
from tests.test_diphtheria_validation import complete_form


def run_http(test):
    async def runner():
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app),
            base_url="http://testserver",
        ) as client:
            return await test(client)

    return asyncio.run(runner())


def override_external_dependencies() -> None:
    """Synthetic overrides for API contract tests only."""
    app.dependency_overrides[require_ndss_access] = lambda: None
    app.dependency_overrides[get_trusted_submission_context] = lambda: (
        SubmissionContext(
            date_of_birth=date(2010, 1, 1),
            today=date(2026, 11, 9),
        )
    )
    app.dependency_overrides[get_db] = lambda: None


def test_unconfigured_auth_denies_every_patient_endpoint() -> None:
    async def call(client):
        identifier = uuid4()
        base = "/api/v1/diphtheria/investigations"

        assert (
            await client.get(f"{base}/{identifier}")
        ).status_code == 503

        assert (
            await client.post(base, json=complete_form())
        ).status_code == 503

        assert (
            await client.put(
                f"{base}/{identifier}",
                json=complete_form(),
            )
        ).status_code == 503

    run_http(call)


def test_health_and_openapi_remain_public() -> None:
    async def call(client):
        assert (await client.get("/health")).json() == {"status": "ok"}

        paths = (await client.get("/openapi.json")).json()["paths"]
        assert "/api/v1/diphtheria/investigations" in paths

    run_http(call)


def test_validation_error_redacts_patient_values_after_gate_override() -> None:
    override_external_dependencies()

    try:
        async def call(client):
            payload = complete_form()
            payload["identification"]["motherName"] = "PRIVATE PATIENT NAME"
            payload["vitals"]["heartRate"] = 45

            result = await client.post(
                "/api/v1/diphtheria/investigations",
                json=payload,
            )

            assert result.status_code == 422
            assert "PRIVATE PATIENT NAME" not in result.text
            assert "vitals-heartRate" in result.json()["errors"]

        run_http(call)
    finally:
        app.dependency_overrides.clear()


def test_mapper_roundtrip_preserves_form_shape() -> None:
    payload = complete_form()
    payload["background"]["similarIllnessInFamily"] = None
    payload["background"]["healthcareVisit"] = None

    payload["treatment"]["antibioticsAdministered"] = "yes"
    payload["treatment"]["antibioticRows"] = [
        {
            "id": str(uuid4()),
            "medication": "Penicillin",
            "medicationOrigin": "predefined",
            "administrationRoute": "oral",
            "startDate": "09-11-2026",
            "endDate": "09-11-2026",
        },
        {
            "id": str(uuid4()),
            "medication": "CustomMed",
            "medicationOrigin": "custom",
            "administrationRoute": "iv",
            "startDate": "08-11-2026",
            "endDate": "09-11-2026",
        },
    ]

    form = DiphtheriaSubmitRequest.model_validate(payload)
    values = database_values(form)
    rows = make_antibiotic_rows(form)

    record = DiphtheriaInvestigation(
        **values,
        antibiotic_rows=rows,
    )

    record.id = uuid4()
    record.created_at = datetime.now(timezone.utc)
    record.updated_at = datetime.now(timezone.utc)

    assert to_form(record).model_dump(mode="json") == payload

    response = to_response(record)
    assert response.form.identification.examinationDate == "09-11-2026"
    assert etag_for(record).startswith('"')


def test_bad_medication_route_reports_row_field_without_echoing_data() -> None:
    override_external_dependencies()

    try:
        async def call(client):
            payload = complete_form()
            row = payload["treatment"]["antibioticRows"][0]
            row["administrationRoute"] = "PRIVATE-INVALID-ROUTE"

            result = await client.post(
                "/api/v1/diphtheria/investigations",
                json=payload,
            )

            assert result.status_code == 422
            assert (
                f"treatment-{row['id']}-administrationRoute"
                in result.json()["errors"]
            )
            assert "PRIVATE-INVALID-ROUTE" not in result.text

        run_http(call)
    finally:
        app.dependency_overrides.clear()


def test_service_rejects_dose_value_exceeding_postgres_integer_storage() -> None:
    payload = complete_form()

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
