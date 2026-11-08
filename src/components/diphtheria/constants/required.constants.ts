import type {
  BackgroundInformation,
  CaseIdentification,
  ClinicalDetails,
  VaccinationHistory,
  Vitals,
} from "../types/diphtheria.types";

/**
 * Single source of truth for mandatory fields.
 * A true value means required ONLY while the field is applicable/visible.
 * A false value permits empty input but does not allow malformed entered data.
 * Toggle switches are optional, and their dependent fields use conditional rules.
 * External NDSS Travel History fields have their own validation contract.
 */
type RequiredFieldsShape = {
  identification: Record<keyof CaseIdentification, boolean>;
  vitals: Record<Exclude<keyof Vitals, "temperatureUnit">, boolean>;
  background: Record<
    Exclude<keyof BackgroundInformation, "travelHistory">,
    boolean
  >;
  vaccination: Record<keyof VaccinationHistory, boolean>;
  clinical: Record<keyof ClinicalDetails, boolean>;
  treatment: Record<
    | "antibioticsAdministered"
    | "medication"
    | "administrationRoute"
    | "startDate"
    | "endDate",
    boolean
  >;
};

export const REQUIRED_FIELDS = {
  identification: {
    motherName: true,
    occupation: true,
    ethnicity: true,
    pregnancyStatus: true,
    examinationDate: true,
    schoolName: true,
  },
  vitals: {
    heartRate: true,
    respiratoryRate: true,
    temperature: true,
    bloodPressure: true,
    oxygenSaturation: true,
    avpu: true,
  },
  background: {
    contactKnownCase: true, // Yes/No/Unknown question, not an OFF-by-default toggle
    contactDetails: true,
    householdSize: true,
    caregiversTreated: true,
    similarIllnessInFamily: false, // toggle
    similarIllnessDetails: true,
    healthcareVisit: false, // toggle
    healthcareVisitDate: true,
    healthcareFacility: true,
  },
  vaccination: {
    available: false, // toggle
    source: true,
    doses: true,
    lastVaccinationDate: true,
  },
  clinical: {
    onsetDate: true,
    symptoms: true,
    signs: true,
    complications: true,
    comorbidConditions: true,
    hospital: true,
    visitDate: true,
    admissionDate: true,
    hospitalRecordNumber: true,
  },
  treatment: {
    antibioticsAdministered: false, // toggle
    medication: true,
    administrationRoute: true,
    startDate: true,
    endDate: true,
  },
} as const satisfies RequiredFieldsShape;
