import { REQUIRED_FIELDS } from "./required.constants";
import type { AVPU, Option, Vitals } from "../types/diphtheria.types";

export type VitalInputKey = Exclude<keyof Vitals, "temperatureUnit">;

export const VITALS_FIELD_IDS = {
  heartRate: "vitals-heartRate",
  respiratoryRate: "vitals-respiratoryRate",
  temperature: "vitals-temperature",
  temperatureNotMeasured: "vitals-temperatureNotMeasured",
  bloodPressure: "vitals-bloodPressure",
  bloodPressureNotMeasured: "vitals-bloodPressureNotMeasured",
  oxygenSaturation: "vitals-oxygenSaturation",
  oxygenSaturationNotMeasured: "vitals-oxygenSaturationNotMeasured",
  avpu: "vitals-avpu",
} as const satisfies Record<VitalInputKey, string>;

export const VITALS_REQUIRED = REQUIRED_FIELDS.vitals;

export const AVPU_OPTIONS: readonly Option<AVPU>[] = [
  { value: "alert", label: "Alert" },
  { value: "voice", label: "Voice response" },
  { value: "pain", label: "Pain response" },
  { value: "unresponsive", label: "Unresponsive" },
];

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
