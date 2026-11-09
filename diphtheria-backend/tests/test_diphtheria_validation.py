
"""Contract tests derived from the uploaded TypeScript form and validators."""

from copy import deepcopy
from datetime import date
from uuid import uuid4

import pytest
from pydantic import ValidationError

from app.schemas.diphtheria import (
    DiphtheriaDraftRequest,
    DiphtheriaFormResponse,
    DiphtheriaSubmitRequest,
)
from app.utils.dates import format_dmy, parse_dmy
from app.validation.diphtheria import (
    SubmissionContext,
    SubmissionValidationError,
    format_request_errors,
    validate_submission,
)

TODAY = date(2026, 11, 9)


def initial_form() -> dict:
    blank = {
        "selected": [], "customOptions": [],
        "otherSelected": False, "otherDraft": "",
    }
    return {
        "identification": {
            "motherName": "", "occupation": None, "ethnicity": None,
            "pregnancyStatus": None, "examinationDate": "", "schoolName": "",
        },
        "vitals": {
            "heartRate": "", "respiratoryRate": "", "temperature": "",
            "temperatureUnit": "C", "bloodPressure": "",
            "oxygenSaturation": "", "avpu": None,
        },
        "background": {
            "contactKnownCase": None, "contactDetails": "", "householdSize": "",
            "caregiversTreated": None, "similarIllnessInFamily": "no",
            "similarIllnessDetails": "", "healthcareVisit": "no",
            "healthcareVisitDate": "", "healthcareFacility": None,
            "travelHistory": None,
        },
        "vaccination": {
            "available": False, "source": None, "doses": None,
            "lastVaccinationDate": "",
        },
        "clinical": {
            "onsetDate": "", "symptoms": deepcopy(blank),
            "signs": deepcopy(blank), "complications": deepcopy(blank),
            "comorbidConditions": deepcopy(blank),
            "hospital": None, "visitDate": "", "admissionDate": "",
            "hospitalRecordNumber": "",
        },
        "treatment": {
            "antibioticsAdministered": "no",
            "antibioticRows": [{
                "id": str(uuid4()), "medication": "", "medicationOrigin": None,
                "administrationRoute": None, "startDate": "", "endDate": "",
            }],
        },
    }


def complete_form() -> dict:
    data = initial_form()
    data["identification"].update({
        "occupation": "Student", "ethnicity": "bengali",
        "examinationDate": "09-11-2026", "schoolName": "Test School",
    })
    data["vitals"].update({
        "heartRate": "0", "respiratoryRate": "0", "temperature": "0",
        "bloodPressure": "0/0", "oxygenSaturation": "0", "avpu": "alert",
    })
    data["background"]["contactKnownCase"] = "no"
    data["clinical"].update({
        "onsetDate": "08-11-2026", "visitDate": "09-11-2026",
        "admissionDate": "09-11-2026", "hospitalRecordNumber": "TEST-ONLY",
        "hospital": {"id": "test-facility-001", "name": "Test facility"},
    })
    for group, name in (
        ("symptoms", "Fever"), ("signs", "Stridor"),
        ("complications", "Shock"), ("comorbidConditions", "Measles"),
    ):
        data["clinical"][group]["selected"] = [name]
    return data


def context(**kwargs) -> SubmissionContext:
    return SubmissionContext(date_of_birth=date(2010, 1, 1), today=TODAY, **kwargs)


def errors_for(payload: dict, *, ctx: SubmissionContext | None = None) -> dict[str, str]:
    request = DiphtheriaSubmitRequest.model_validate(payload)
    with pytest.raises(SubmissionValidationError) as exc:
        validate_submission(request, context=ctx or context())
    return exc.value.errors


def test_initial_frontend_state_is_accepted_as_draft() -> None:
    data = initial_form()
    data["identification"]["examinationDate"] = "1-"
    parsed = DiphtheriaDraftRequest.model_validate(data)
    assert parsed.model_dump(mode="json") == data


def test_complete_form_preserves_zero_and_dmy_dates() -> None:
    payload = complete_form()
    form = DiphtheriaSubmitRequest.model_validate(payload)
    validate_submission(form, context=context())
    assert form.vitals.heartRate == "0"
    assert DiphtheriaFormResponse.model_validate(form.model_dump()).model_dump(mode="json") == payload
    assert parse_dmy("29-02-2024") == date(2024, 2, 29)
    assert format_dmy(date(2024, 2, 29)) == "29-02-2024"
    assert parse_dmy("") is None


@pytest.mark.parametrize("invalid", ["31-02-2026", "2026-11-09", "9-11-2026", "10-11-2026"])
def test_date_rejects_bad_or_future_date(invalid: str) -> None:
    data = complete_form()
    data["clinical"]["onsetDate"] = invalid
    assert "clinical-onsetDate" in errors_for(data)


def test_school_name_is_conditional() -> None:
    payload = complete_form()
    payload["identification"]["schoolName"] = ""
    assert "identification-schoolName" in errors_for(payload)
    payload["identification"]["occupation"] = "Farmer"
    validate_submission(DiphtheriaSubmitRequest.model_validate(payload), context=context())


