
"""Mirrors frontend constants/required.constants.ts (2026-11-09 archive)."""

REQUIRED_FIELDS: dict[str, dict[str, bool]] = {
    "identification": {
        "motherName": True,
        "occupation": True,
        "ethnicity": True,
        "pregnancyStatus": True,
        "examinationDate": True,
        "schoolName": True,
    },
    "vitals": {
        "heartRate": True,
        "respiratoryRate": True,
        "temperature": True,
        "bloodPressure": True,
        "oxygenSaturation": True,
        "avpu": True,
    },
    "background": {
        "contactKnownCase": True,
        "contactDetails": True,
        "householdSize": True,
        "caregiversTreated": True,
        "similarIllnessInFamily": False,
        "similarIllnessDetails": True,
        "healthcareVisit": False,
        "healthcareVisitDate": True,
        "healthcareFacility": True,
    },
    "vaccination": {
        "available": False,
        "source": True,
        "doses": True,
        "lastVaccinationDate": True,
    },
    "clinical": {
        "onsetDate": True,
        "symptoms": True,
        "signs": True,
        "complications": True,
        "comorbidConditions": True,
        "hospital": True,
        "visitDate": True,
        "admissionDate": True,
        "hospitalRecordNumber": True,
    },
    "treatment": {
        "antibioticsAdministered": False,
        "medication": True,
        "administrationRoute": True,
        "startDate": True,
        "endDate": True,
    },
}
