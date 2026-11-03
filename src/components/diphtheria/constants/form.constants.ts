import type {
  AntibioticRow,
  ClinicalSelection,
  DiphtheriaFormData,
  FormSectionKey,
  Option,
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
