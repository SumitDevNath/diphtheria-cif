
"""Diphtheria CIF wire models. Property names match the React context exactly."""

from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, JsonValue, field_validator


class WireModel(BaseModel):
    model_config = ConfigDict(extra="forbid", strict=True)


class FacilityOption(WireModel):
    id: str
    name: str


class CaseIdentification(WireModel):
    motherName: str
    occupation: str | None
    ethnicity: Literal["bengali", "tribal-national", "non-national"] | None
    pregnancyStatus: Literal["pregnant", "non-pregnant"] | None
    examinationDate: str
    schoolName: str


class Vitals(WireModel):
    heartRate: str
    respiratoryRate: str
    temperature: str
    temperatureUnit: Literal["C", "F"]
    bloodPressure: str
    oxygenSaturation: str
    avpu: Literal["alert", "voice", "pain", "unresponsive"] | None


class BackgroundInformation(WireModel):
    contactKnownCase: Literal["yes", "no", "unknown"] | None
    contactDetails: str
    householdSize: str
    caregiversTreated: str | None
    similarIllnessInFamily: Literal["yes", "no"] | None
    similarIllnessDetails: str
    healthcareVisit: Literal["yes", "no"] | None
    healthcareVisitDate: str
    healthcareFacility: FacilityOption | None
    travelHistory: JsonValue | None


class VaccinationHistory(WireModel):
    available: bool
    source: Literal["card", "history"] | None
    doses: int | None
    lastVaccinationDate: str


class ClinicalSelection(WireModel):
    selected: list[str]
    customOptions: list[str]
    otherSelected: bool
    otherDraft: str


class ClinicalDetails(WireModel):
    onsetDate: str
    symptoms: ClinicalSelection
    signs: ClinicalSelection
    complications: ClinicalSelection
    comorbidConditions: ClinicalSelection
    hospital: FacilityOption | None
    visitDate: str
    admissionDate: str
    hospitalRecordNumber: str


class AntibioticRow(WireModel):
    id: str
    medication: str
    medicationOrigin: Literal["predefined", "custom"] | None
    administrationRoute: Literal["oral", "iv", "im"] | None
    startDate: str
    endDate: str

    @field_validator("id")
    @classmethod
    def validate_row_uuid(cls, value: str) -> str:
        try:
            UUID(value)
        except (ValueError, AttributeError) as exc:
            raise ValueError("Antibiotic row ID must be a UUID.") from exc
        return value


class TreatmentInformation(WireModel):
    antibioticsAdministered: Literal["yes", "no"] | None
    antibioticRows: list[AntibioticRow]

    @field_validator("antibioticRows")
    @classmethod
    def unique_row_ids(
        cls, rows: list[AntibioticRow]
    ) -> list[AntibioticRow]:
        ids = [UUID(row.id) for row in rows]
        if len(ids) != len(set(ids)):
            raise ValueError("Antibiotic row IDs must be unique.")
        return rows


class DiphtheriaFormData(WireModel):
    identification: CaseIdentification
    vitals: Vitals
    background: BackgroundInformation
    vaccination: VaccinationHistory
    clinical: ClinicalDetails
    treatment: TreatmentInformation


class DiphtheriaDraftRequest(DiphtheriaFormData):
    """Accept structurally valid, potentially incomplete frontend state."""


class DiphtheriaSubmitRequest(DiphtheriaFormData):
    """Must additionally pass validate_submission() before any persistence."""


class DiphtheriaFormResponse(DiphtheriaFormData):
    """Serialize form data with the unchanged React JSON structure."""
