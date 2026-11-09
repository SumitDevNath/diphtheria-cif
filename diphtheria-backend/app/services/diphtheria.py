
"""Async investigation persistence: mapping, transactions, and concurrency."""

from __future__ import annotations

import re
from copy import deepcopy
from datetime import date
from typing import Any
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.diphtheria import AntibioticTherapy, DiphtheriaInvestigation
from app.schemas.diphtheria import DiphtheriaSubmitRequest, DiphtheriaFormResponse
from app.schemas.investigation import InvestigationResponse
from app.utils.dates import format_dmy, parse_dmy
from app.validation.diphtheria import (
    SubmissionContext,
    SubmissionValidationError,
    validate_submission,
)

# All ordinary fields have an exact section_snake_case_column mapping.
SECTION_FIELDS: dict[str, tuple[str, ...]] = {
    "identification": (
        "motherName", "occupation", "ethnicity", "pregnancyStatus",
        "examinationDate", "schoolName",
    ),
    "vitals": (
        "heartRate", "respiratoryRate", "temperature", "temperatureUnit",
        "bloodPressure", "oxygenSaturation", "avpu",
    ),
    "background": (
        "contactKnownCase", "contactDetails", "householdSize", "caregiversTreated",
        "similarIllnessInFamily", "similarIllnessDetails", "healthcareVisit",
        "healthcareVisitDate",
    ),
    "vaccination": ("available", "source", "doses", "lastVaccinationDate"),
    "clinical": ("onsetDate", "visitDate", "admissionDate", "hospitalRecordNumber"),
    "treatment": ("antibioticsAdministered",),
}

DATE_FIELDS = frozenset({
    "identification-examinationDate", "background-healthcareVisitDate",
    "vaccination-lastVaccinationDate", "clinical-onsetDate",
    "clinical-visitDate", "clinical-admissionDate",
})

CLINICAL_GROUPS = (
    "symptoms", "signs", "complications", "comorbidConditions",
)


class InvestigationNotFound(Exception):
    pass


class InvestigationVersionConflict(Exception):
    pass


def column_name(section: str, field: str) -> str:
    snake = re.sub(r"(?<!^)(?=[A-Z])", "_", field).lower()
    return f"{section}_{snake}"


def db_date(value: str, field_id: str) -> date | None:
    try:
        return parse_dmy(value)
    except ValueError as exc:
        raise SubmissionValidationError(
            {field_id: "Enter a valid date (DD-MM-YYYY)."}
        ) from exc


def database_values(form: DiphtheriaSubmitRequest) -> dict[str, Any]:
    """Convert complete form values to typed ORM fields without normalizing nulls."""
    if form.vaccination.doses is not None and form.vaccination.doses > 2_147_483_647:
        raise SubmissionValidationError({
            "vaccination-doses": "The dose count exceeds the supported storage range."
        })

    values: dict[str, Any] = {}
    for section, fields in SECTION_FIELDS.items():
        state = getattr(form, section)
        for field in fields:
            value = getattr(state, field)
            field_id = f"{section}-{field}"
            values[column_name(section, field)] = (
                db_date(value, field_id) if field_id in DATE_FIELDS else value
            )

    for section, key in (
        ("background", "healthcareFacility"),
        ("clinical", "hospital"),
    ):
        facility = getattr(getattr(form, section), key)
        prefix = (
            f"{section}_"
            f"{'healthcare_facility' if section == 'background' else 'hospital'}"
        )
        values[f"{prefix}_id"] = facility.id if facility is not None else None
        values[f"{prefix}_name"] = facility.name if facility is not None else None

    values["background_travel_history"] = deepcopy(form.background.travelHistory)
    values["clinical_selections"] = {
        group: getattr(form.clinical, group).model_dump()
        for group in CLINICAL_GROUPS
    }
    return values


def make_antibiotic_rows(
    form: DiphtheriaSubmitRequest,
) -> list[AntibioticTherapy]:
    return [
        AntibioticTherapy(
            id=UUID(row.id),
            position=index,
            medication=row.medication,
            medication_origin=row.medicationOrigin,
            administration_route=row.administrationRoute,
            start_date=db_date(
                row.startDate,
                f"treatment-{row.id}-startDate",
            ),
            end_date=db_date(
                row.endDate,
                f"treatment-{row.id}-endDate",
            ),
        )
        for index, row in enumerate(form.treatment.antibioticRows)
    ]


