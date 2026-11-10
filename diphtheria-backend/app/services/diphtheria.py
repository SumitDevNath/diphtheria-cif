
"""Async Diphtheria persistence with server-derived facility authorization."""

from __future__ import annotations

import re
from copy import deepcopy
from datetime import date
from typing import Any
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.diphtheria import (
    AntibioticTherapy,
    DiphtheriaInvestigation,
)
from app.schemas.diphtheria import (
    DiphtheriaFormResponse,
    DiphtheriaSubmitRequest,
)
from app.schemas.investigation import InvestigationResponse
from app.utils.dates import format_dmy, parse_dmy
from app.validation.diphtheria import (
    SubmissionContext,
    SubmissionValidationError,
    validate_submission,
)


SECTION_FIELDS: dict[str, tuple[str, ...]] = {
    "identification": (
        "motherName",
        "occupation",
        "ethnicity",
        "pregnancyStatus",
        "examinationDate",
        "schoolName",
    ),
    "vitals": (
        "heartRate",
        "respiratoryRate",
        "temperature",
        "temperatureUnit",
        "bloodPressure",
        "oxygenSaturation",
        "avpu",
    ),
    "background": (
        "contactKnownCase",
        "contactDetails",
        "householdSize",
        "caregiversTreated",
        "similarIllnessInFamily",
        "similarIllnessDetails",
        "healthcareVisit",
        "healthcareVisitDate",
    ),
    "vaccination": (
        "available",
        "source",
        "doses",
        "lastVaccinationDate",
    ),
    "clinical": (
        "onsetDate",
        "visitDate",
        "admissionDate",
        "hospitalRecordNumber",
    ),
    "treatment": (
        "antibioticsAdministered",
    ),
}

DATE_FIELDS = frozenset({
    "identification-examinationDate",
    "background-healthcareVisitDate",
    "vaccination-lastVaccinationDate",
    "clinical-onsetDate",
    "clinical-visitDate",
    "clinical-admissionDate",
})

CLINICAL_GROUPS = (
    "symptoms",
    "signs",
    "complications",
    "comorbidConditions",
)


class InvestigationNotFound(Exception):
    pass


class InvestigationVersionConflict(Exception):
    pass


def column_name(section: str, field: str) -> str:
    snake = re.sub(
        r"(?<!^)(?=[A-Z])",
        "_",
        field,
    ).lower()
    return f"{section}_{snake}"


def db_date(value: str, field_id: str) -> date | None:
    try:
        return parse_dmy(value)
    except ValueError as exc:
        raise SubmissionValidationError({
            field_id: "Enter a valid date (DD-MM-YYYY)."
        }) from exc


def database_values(
    form: DiphtheriaSubmitRequest,
) -> dict[str, Any]:
    """Convert the existing React JSON to ORM fields."""

    if (
        form.vaccination.doses is not None
        and form.vaccination.doses > 2_147_483_647
    ):
        raise SubmissionValidationError({
            "vaccination-doses":
            "Dose count exceeds supported storage range."
        })

    values: dict[str, Any] = {}

    for section, fields in SECTION_FIELDS.items():
        state = getattr(form, section)

        for field in fields:
            value = getattr(state, field)
            field_id = f"{section}-{field}"

            values[column_name(section, field)] = (
                db_date(value, field_id)
                if field_id in DATE_FIELDS
                else value
            )

    for section, key, prefix in (
        (
            "background",
            "healthcareFacility",
            "background_healthcare_facility",
        ),
        (
            "clinical",
            "hospital",
            "clinical_hospital",
        ),
    ):
        facility = getattr(
            getattr(form, section),
            key,
        )

        values[f"{prefix}_id"] = (
            facility.id if facility else None
        )
        values[f"{prefix}_name"] = (
            facility.name if facility else None
        )

    values["background_travel_history"] = deepcopy(
        form.background.travelHistory
    )

    values["clinical_selections"] = {
        key: getattr(form.clinical, key).model_dump()
        for key in CLINICAL_GROUPS
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
        for index, row in enumerate(
            form.treatment.antibioticRows
        )
    ]


