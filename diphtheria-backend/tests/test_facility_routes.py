
"""Synthetic facility-scoped FastAPI tests without database writes."""

import asyncio
from uuid import uuid4

import httpx

from app.api.dependencies import (
    get_trusted_submission_context,
    require_ndss_access,
)
from app.api.routes import diphtheria
from app.core.dghs_auth import FacilityPrincipal
from app.db.session import get_db
from app.main import app
from app.services.diphtheria import (
    InvestigationNotFound,
)

BASE = "/api/v1/diphtheria/investigations"

PRINCIPAL = FacilityPrincipal(
    id=2,
    role="facility",
    facility_id="47",
    is_active=True,
    status="active",
)


def request(method, path, **kwargs):
    async def send():
        async with httpx.AsyncClient(
            transport=httpx.ASGITransport(app=app),
            base_url="http://testserver",
        ) as client:
            return await client.request(
                method,
                path,
                **kwargs,
            )

    return asyncio.run(send())


def form():
    blank = {
        "selected": [],
        "customOptions": [],
        "otherSelected": False,
        "otherDraft": "",
    }

    return {
        "identification": {
            "motherName": "",
            "occupation": "Farmer",
            "ethnicity": "bengali",
            "pregnancyStatus": None,
            "examinationDate": "09-11-2026",
            "schoolName": "",
        },
        "vitals": {
            "heartRate": "0",
            "respiratoryRate": "0",
            "temperature": "0",
            "temperatureUnit": "C",
            "bloodPressure": "0/0",
            "oxygenSaturation": "0",
            "avpu": "alert",
        },
        "background": {
            "contactKnownCase": "no",
            "contactDetails": "",
            "householdSize": "",
            "caregiversTreated": None,
            "similarIllnessInFamily": None,
            "similarIllnessDetails": "",
            "healthcareVisit": None,
            "healthcareVisitDate": "",
            "healthcareFacility": None,
            "travelHistory": None,
        },
        "vaccination": {
            "available": False,
            "source": None,
            "doses": None,
            "lastVaccinationDate": "",
        },
        "clinical": {
            "onsetDate": "09-11-2026",
            "symptoms": {
                **blank,
                "selected": ["Fever"],
            },
            "signs": {
                **blank,
                "selected": ["Stridor"],
            },
            "complications": {
                **blank,
                "selected": ["Shock"],
            },
            "comorbidConditions": {
                **blank,
                "selected": ["Measles"],
            },
            "hospital": {
                "id": "h1",
                "name": "Test",
            },
            "visitDate": "09-11-2026",
            "admissionDate": "09-11-2026",
            "hospitalRecordNumber": "fake",
        },
        "treatment": {
            "antibioticsAdministered": "no",
            "antibioticRows": [
                {
                    "id": str(uuid4()),
                    "medication": "",
                    "medicationOrigin": None,
                    "administrationRoute": None,
                    "startDate": "",
                    "endDate": "",
                }
            ],
        },
    }


def override():
    app.dependency_overrides[
        require_ndss_access
    ] = lambda: PRINCIPAL

    app.dependency_overrides[
        get_db
    ] = lambda: object()


def cleanup():
    app.dependency_overrides.clear()


def test_missing_bearer_is_rejected():
    assert request(
        "GET",
        f"{BASE}/{uuid4()}",
    ).status_code == 401


def test_no_delete_route():
    assert request(
        "DELETE",
        f"{BASE}/{uuid4()}",
    ).status_code == 405


def test_get_passes_only_validated_facility(monkeypatch):
    override()
    seen = []

    async def fake(session, investigation_id, facility_id):
        seen.append(facility_id)
        raise InvestigationNotFound()

    monkeypatch.setattr(
        diphtheria,
        "retrieve_investigation",
        fake,
    )

    try:
        result = request(
            "GET",
            f"{BASE}/{uuid4()}",
        )
        assert result.status_code == 404
        assert seen == ["47"]
    finally:
        cleanup()


def test_write_requires_trusted_ndss_context():
    override()

    try:
        response = request(
            "POST",
            BASE,
            json=form(),
        )

        assert response.status_code == 503
    finally:
        cleanup()


def test_service_scopes_record_lookup_at_database_layer():
    from app.services.diphtheria import _fetch

    class FakeResult:
        def one_or_none(self):
            return None

    class FakeSession:
        def __init__(self):
            self.statement = None

        async def scalars(self, statement):
            self.statement = statement
            return FakeResult()

    async def check():
        session = FakeSession()

        try:
            await _fetch(
                session,
                uuid4(),
                "47",
            )
            assert False, "Expected unavailable record."
        except InvestigationNotFound:
            sql = str(session.statement)

            assert (
                "diphtheria_investigations.facility_id"
                in sql
            )
            assert (
                "diphtheria_investigations.id"
                in sql
            )

    asyncio.run(check())
