
"""Final-submission validation matching the authoritative React validation rules."""

import re
from dataclasses import dataclass
from datetime import date
from uuid import UUID
from typing import Callable

from pydantic import JsonValue, ValidationError

from app.schemas.diphtheria import (
    ClinicalSelection,
    DiphtheriaFormData,
    FacilityOption,
)
from app.utils.dates import local_today, parse_dmy
from app.validation.required import REQUIRED_FIELDS

TravelValidator = Callable[[JsonValue | None], str | None]

# Copy values from the current frontend constants (not clinical reference data).
CLINICAL_OPTIONS: dict[str, tuple[str, ...]] = {
    "symptoms": (
        "Fever", "Sore throat", "Difficulty swallowing", "Difficulty breathing",
        "Nasal regurgitation", "Bloody nasal discharge", "Ear discharge",
        "Drooling of saliva", "Change in voice", "Swollen neck", "Skin ulcers",
    ),
    "signs": (
        "Pseudomembrane", "Gross cervical lymphadenopathy", "Chest indrawing",
        "Fast breathing rate", "Stridor", "Central cyanosis", "Fast heart rate",
        "Decreased capillary refill (>3 s)", "Weakness", "Lethargy", "Restlessness",
    ),
    "complications": (
        "Respiratory distress", "Shock", "Irregular heart rate",
        "Peripheral neuritis/neuropathy", "Kidney failure",
        "Cutaneous necrotic lesions",
    ),
    "comorbidConditions": (
        "Malnutrition", "Measles", "Acute watery diarrhoea", "HIV suspected",
        "Tuberculosis suspected", "Jaundice", "Pregnancy",
    ),
}
PREDEFINED_MEDICATIONS = frozenset(
    ("Penicillin", "Erythromycin", "Azithromycin", "Steroids")
)
OTHER_MEDICATION = "Other — specify"
CAREGIVER_OPTIONS = frozenset(("0", "1", "2", "3", "3+"))
INTEGER_PATTERN = re.compile(r"\d+", re.ASCII)
UNSIGNED_DECIMAL = re.compile(r"(?:\d+(?:\.\d+)?|\.\d+)", re.ASCII)
SIGNED_DECIMAL = re.compile(r"-?(?:\d+(?:\.\d+)?|\.\d+)", re.ASCII)
BP_PATTERN = re.compile(r"(\d+)\s*/\s*(\d+)", re.ASCII)
SCHOOL_PATTERN = re.compile(r"\b(teacher|student)\b", re.IGNORECASE)


@dataclass(frozen=True)
class SubmissionContext:
    """Trusted NDSS demographic values; never read these from CIF JSON."""

    date_of_birth: date | None = None
    sex: str | None = None
    travel_validator: TravelValidator | None = None
    today: date | None = None  # Optional deterministic clock for tests.


class SubmissionValidationError(ValueError):
    """Safe field-level errors using the existing frontend DOM field IDs."""

    def __init__(self, errors: dict[str, str]) -> None:
        self.errors = errors
        super().__init__("Diphtheria investigation validation failed.")


def normalize(value: str) -> str:
    return " ".join(value.split()).lower()


def required(section: str, field: str) -> bool:
    return REQUIRED_FIELDS[section][field]


def format_request_errors(
    exc: ValidationError, payload: dict[str, object] | None = None
) -> dict[str, str]:
    """Map structural Pydantic errors to UI field IDs without echoing input."""
    errors: dict[str, str] = {}
    for issue in exc.errors(include_input=False, include_url=False):
        loc = issue["loc"]
        field_id = "form"
        if loc:
            section = str(loc[0])
            field_id = section
            if len(loc) > 1:
                if section == "treatment" and loc[1] == "antibioticRows":
                    field_id = "treatment-antibioticRows"
                    if len(loc) > 3 and isinstance(loc[2], int):
                        rows = (payload or {}).get("treatment")
                        if isinstance(rows, dict):
                            row_list = rows.get("antibioticRows")
                            if isinstance(row_list, list) and loc[2] < len(row_list):
                                row = row_list[loc[2]]
                                if isinstance(row, dict) and isinstance(row.get("id"), str):
                                    try:
                                        row_id = str(UUID(row["id"]))
                                        field_id = f"treatment-{row_id}-{loc[3]}"
                                    except ValueError:
                                        pass
                else:
                    field_id = f"{section}-{loc[1]}"
        errors.setdefault(field_id, "Invalid or missing field value.")
    return errors