def to_form(
    record: DiphtheriaInvestigation,
) -> DiphtheriaFormResponse:
    """Reconstruct the original six-section React JSON."""

    form: dict[str, Any] = {}

    for section, fields in SECTION_FIELDS.items():
        values: dict[str, Any] = {}

        for field in fields:
            value = getattr(
                record,
                column_name(section, field),
            )

            values[field] = (
                format_dmy(value)
                if f"{section}-{field}" in DATE_FIELDS
                else value
            )

        form[section] = values

    for section, key, prefix in (
        (
            "background",
            "healthcareFacility",
            "background_healthcare_facility",
        ),
        (
            "clinical",
            "hospital",
            "clinical_hospital",
        ),
    ):
        identifier = getattr(
            record,
            f"{prefix}_id",
        )
        name = getattr(
            record,
            f"{prefix}_name",
        )

        form[section][key] = (
            {"id": identifier, "name": name}
            if identifier is not None
            else None
        )

    form["background"]["travelHistory"] = deepcopy(
        record.background_travel_history
    )

    form["clinical"].update(
        deepcopy(record.clinical_selections)
    )

    form["treatment"]["antibioticRows"] = [
        {
            "id": str(row.id),
            "medication": row.medication,
            "medicationOrigin": row.medication_origin,
            "administrationRoute": row.administration_route,
            "startDate": format_dmy(row.start_date),
            "endDate": format_dmy(row.end_date),
        }
        for row in sorted(
            record.antibiotic_rows,
            key=lambda row: row.position,
        )
    ]

    return DiphtheriaFormResponse.model_validate(form)


def to_response(
    record: DiphtheriaInvestigation,
) -> InvestigationResponse:
    return InvestigationResponse(
        id=record.id,
        createdAt=record.created_at,
        updatedAt=record.updated_at,
        form=to_form(record),
    )


def etag_for(record: DiphtheriaInvestigation) -> str:
    return f'"{record.updated_at.isoformat()}"'


async def _fetch(
    session: AsyncSession,
    investigation_id: UUID,
    facility_id: str,
    *,
    lock: bool = False,
) -> DiphtheriaInvestigation:
    """Fetch only records belonging to the authenticated facility."""

    query = (
        select(DiphtheriaInvestigation)
        .where(
            DiphtheriaInvestigation.id == investigation_id,
            DiphtheriaInvestigation.facility_id == facility_id,
        )
        .options(
            selectinload(
                DiphtheriaInvestigation.antibiotic_rows
            )
        )
    )

    if lock:
        query = query.with_for_update(
            of=DiphtheriaInvestigation
        )

    record = (
        await session.scalars(query)
    ).one_or_none()

    if record is None:
        # Same result for nonexistent, unassigned, and
        # other-facility investigations.
        raise InvestigationNotFound()

    return record


async def retrieve_investigation(
    session: AsyncSession,
    investigation_id: UUID,
    facility_id: str,
) -> DiphtheriaInvestigation:
    return await _fetch(
        session,
        investigation_id,
        facility_id,
    )


async def create_investigation(
    session: AsyncSession,
    form: DiphtheriaSubmitRequest,
    context: SubmissionContext,
    facility_id: str,
) -> DiphtheriaInvestigation:
    validate_submission(
        form,
        context=context,
    )

    values = database_values(form)
    rows = make_antibiotic_rows(form)

    record = DiphtheriaInvestigation(
        facility_id=facility_id,
        **values,
        antibiotic_rows=rows,
    )

    async with session.begin():
        session.add(record)
        await session.flush()

    return await _fetch(
        session,
        record.id,
        facility_id,
    )


async def replace_investigation(
    session: AsyncSession,
    investigation_id: UUID,
    form: DiphtheriaSubmitRequest,
    context: SubmissionContext,
    facility_id: str,
    if_match: str,
) -> DiphtheriaInvestigation:
    validate_submission(
        form,
        context=context,
    )

    values = database_values(form)
    rows = make_antibiotic_rows(form)

    async with session.begin():
        record = await _fetch(
            session,
            investigation_id,
            facility_id,
            lock=True,
        )

        if if_match != etag_for(record):
            raise InvestigationVersionConflict()

        record.antibiotic_rows.clear()
        await session.flush()

        for name, value in values.items():
            setattr(record, name, value)

        record.antibiotic_rows.extend(rows)
        record.updated_at = func.clock_timestamp()

        await session.flush()

    return await _fetch(
        session,
        investigation_id,
        facility_id,
    )
