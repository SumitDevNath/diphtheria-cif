import { REQUIRED_FIELDS } from "./required.constants";

import {
  MEDICATION_OPTIONS,
  ADMINISTRATION_ROUTE_OPTIONS,
} from "./form.constants";

import type { AdministrationRoute, Option } from "../types/diphtheria.types";

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