def to_form(record: DiphtheriaInvestigation) -> DiphtheriaFormResponse:
    """Reassemble the exact nested React form contract."""
    form: dict[str, Any] = {}

    for section, fields in SECTION_FIELDS.items():
        section_values: dict[str, Any] = {}
        for field in fields:
            value = getattr(record, column_name(section, field))
            section_values[field] = (
                format_dmy(value)
                if f"{section}-{field}" in DATE_FIELDS
                else value
            )
        form[section] = section_values

    for section, key in (
        ("background", "healthcareFacility"),
        ("clinical", "hospital"),
    ):
        prefix = (
            f"{section}_"
            f"{'healthcare_facility' if section == 'background' else 'hospital'}"
        )
        facility_id = getattr(record, f"{prefix}_id")
        name = getattr(record, f"{prefix}_name")
        form[section][key] = (
            {"id": facility_id, "name": name}
            if facility_id is not None
            else None
        )

    form["background"]["travelHistory"] = deepcopy(
        record.background_travel_history
    )
    form["clinical"].update(deepcopy(record.clinical_selections))
    form["treatment"]["antibioticRows"] = [
        {
            "id": str(row.id),
            "medication": row.medication,
            "medicationOrigin": row.medication_origin,
            "administrationRoute": row.administration_route,
            "startDate": format_dmy(row.start_date),
            "endDate": format_dmy(row.end_date),
        }
        for row in sorted(record.antibiotic_rows, key=lambda row: row.position)
    ]

    return DiphtheriaFormResponse.model_validate(form)


def to_response(record: DiphtheriaInvestigation) -> InvestigationResponse:
    return InvestigationResponse(
        id=record.id,
        createdAt=record.created_at,
        updatedAt=record.updated_at,
        form=to_form(record),
    )


def etag_for(record: DiphtheriaInvestigation) -> str:
    """Strong timestamp token for conditional full replacement."""
    return f'"{record.updated_at.isoformat()}"'


async def _fetch(
    session: AsyncSession,
    investigation_id: UUID,
    *,
    lock: bool = False,
) -> DiphtheriaInvestigation:
    query = (
        select(DiphtheriaInvestigation)
        .where(DiphtheriaInvestigation.id == investigation_id)
        .options(selectinload(DiphtheriaInvestigation.antibiotic_rows))
    )

    if lock:
        query = query.with_for_update(of=DiphtheriaInvestigation)

    record = (await session.scalars(query)).one_or_none()

    if record is None:
        raise InvestigationNotFound()

    return record


async def retrieve_investigation(
    session: AsyncSession,
    investigation_id: UUID,
) -> DiphtheriaInvestigation:
    return await _fetch(session, investigation_id)


async def create_investigation(
    session: AsyncSession,
    form: DiphtheriaSubmitRequest,
    context: SubmissionContext,
) -> DiphtheriaInvestigation:
    validate_submission(form, context=context)

    values = database_values(form)
    rows = make_antibiotic_rows(form)

    record = DiphtheriaInvestigation(
        **values,
        antibiotic_rows=rows,
    )

    async with session.begin():
        session.add(record)
        await session.flush()

    return await _fetch(session, record.id)


async def replace_investigation(
    session: AsyncSession,
    investigation_id: UUID,
    form: DiphtheriaSubmitRequest,
    context: SubmissionContext,
    if_match: str,
) -> DiphtheriaInvestigation:
    validate_submission(form, context=context)

    values = database_values(form)
    rows = make_antibiotic_rows(form)

    async with session.begin():
        record = await _fetch(
            session,
            investigation_id,
            lock=True,
        )

        if if_match != etag_for(record):
            raise InvestigationVersionConflict()

        # Delete existing children before inserting replacements.
        # Both operations remain inside the same transaction.
        record.antibiotic_rows.clear()
        await session.flush()

        for name, value in values.items():
            setattr(record, name, value)

        record.antibiotic_rows.extend(rows)

        # PostgreSQL returns a new version timestamp on update.
        record.updated_at = func.clock_timestamp()
        await session.flush()

    return await _fetch(session, investigation_id)
