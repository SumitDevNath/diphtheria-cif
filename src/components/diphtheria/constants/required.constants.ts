/**
 * Centralized field requirements.
 *
 * true  = mandatory when applicable
 * false = optional
 *
 * Conditional visibility is handled separately.
 */
export const REQUIRED_FIELDS = {
  identification: {
    occupation: true,
    ethnicity: true,
    examinationDate: true,
    pregnancyStatus: true,
    schoolName: true,
    motherName: true,
  },

  vaccination: {
    available: false, // Toggle
    source: true,
    doses: true,
    lastVaccinationDate: true,
  },

  background: {
    contactKnownCase: true,
    contactDetails: true,
    householdSize: true,
    caregiversTreated: true,

    similarIllnessInFamily: false, // Toggle
    similarIllnessDetails: true,

    healthcareVisit: false, // Toggle
    healthcareVisitDate: true,
    healthcareFacility: true,
  },

  clinical: {
    onsetDate: true,
  },

  treatment: {
    antibioticsAdministered: false, // Toggle

    medication: true,
    administrationRoute: true,
    startDate: true,
    endDate: true,
  },
} as const;
