import {
  AVPU_OPTIONS,
  VITALS_FIELD_IDS as IDS,
  VITALS_REQUIRED as REQUIRED,
} from "../constants/vitals.constants";
import type {
  AVPU,
  DiphtheriaFormData,
  Vitals,
} from "../types/diphtheria.types";
import type { ValidationRule } from "./form.validation";

type NumericKey = "heartRate" | "respiratoryRate" | "oxygenSaturation";
type NumericFormat = "integer" | "unsignedDecimal" | "signedDecimal";

const NUMBER_PATTERNS: Record<NumericFormat, RegExp> = {
  integer: /^\d+$/,
  unsignedDecimal: /^(?:\d+(?:\.\d+)?|\.\d+)$/,
  signedDecimal: /^-?(?:\d+(?:\.\d+)?|\.\d+)$/,
};

function validateNumericValue(
  value: string,
  label: string,
  format: NumericFormat,
  required: boolean,
): string | null {
  const trimmed = value.trim();
  if (!trimmed) return required ? `${label} is required.` : null;
  if (!NUMBER_PATTERNS[format].test(trimmed)) {
    return format === "integer"
      ? "Enter a non-negative whole number."
      : "Enter a valid numeric value.";
  }
  return Number.isFinite(Number(trimmed))
    ? null
    : "Enter a finite numeric value.";
}

function numericRule(
  key: NumericKey,
  label: string,
  format: NumericFormat,
): ValidationRule {
  return {
    id: IDS[key],
    validate: ({ vitals }: DiphtheriaFormData) => {
      if (key === "oxygenSaturation" && vitals.oxygenSaturationNotMeasured)
        return null;
      const error = validateNumericValue(
        vitals[key],
        label,
        format,
        REQUIRED[key],
      );
      if (error) return error;
      if (key === "oxygenSaturation" && vitals.oxygenSaturation.trim()) {
        const percentage = Number(vitals.oxygenSaturation);
        if (percentage < 0 || percentage > 100)
          return "Enter a percentage from 0 to 100.";
      }
      return null;
    },
  };
}

function validateBloodPressure(vitals: Vitals): string | null {
  if (vitals.bloodPressureNotMeasured) return null;
  const value = vitals.bloodPressure.trim();
  if (!value)
    return REQUIRED.bloodPressure ? "Blood pressure is required." : null;
  const match = /^(\d+)\s*\/\s*(\d+)$/.exec(value);
  if (!match) return "Enter systolic/diastolic values (e.g., 120/80).";
  return null;
}

export const VITALS_VALIDATION_RULES: readonly ValidationRule[] = [
  numericRule("heartRate", "Heart rate", "integer"),
  numericRule("respiratoryRate", "Respiratory rate", "integer"),
  {
    id: IDS.temperature,
    validate: ({ vitals }) => {
      if (vitals.temperatureNotMeasured) return null;
      // Preserve support for old C-valued records while the UI converts them.
      if (vitals.temperatureUnit !== "C" && vitals.temperatureUnit !== "F") {
        return "Invalid temperature unit.";
      }
      return validateNumericValue(
        vitals.temperature,
        "Temperature",
        "signedDecimal",
        REQUIRED.temperature,
      );
    },
  },
  {
    id: IDS.bloodPressure,
    validate: ({ vitals }) => validateBloodPressure(vitals),
  },
  numericRule("oxygenSaturation", "O₂ saturation", "unsignedDecimal"),
  {
    id: IDS.avpu,
    validate: ({ vitals }) => {
      const choices: AVPU[] = Array.isArray(vitals.avpu)
        ? vitals.avpu
        : typeof vitals.avpu === "string"
          ? [vitals.avpu as AVPU]
          : [];
      if (choices.length === 0)
        return REQUIRED.avpu ? "Select at least one AVPU response." : null;
      if (
        new Set(choices).size !== choices.length ||
        choices.some(
          (choice) => !AVPU_OPTIONS.some((option) => option.value === choice),
        )
      ) {
        return "Select valid, non-duplicated AVPU responses.";
      }
      if (choices.includes("unresponsive") && choices.length > 1) {
        return "Unresponsive cannot be selected with another response.";
      }
      return null;
    },
  },
];
