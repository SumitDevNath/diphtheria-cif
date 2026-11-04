import type {
  AntibioticRow,
  CaseIdentification,
  ClinicalSelection,
  DiphtheriaFormData,
  Ethnicity,
  FormSectionKey,
  Option,
  PregnancyStatus,
} from "../types/diphtheria.types";

export const SECTION_DEFINITIONS: ReadonlyArray<{
  id: FormSectionKey;
  title: string;
  number: string | null;
  phase: number;
}> = [
  {
    id: "identification",
    title: "More Case Identification / Demographic Details",
    number: null,
    phase: 3,
  },
  { id: "vitals", title: "Vitals", number: "02", phase: 4 },
  { id: "background", title: "Background Information", number: "03", phase: 5 },
  { id: "vaccination", title: "Vaccination History", number: null, phase: 6 },
  { id: "clinical", title: "Clinical Details", number: "04", phase: 7 },
  { id: "treatment", title: "Treatment Information", number: "05", phase: 8 },
];

/** Temporary suggestions only; confirm the official occupation list with NDSS. */
export const OCCUPATION_SUGGESTIONS: readonly string[] = [
  "Student",
  "Homemaker",
  "Farmer",
  "Business",
  "Service",
  "Unemployed",
];

/** Exact displayed choices from the provided Figma reference. */
export const ETHNICITY_OPTIONS: readonly Option<Ethnicity>[] = [
  { value: "bengali", label: "Bengali" },
  { value: "tribal-national", label: "Tribal & national" },
  { value: "non-national", label: "Non-National" },
];

export const PREGNANCY_STATUS_OPTIONS: readonly Option<PregnancyStatus>[] = [
  { value: "pregnant", label: "Pregnant" },
  { value: "non-pregnant", label: "Non-Pregnant" },
];

/** The Figma does not mark mandatory fields; set these after NDSS confirmation. */
export const IDENTIFICATION_REQUIRED = {
  motherName: false,
  occupation: false,
  ethnicity: false,
  pregnancyStatus: false,
  examinationDate: false,
  schoolName: false,
} as const satisfies Record<keyof CaseIdentification, boolean>;

export const IDENTIFICATION_FIELD_IDS = {
  motherName: "identification-motherName",
  occupation: "identification-occupation",
  ethnicity: "identification-ethnicity",
  pregnancyStatus: "identification-pregnancyStatus",
  examinationDate: "identification-examinationDate",
  schoolName: "identification-schoolName",
} as const satisfies Record<keyof CaseIdentification, string>;

export const YES_NO_OPTIONS: readonly Option<"yes" | "no">[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

export const YES_NO_UNKNOWN_OPTIONS: readonly Option<
  "yes" | "no" | "unknown"
>[] = [...YES_NO_OPTIONS, { value: "unknown", label: "Unknown" }];

export const MEDICATION_OPTIONS = [
  "Penicillin",
  "Erythromycin",
  "Azithromycin",
  "Steroids",
  "Other — specify",
] as const;

export const ADMINISTRATION_ROUTE_OPTIONS: readonly Option[] = [
  { value: "oral", label: "Oral" },
  { value: "iv", label: "IV (Intravenous)" },
  { value: "im", label: "IM (Intramuscular)" },
];

export function createEmptyAntibioticRow(): AntibioticRow {
  return {
    id: crypto.randomUUID(),
    medication: "",
    medicationOrigin: null,
    administrationRoute: null,
    startDate: "",
    endDate: "",
  };
}

export function createEmptyClinicalSelection(): ClinicalSelection {
  return {
    selected: [],
    customOptions: [],
    otherSelected: false,
    otherDraft: "",
  };
}

export function createInitialDiphtheriaData(): DiphtheriaFormData {
  return {
    identification: {
      motherName: "",
      occupation: null,
      ethnicity: null,
      pregnancyStatus: null,
      examinationDate: "",
      schoolName: "",
    },
    vitals: {
      heartRate: "",
      respiratoryRate: "",
      temperature: "",
      temperatureUnit: "C",
      bloodPressure: "",
      oxygenSaturation: "",
      avpu: null,
    },
    background: {
      contactKnownCase: null,
      contactDetails: "",
      householdSize: "",
      caregiversTreated: null,
      similarIllnessInFamily: null,
      similarIllnessDetails: "",
      healthcareVisit: null,
      healthcareVisitDate: "",
      healthcareFacility: null,
      travelHistory: null,
    },
    vaccination: {
      available: false,
      source: null,
      doses: null,
      lastVaccinationDate: "",
    },
    clinical: {
      onsetDate: "",
      symptoms: createEmptyClinicalSelection(),
      signs: createEmptyClinicalSelection(),
      complications: createEmptyClinicalSelection(),
      comorbidConditions: createEmptyClinicalSelection(),
      hospital: null,
      visitDate: "",
      admissionDate: "",
      hospitalRecordNumber: "",
    },
    treatment: {
      antibioticsAdministered: null,
      antibioticRows: [createEmptyAntibioticRow()],
    },
  };
}
