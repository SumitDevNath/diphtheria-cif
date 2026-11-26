import type {
  BackgroundInformation,
  CaseIdentification,
  ClinicalDetails,
  DATInformation,
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
  > & { dat: Record<keyof DATInformation, boolean> };
};

export const REQUIRED_FIELDS = {
  identification: {
    motherName: true,
    occupation: true,
    ethnicity: true,
    pregnancyStatus: true,
    examinationDate: false, // Relocated to the common NDSS form; not displayed here.
    schoolName: true,
  },
  vitals: {
    heartRate: true,
    respiratoryRate: true,
    temperature: true,
    temperatureNotMeasured: false,
    bloodPressure: true,
    bloodPressureNotMeasured: false,
    oxygenSaturation: true,
    oxygenSaturationNotMeasured: false,
    avpu: true,
  },
  background: {
    contactKnownCase: true, // Yes/No/Unknown question, not an OFF-by-default toggle
    contactDetails: false, // legacy field, no longer rendered
    contacts: false, // contacts may be left blank; entered age still checked
    householdSize: true,
    caregiversTreated: false,
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
    hospitalVisitAvailable: false, // toggle
    hospital: true,
    visitDate: true,
    admissionDate: false,
    hospitalRecordNumber: false,
  },
  treatment: {
    antibioticsAdministered: false, // toggle
    medication: true,
    administrationRoute: true,
    startDate: false,
    endDate: false,
    dat: {
      informationAvailable: false, // optional section toggle
      given: true, // required only when DAT information is available
      notGivenReason: false,
      sensitivityTestDone: false, // toggle
      testResult: false,
      preTreatmentGiven: false, // toggle
      preTreatments: false,
      otherPreTreatment: false,
      manufacturer: false,
      batchLot: false,
      administrationDate: false,
      administrationMode: false,
      doseUnits: false,
      sideEffectsOccurred: false, // toggle
      sideEffects: false,
      otherSideEffect: false,
      infusionContinued: false, // Yes/No question
    },
  },
} as const satisfies RequiredFieldsShape;
