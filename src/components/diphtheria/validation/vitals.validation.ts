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

function numericRule(
  key: NumericKey,
  label: string,
  format: NumericFormat,
): ValidationRule {
  return {
    id: IDS[key],
    validate: ({ vitals }: DiphtheriaFormData) => {
      const value = vitals[key].trim();

      if (!value) {
        return REQUIRED[key] ? `${label} is required.` : null;
      }

      if (!NUMBER_PATTERNS[format].test(value)) {
        return format === "integer"
          ? "Enter a non-negative whole number."
          : "Enter a valid numeric value.";
      }

      const numericValue = Number(value);

      if (!Number.isFinite(numericValue)) {
        return "Enter a finite numeric value.";
      }

      if (
        key === "oxygenSaturation" &&
        (numericValue < 0 || numericValue > 100)
      ) {
        return "Enter a percentage from 0 to 100.";
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
  numericRule("heartRate", "Heart rate", "integer"),
  numericRule("respiratoryRate", "Respiratory rate", "integer"),
  {
    id: IDS.temperature,
    validate: ({ vitals }) => {
      if (vitals.temperatureUnit !== "C" && vitals.temperatureUnit !== "F") {
        return "Select °C or °F.";
      }

      return numericRule(
        "temperature",
        "Temperature",
        "signedDecimal",
      ).validate({
        identification: {} as DiphtheriaFormData["identification"],
        vitals,
        background: {} as DiphtheriaFormData["background"],
        vaccination: {} as DiphtheriaFormData["vaccination"],
        clinical: {} as DiphtheriaFormData["clinical"],
        treatment: {} as DiphtheriaFormData["treatment"],
      });
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
      if (vitals.avpu === null) {
        return REQUIRED.avpu ? "Select an AVPU response." : null;
      }

      return AVPU_OPTIONS.some((option) => option.value === vitals.avpu)
        ? null
        : "Select a valid AVPU response.";
    },
  },
];