def validate_submission(data: DiphtheriaFormData, *, context: SubmissionContext) -> None:
    """Validate a final CIF; draft schemas do not run these mandatory checks."""
    errors: dict[str, str] = {}
    today = context.today or local_today()

    def fail(field_id: str, message: str) -> None:
        errors.setdefault(field_id, message)

    def check_required(section: str, field: str, value: object, message: str) -> None:
        if required(section, field) and (
            value is None or isinstance(value, str) and not value.strip()
        ):
            fail(f"{section}-{field}", message)

    def check_date(field_id: str, value: str, is_required: bool) -> date | None:
        if not value.strip():
            if is_required:
                fail(field_id, "Date is required.")
            return None
        try:
            parsed = parse_dmy(value)
        except ValueError:
            fail(field_id, "Enter a valid date (DD-MM-YYYY).")
            return None
        if parsed is not None and parsed > today:
            fail(field_id, "Future dates are not allowed.")
        return parsed

    # Trusted shared NDSS demographics are necessary to evaluate conditions.
    birth = context.date_of_birth
    if birth is None or birth > today:
        fail("ndss-dateOfBirth", "Trusted NDSS date of birth is required.")
        adult_applicable = False
    else:
        age = today.year - birth.year - (
            (today.month, today.day) < (birth.month, birth.day)
        )
        sex = (context.sex or "").strip().lower()
        adult_applicable = age >= 18 and sex in ("", "female", "f")

    identification = data.identification
    check_required("identification", "occupation", identification.occupation,
                   "Select or enter an occupation.")
    check_required("identification", "ethnicity", identification.ethnicity,
                   "Select ethnicity.")
    check_date("identification-examinationDate", identification.examinationDate,
               required("identification", "examinationDate"))
    if identification.occupation and SCHOOL_PATTERN.search(identification.occupation.strip()):
        check_required("identification", "schoolName", identification.schoolName,
                       "School name is required for Teacher or Student.")
    if adult_applicable:
        check_required("identification", "pregnancyStatus", identification.pregnancyStatus,
                       "Select pregnancy status.")
        check_required("identification", "motherName", identification.motherName,
                       "Mother's name is required.")

    vitals = data.vitals
    for field, label, pattern in (
        ("heartRate", "Heart rate", INTEGER_PATTERN),
        ("respiratoryRate", "Respiratory rate", INTEGER_PATTERN),
        ("temperature", "Temperature", SIGNED_DECIMAL),
        ("oxygenSaturation", "O₂ saturation", UNSIGNED_DECIMAL),
    ):
        value = getattr(vitals, field).strip()
        field_id = f"vitals-{field}"
        if not value:
            check_required("vitals", field, value, f"{label} is required.")
        elif pattern.fullmatch(value) is None:
            fail(field_id, "Enter a valid numeric value.")
        else:
            try:
                number = float(value)
                if not (-float("inf") < number < float("inf")):
                    fail(field_id, "Enter a finite numeric value.")
                elif field == "oxygenSaturation" and not 0 <= number <= 100:
                    fail(field_id, "Enter a percentage from 0 to 100.")
            except (ValueError, OverflowError):
                fail(field_id, "Enter a valid numeric value.")
    bp = vitals.bloodPressure.strip()
    if not bp:
        check_required("vitals", "bloodPressure", bp, "Blood pressure is required.")
    elif BP_PATTERN.fullmatch(bp) is None:
        fail("vitals-bloodPressure", "Use systolic/diastolic (e.g., 120/80).")
    check_required("vitals", "avpu", vitals.avpu, "Select an AVPU response.")

    background = data.background
    check_required("background", "contactKnownCase", background.contactKnownCase,
                   "Select Yes, No or Unknown.")
    if background.contactKnownCase == "yes":
        check_required("background", "contactDetails", background.contactDetails,
                       "Contact details are required.")
        household = background.householdSize.strip()
        if not household:
            check_required("background", "householdSize", household,
                           "Enter the household count.")
        elif INTEGER_PATTERN.fullmatch(household) is None:
            fail("background-householdSize", "Enter a non-negative whole number.")
        caregivers = background.caregiversTreated
        if caregivers is None or caregivers not in CAREGIVER_OPTIONS:
            if required("background", "caregiversTreated") or caregivers is not None:
                fail("background-caregiversTreated", "Select the number of caregivers treated.")
        if background.similarIllnessInFamily == "yes":
            check_required("background", "similarIllnessDetails",
                           background.similarIllnessDetails,
                           "Provide details of the similar illness.")
        if background.healthcareVisit == "yes":
            check_date("background-healthcareVisitDate", background.healthcareVisitDate,
                       required("background", "healthcareVisitDate"))
            validate_facility(background.healthcareFacility,
                              "background-healthcareFacility", fail)
        if context.travel_validator is None:
            fail("background-travelHistory", "Travel History validation is not configured.")
        else:
            try:
                result = context.travel_validator(background.travelHistory)
                if result:
                    fail("background-travelHistory", "Travel History validation failed.")
            except Exception:
                fail("background-travelHistory", "Travel History could not be validated.")

    vaccination = data.vaccination
    if vaccination.available:
        check_required("vaccination", "source", vaccination.source,
                       "Select a vaccination source.")
        if vaccination.doses is None:
            if required("vaccination", "doses"):
                fail("vaccination-doses", "Select the number of doses.")
        elif not 0 <= vaccination.doses <= 2**53 - 1:
            fail("vaccination-doses", "Enter a valid non-negative dose count.")
        if vaccination.doses is not None and vaccination.doses > 0:
            check_date("vaccination-lastVaccinationDate", vaccination.lastVaccinationDate,
                       required("vaccination", "lastVaccinationDate"))

    clinical = data.clinical
    for field in ("onsetDate", "visitDate", "admissionDate"):
        check_date(f"clinical-{field}", getattr(clinical, field),
                   required("clinical", field))
    for group, options in CLINICAL_OPTIONS.items():
        validate_clinical_group(getattr(clinical, group), group, options, fail)
    validate_facility(clinical.hospital, "clinical-hospital", fail)
    check_required("clinical", "hospitalRecordNumber", clinical.hospitalRecordNumber,
                   "Hospital record number is required.")

    treatment = data.treatment
    if treatment.antibioticsAdministered == "yes":
        if not treatment.antibioticRows:
            fail("treatment-antibioticRows", "Add an antibiotic therapy record.")
        seen: dict[str, str] = {}
        for row in treatment.antibioticRows:
            med_id = f"treatment-{row.id}-medication"
            medication = row.medication.strip()
            if not medication:
                if required("treatment", "medication"):
                    message = ("Enter the custom medication name."
                               if row.medicationOrigin == "custom"
                               else "Select a medication.")
                    fail(med_id, message)
            elif medication == OTHER_MEDICATION or row.medicationOrigin is None:
                fail(med_id, "Specify the actual medication.")
            elif row.medicationOrigin == "predefined" and medication not in PREDEFINED_MEDICATIONS:
                fail(med_id, "Select a valid medication.")
            else:
                name = normalize(medication)
                if name in seen:
                    fail(seen[name], "This medication is duplicated.")
                    fail(med_id, "This medication is duplicated.")
                else:
                    seen[name] = med_id
            if row.administrationRoute is None and required("treatment", "administrationRoute"):
                fail(f"treatment-{row.id}-administrationRoute", "Select an administration route.")
            start = check_date(f"treatment-{row.id}-startDate", row.startDate,
                               required("treatment", "startDate"))
            end = check_date(f"treatment-{row.id}-endDate", row.endDate,
                             required("treatment", "endDate"))
            if start is not None and end is not None and end < start:
                fail(f"treatment-{row.id}-endDate", "End date cannot precede start date.")

    if errors:
        raise SubmissionValidationError(errors)


