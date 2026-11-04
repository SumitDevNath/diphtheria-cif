import {
  AVPU_OPTIONS,
  VITALS_FIELD_IDS as IDS,
  VITALS_REQUIRED as REQUIRED,
} from "../constants/vitals.constants";

import type { DiphtheriaFormData, Vitals } from "../types/diphtheria.types";

import type { ValidationRule } from "./form.validation";

type NumericKey =
  | "heartRate"
  | "respiratoryRate"
  | "temperature"
  | "oxygenSaturation";

type NumericFormat = "integer" | "unsignedDecimal" | "signedDecimal";

const NUMBER_PATTERNS: Record<NumericFormat, RegExp> = {
  integer: /^\d+$/,
  unsignedDecimal: /^(?:\d+(?:\.\d+)?|\.\d+)$/,
  signedDecimal: /^-?(?:\d+(?:\.\d+)?|\.\d+)$/,
};

/**
 * Shared validation function.
 * Empty values are handled according to requiredness.
 * Numeric zero is preserved as a valid value.
 */
function validateNumericValue(
  value: string,
  label: string,
  format: NumericFormat,
  required: boolean,
): string | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return required ? `${label} is required.` : null;
  }

  if (!NUMBER_PATTERNS[format].test(trimmed)) {
    return format === "integer"
      ? "Enter a non-negative whole number."
      : "Enter a valid numeric value.";
  }

  if (!Number.isFinite(Number(trimmed))) {
    return "Enter a finite numeric value.";
  }

  return null;
}

function numericRule(
  key: NumericKey,
  label: string,
  format: NumericFormat,
): ValidationRule {
  return {
    id: IDS[key],

    validate: ({ vitals }: DiphtheriaFormData) => {
      const error = validateNumericValue(
        vitals[key],
        label,
        format,
        REQUIRED[key],
      );

      if (error) return error;

      // SpO₂ is a percentage.
      if (key === "oxygenSaturation" && vitals.oxygenSaturation.trim()) {
        const percentage = Number(vitals.oxygenSaturation.trim());

        if (percentage < 0 || percentage > 100) {
          return "Enter a percentage from 0 to 100.";
        }
      }

      return null;
    },
  };
}

function validateBloodPressure(vitals: Vitals): string | null {
  const value = vitals.bloodPressure.trim();

  if (!value) {
    return REQUIRED.bloodPressure ? "Blood pressure is required." : null;
  }

  const match = /^(\d+)\s*\/\s*(\d+)$/.exec(value);

  if (!match) {
    return "Use systolic/diastolic (e.g., 120/80).";
  }

  const systolic = Number(match[1]);
  const diastolic = Number(match[2]);

  if (!Number.isFinite(systolic) || !Number.isFinite(diastolic)) {
    return "Enter valid blood pressure numbers.";
  }

  return null;
}

export const VITALS_VALIDATION_RULES: readonly ValidationRule[] = [
  // HEART RATE
  numericRule("heartRate", "Heart rate", "integer"),

  // RESPIRATORY RATE
  numericRule("respiratoryRate", "Respiratory rate", "integer"),

  // TEMPERATURE
  {
    id: IDS.temperature,

    validate: ({ vitals }) => {
      if (vitals.temperatureUnit !== "C" && vitals.temperatureUnit !== "F") {
        return "Select °C or °F.";
      }

      return validateNumericValue(
        vitals.temperature,
        "Temperature",
        "signedDecimal",
        REQUIRED.temperature,
      );
    },
  },

  // BLOOD PRESSURE
  {
    id: IDS.bloodPressure,

    validate: ({ vitals }) => validateBloodPressure(vitals),
  },

  // OXYGEN SATURATION
  numericRule("oxygenSaturation", "O₂ saturation", "unsignedDecimal"),

  // AVPU
  {
    id: IDS.avpu,

    validate: ({ vitals }) => {
      if (vitals.avpu === null) {
        return REQUIRED.avpu ? "Select an AVPU response." : null;
      }

      const validResponse = AVPU_OPTIONS.some(
        (option) => option.value === vitals.avpu,
      );

      return validResponse ? null : "Select a valid AVPU response.";
    },
  },
];
