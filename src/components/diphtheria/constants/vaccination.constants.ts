import { REQUIRED_FIELDS } from "./required.constants";
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

export const VACCINATION_REQUIRED = REQUIRED_FIELDS.vaccination;

export const VACCINATION_SOURCE_OPTIONS: readonly Option<VaccinationSource>[] =
  [
    { value: "card", label: "By Card" },
    { value: "history", label: "History" },
  ];

/** Provisional options pending official NDSS confirmation. */
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
