import { REQUIRED_FIELDS } from "./required.constants";

import {
  MEDICATION_OPTIONS,
  ADMINISTRATION_ROUTE_OPTIONS,
} from "./form.constants";

import type {
  AdministrationRoute,
  DATAdministrationMode,
  DATNotGivenReason,
  DATPreTreatment,
  DATSideEffect,
  DATTestResult,
  Option,
} from "../types/diphtheria.types";

export const OTHER_MEDICATION = "Other — specify";

export const PREDEFINED_MEDICATIONS: readonly string[] =
  MEDICATION_OPTIONS.filter((medication) => medication !== OTHER_MEDICATION);

export const ANTIBIOTIC_MEDICATION_OPTIONS: readonly string[] =
  MEDICATION_OPTIONS;

export const ANTIBIOTIC_ROUTE_OPTIONS: readonly Option<AdministrationRoute>[] =
  ADMINISTRATION_ROUTE_OPTIONS;

export const TREATMENT_FIELD_IDS = {
  antibioticsAdministered: "treatment-antibioticsAdministered",
  antibioticRows: "treatment-antibioticRows",
} as const;

export type AntibioticFieldKey =
  | "medication"
  | "administrationRoute"
  | "startDate"
  | "endDate";

export function antibioticFieldId(
  rowId: string,
  field: AntibioticFieldKey,
): string {
  return `treatment-${rowId}-${field}`;
}

export const TREATMENT_REQUIRED = REQUIRED_FIELDS.treatment;

export const DAT_FIELD_IDS = {
  informationAvailable: "treatment-dat-informationAvailable",
  given: "treatment-dat-given",
  notGivenReason: "treatment-dat-notGivenReason",
  sensitivityTestDone: "treatment-dat-sensitivityTestDone",
  testResult: "treatment-dat-testResult",
  preTreatmentGiven: "treatment-dat-preTreatmentGiven",
  preTreatments: "treatment-dat-preTreatments",
  otherPreTreatment: "treatment-dat-otherPreTreatment",
  manufacturer: "treatment-dat-manufacturer",
  batchLot: "treatment-dat-batchLot",
  administrationDate: "treatment-dat-administrationDate",
  administrationMode: "treatment-dat-administrationMode",
  doseUnits: "treatment-dat-doseUnits",
  sideEffectsOccurred: "treatment-dat-sideEffectsOccurred",
  sideEffects: "treatment-dat-sideEffects",
  otherSideEffect: "treatment-dat-otherSideEffect",
  infusionContinued: "treatment-dat-infusionContinued",
} as const;

export const DAT_REQUIRED = TREATMENT_REQUIRED.dat;

export const DAT_NOT_GIVEN_REASONS: readonly Option<DATNotGivenReason>[] = [
  { value: "not_available", label: "DAT not available" },
  { value: "referred", label: "Referred" },
];

export const DAT_TEST_RESULTS: readonly Option<DATTestResult>[] = [
  { value: "hypersensitive", label: "Hypersensitive" },
  { value: "no_reaction", label: "No reaction" },
];

export const DAT_PRETREATMENT_OPTIONS: readonly Option<DATPreTreatment>[] = [
  { value: "antihistamine", label: "Antihistamine" },
  { value: "steroid", label: "Steroid" },
  { value: "adrenaline", label: "Adrenaline" },
  { value: "other", label: "Other" },
];

export const DAT_ADMINISTRATION_MODES: readonly Option<DATAdministrationMode>[] =
  [
    { value: "iv", label: "IV" },
    { value: "im", label: "IM" },
  ];

export const DAT_SIDE_EFFECT_OPTIONS: readonly Option<DATSideEffect>[] = [
  { value: "anaphylaxis", label: "Anaphylaxis" },
  { value: "febrile_reaction", label: "Febrile reaction" },
  { value: "other", label: "Other" },
];
