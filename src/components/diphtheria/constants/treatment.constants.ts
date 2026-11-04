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
  ADMINISTRATION_ROUTE_OPTIONS.map((option) => ({
    value: option.value as AdministrationRoute,
    label: option.label,
  }));

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

/**
 * Provisional validation requirements.
 * Confirm applicability with the NDSS clinical team.
 */
export const TREATMENT_REQUIRED = {
  antibioticsAdministered: true,
  medication: true,
  administrationRoute: true,
  startDate: true,
  endDate: false,
} as const;