def validate_facility(
    value: FacilityOption | None, field_id: str,
    fail: Callable[[str, str], None]
) -> None:
    if value is None or not value.id.strip() or not value.name.strip():
        fail(field_id, "Select a valid healthcare facility.")


def validate_clinical_group(
    value: ClinicalSelection, group: str, options: tuple[str, ...],
    fail: Callable[[str, str], None]
) -> None:
    field_id = f"clinical-{group}"
    predefined = {normalize(item) for item in options}
    custom = [normalize(item) for item in value.customOptions]
    selected = [normalize(item) for item in value.selected]
    draft = normalize(value.otherDraft)
    if not all(custom) or len(custom) != len(set(custom)) or any(item in predefined for item in custom):
        fail(field_id, "Custom options must be unique.")
        return
    if not all(selected) or len(selected) != len(set(selected)):
        fail(field_id, "Remove duplicate selections.")
        return
    allowed = predefined | set(custom)
    if any(item not in allowed for item in selected):
        fail(field_id, "Remove invalid selections.")
        return
    if value.otherSelected:
        if draft:
            fail(field_id, "This Other value already exists." if draft in allowed
                 else "Add the entered Other value.")
            return
        if not any(item in selected for item in custom):
            fail(field_id, "Specify and add the Other value.")
            return
    if required("clinical", group) and not selected:
        label = "comorbid conditions" if group == "comorbidConditions" else group
        fail(field_id, f"Select at least one {label} option.")