def test_adult_female_requires_pregnancy_status_and_mother_name() -> None:
    data = complete_form()
    ctx = SubmissionContext(date_of_birth=date(1990, 1, 1), sex="female", today=TODAY)
    errors = errors_for(data, ctx=ctx)
    assert "identification-pregnancyStatus" in errors
    assert "identification-motherName" in errors
    ctx_male = SubmissionContext(date_of_birth=date(1990, 1, 1), sex="male", today=TODAY)
    validate_submission(DiphtheriaSubmitRequest.model_validate(data), context=ctx_male)


def test_missing_trusted_demographics_fails_closed() -> None:
    assert "ndss-dateOfBirth" in errors_for(complete_form(), ctx=SubmissionContext(today=TODAY))


def test_background_contact_triggers_related_fields_and_travel_bridge() -> None:
    data = complete_form()
    data["background"]["contactKnownCase"] = "yes"
    errors = errors_for(data)
    assert "background-contactDetails" in errors
    assert "background-householdSize" in errors
    assert "background-travelHistory" in errors
    data["background"].update({"contactDetails": "Test-only contact", "householdSize": "0", "caregiversTreated": "0"})
    ctx = context(travel_validator=lambda value: None)
    validate_submission(DiphtheriaSubmitRequest.model_validate(data), context=ctx)


def test_travel_bridge_rejects_failed_validation_without_echoing_payload() -> None:
    data = complete_form()
    data["background"].update({"contactKnownCase": "yes", "contactDetails": "Test-only", "householdSize": "0", "travelHistory": {"sensitive": "example"}})
    errors = errors_for(data, ctx=context(travel_validator=lambda value: "Private patient data"))
    assert errors["background-travelHistory"] == "Travel History validation failed."


def test_vaccine_doses_zero_and_positive_requirements() -> None:
    data = complete_form()
    data["vaccination"].update({"available": True, "source": "card", "doses": 0})
    validate_submission(DiphtheriaSubmitRequest.model_validate(data), context=context())
    data["vaccination"]["doses"] = 1
    assert "vaccination-lastVaccinationDate" in errors_for(data)
    data["vaccination"]["lastVaccinationDate"] = "09-11-2026"
    validate_submission(DiphtheriaSubmitRequest.model_validate(data), context=context())


def test_medication_duplicates_and_dates() -> None:
    data = complete_form()
    row1 = {"id": str(uuid4()), "medication": "Penicillin", "medicationOrigin": "predefined", "administrationRoute": "oral", "startDate": "09-11-2026", "endDate": "08-11-2026"}
    row2 = {**row1, "id": str(uuid4()), "medication": "  Penicillin  "}
    data["treatment"] = {"antibioticsAdministered": "yes", "antibioticRows": [row1, row2]}
    errors = errors_for(data)
    assert f"treatment-{row1['id']}-medication" in errors
    assert f"treatment-{row2['id']}-medication" in errors
    assert f"treatment-{row1['id']}-endDate" in errors
    row1["endDate"] = row2["endDate"] = "09-11-2026"
    row2["medication"] = "Erythromycin"
    validate_submission(DiphtheriaSubmitRequest.model_validate(data), context=context())


def test_custom_clinical_option_must_be_saved_and_selected() -> None:
    data = complete_form()
    data["clinical"]["symptoms"].update({"otherSelected": True, "otherDraft": "Custom symptom"})
    assert "clinical-symptoms" in errors_for(data)
    data["clinical"]["symptoms"].update({
        "otherDraft": "", "customOptions": ["Custom symptom"],
        "selected": ["Fever", "Custom symptom"],
    })
    validate_submission(DiphtheriaSubmitRequest.model_validate(data), context=context())


def test_draft_rejects_wrong_types_and_unknown_fields() -> None:
    data = initial_form()
    data["vaccination"]["doses"] = True
    with pytest.raises(ValidationError) as exc:
        DiphtheriaDraftRequest.model_validate(data)
    field_errors = format_request_errors(exc.value, data)
    assert "vaccination-doses" in field_errors
    data = initial_form()
    data["background"]["inventedField"] = "x"
    with pytest.raises(ValidationError):
        DiphtheriaDraftRequest.model_validate(data)


def test_row_id_must_be_uuid_even_for_drafts() -> None:
    data = initial_form()
    data["treatment"]["antibioticRows"][0]["id"] = "no-uuid"
    with pytest.raises(ValidationError) as exc:
        DiphtheriaDraftRequest.model_validate(data)
    assert "treatment-antibioticRows" in format_request_errors(exc.value, data)


def test_duplicate_antibiotic_row_identifiers_rejected_in_draft() -> None:
    data = initial_form()
    data["treatment"]["antibioticRows"].append(deepcopy(data["treatment"]["antibioticRows"][0]))
    with pytest.raises(ValidationError):
        DiphtheriaDraftRequest.model_validate(data)
