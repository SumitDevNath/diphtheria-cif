import {
  CLINICAL_FIELD_IDS as IDS,
  CLINICAL_GROUPS,
  CLINICAL_REQUIRED as REQUIRED,
} from "../constants/clinical.constants";
import type {
  ClinicalSelection,
  DiphtheriaFormData,
} from "../types/diphtheria.types";
import { validateDateText } from "../utils/date.utils";
import type { ValidationRule } from "./form.validation";

function validateOptionalText(
  value: string,
  required: boolean,
  label: string,
): string | null {
  if (!value) {
    return required ? `${label} is required.` : null;
  }

  return value.trim() ? null : "Enter a valid value.";
}

function validateClinicalSelection(
  selection: ClinicalSelection,
  predefinedOptions: readonly string[],
): string | null {
  const normalized = (value: string) => value.trim().toLocaleLowerCase();

  const predefined = new Set(predefinedOptions.map(normalized));

  const custom = selection.customOptions.map(normalized);
  const selected = selection.selected.map(normalized);

  if (
    custom.some((name) => !name) ||
    new Set(custom).size !== custom.length ||
    custom.some((name) => predefined.has(name))
  ) {
    return "Custom options must be unique.";
  }

  if (
    selected.some((name) => !name) ||
    new Set(selected).size !== selected.length
  ) {
    return "Remove duplicate selections.";
  }

  const allowed = new Set([...predefined, ...custom]);

  if (selected.some((name) => !allowed.has(name))) {
    return "Remove invalid selections.";
  }

  if (selection.otherSelected) {
    const hasSelectedCustom = selected.some((name) => custom.includes(name));

    if (!hasSelectedCustom) {
      return selection.otherDraft.trim()
        ? "Add the entered Other value."
        : "Specify and add the Other value.";
    }
  }

  return null;
}

function clinicalDateRule(
  id: string,
  key: "onsetDate" | "visitDate" | "admissionDate",
  required: boolean,
  label: string,
): ValidationRule {
  return {
    id,
    validate: ({ clinical }) => {
      const value = clinical[key];

      if (!value.trim()) {
        return required ? `${label} is required.` : null;
      }

      return validateDateText(value, {
        noFuture: true,
      });
    },
  };
}

export const CLINICAL_VALIDATION_RULES: readonly ValidationRule[] = [
  clinicalDateRule(
    IDS.onsetDate,
    "onsetDate",
    REQUIRED.onsetDate,
    "Date of onset",
  ),

  ...CLINICAL_GROUPS.map(
    ({ key, options }): ValidationRule => ({
      id: IDS[key],
      validate: ({ clinical }: DiphtheriaFormData) =>
        validateClinicalSelection(clinical[key], options),
    }),
  ),

  {
    id: IDS.hospital,
    validate: ({ clinical }) => {
      const facility = clinical.hospital;

      if (facility === null) {
        return REQUIRED.hospital ? "Select a hospital or facility." : null;
      }

      if (
        typeof facility.id !== "string" ||
        typeof facility.name !== "string" ||
        !facility.id.trim() ||
        !facility.name.trim()
      ) {
        return "Select a valid healthcare facility.";
      }

      return null;
    },
  },

  clinicalDateRule(
    IDS.visitDate,
    "visitDate",
    REQUIRED.visitDate,
    "Date of visit",
  ),

  clinicalDateRule(
    IDS.admissionDate,
    "admissionDate",
    REQUIRED.admissionDate,
    "Date of admission",
  ),

  {
    id: IDS.hospitalRecordNumber,
    validate: ({ clinical }) =>
      validateOptionalText(
        clinical.hospitalRecordNumber,
        REQUIRED.hospitalRecordNumber,
        "Hospital record number",
      ),
  },
];
