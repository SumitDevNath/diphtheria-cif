import type { AVPU, Option, Vitals } from "../types/diphtheria.types";

export type VitalInputKey = Exclude<keyof Vitals, "temperatureUnit">;

export const VITALS_FIELD_IDS = {
  heartRate: "vitals-heartRate",
  respiratoryRate: "vitals-respiratoryRate",
  temperature: "vitals-temperature",
  bloodPressure: "vitals-bloodPressure",
  oxygenSaturation: "vitals-oxygenSaturation",
  avpu: "vitals-avpu",
} as const satisfies Record<VitalInputKey, string>;

/**
 * Pending confirmation from the NDSS/clinical team.
 * Changing a field to true activates required-field validation.
 */
export const VITALS_REQUIRED = {
  heartRate: false,
  respiratoryRate: false,
  temperature: false,
  bloodPressure: false,
  oxygenSaturation: false,
  avpu: false,
} as const satisfies Record<VitalInputKey, boolean>;

export const AVPU_OPTIONS: readonly Option<AVPU>[] = [
  { value: "alert", label: "Alert" },
  { value: "voice", label: "Responds to Voice" },
  { value: "pain", label: "Responds to Pain" },
  { value: "unresponsive", label: "Unresponsive" },
];

/**
 * Shared numeric field configuration.
 * The input values remain strings to support partial typing.
 */
export const NUMERIC_VITAL_FIELDS = {
  heartRate: {
    label: "Heart rate",
    placeholder: "Beats per minute",
    unit: "bpm",
    decimal: false,
  },
  respiratoryRate: {
    label: "Respiratory Rate",
    placeholder: "Breaths per minute",
    unit: "breaths/min",
    decimal: false,
  },
  oxygenSaturation: {
    label: "O₂ saturation",
    placeholder: "Percentage",
    unit: "%",
    decimal: true,
  },
} as const;

export type NumericVitalKey = keyof typeof NUMERIC_VITAL_FIELDS;
