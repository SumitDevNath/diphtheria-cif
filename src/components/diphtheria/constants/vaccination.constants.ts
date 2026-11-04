import type {
  Option,
  VaccinationHistory,
  VaccinationSource,
} from "../types/diphtheria.types";

export const VACCINATION_FIELD_IDS = {
  available: "vaccination-available",
  source: "vaccination-source",
  doses: "vaccination-doses",
  lastVaccinationDate: "vaccination-lastVaccinationDate",
} as const satisfies Record<keyof VaccinationHistory, string>;

/**
 * Pending confirmation from the NDSS team.
 *
 * Source and dose count are required when vaccination
 * history is available.
 *
 * Last vaccination date is optional until the official
 * applicability requirements are confirmed.
 */
export const VACCINATION_REQUIRED = {
  source: true,
  doses: true,
  lastVaccinationDate: false,
} as const satisfies Record<
  Exclude<keyof VaccinationHistory, "available">,
  boolean
>;

export const VACCINATION_SOURCE_OPTIONS: readonly Option<VaccinationSource>[] =
  [
    { value: "card", label: "By Card" },
    { value: "history", label: "History" },
  ];

/**
 * Temporary dropdown range for frontend development.
 *
 * This is NOT an official NDSS dose-count limit.
 * Update the options after confirmation.
 */
const MAX_SUGGESTED_DOSES = 20;

export const VACCINATION_DOSE_OPTIONS: readonly Option<number>[] = Array.from(
  { length: MAX_SUGGESTED_DOSES + 1 },
  (_, value) => ({
    value,
    label: String(value),
  }),
);

export const VACCINATION_DOSE_LABEL =
  "Number of Diphtheria-containing vaccine doses received (DPT/Pentavalent/Td)";
