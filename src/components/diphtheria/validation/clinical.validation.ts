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

const normalize = (value: string): string =>
  value.trim().replace(/\s+/g, " ").toLowerCase();

function validateRequiredText(value: string, label: string): string | null {
  if (!value.trim()) {
    return `${label} is required.`;
  }

  return null;
}

function validateClinicalSelection(
  selection: ClinicalSelection,
  predefinedOptions: readonly string[],
  title: string,
  required: boolean,
): string | null {
  const predefined = new Set(predefinedOptions.map(normalize));

  const custom = selection.customOptions.map(normalize);
  const selected = selection.selected.map(normalize);
  const draft = normalize(selection.otherDraft);

  // Validate saved custom choices.
  if (
    custom.some((name) => name.length === 0) ||
    new Set(custom).size !== custom.length ||
    custom.some((name) => predefined.has(name))
  ) {
    return "Custom options must be unique.";
  }

  // Validate selected choices.
  if (
    selected.some((name) => name.length === 0) ||
    new Set(selected).size !== selected.length
  ) {
    return "Remove duplicate selections.";
  }

  const allowed = new Set([...predefined, ...custom]);

  if (selected.some((name) => !allowed.has(name))) {
    return "Remove invalid selections.";
  }

  // Other requires a saved, selected custom value.
  if (selection.otherSelected) {
    if (draft) {
      if (allowed.has(draft)) {
        return "This Other value already exists.";
      }

      return "Add the entered Other value.";
    }

    const selectedCustom = selected.some((name) => custom.includes(name));

    if (!selectedCustom) {
      return "Specify and add the Other value.";
    }
  }

  // Mandatory checkbox-group validation.
  if (required && selection.selected.length === 0) {
    return `Select at least one ${title.toLowerCase()} option.`;
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
    ({ key, title, options }): ValidationRule => ({
      id: IDS[key],

      validate: ({ clinical }: DiphtheriaFormData) =>
        validateClinicalSelection(clinical[key], options, title, REQUIRED[key]),
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
      REQUIRED.hospitalRecordNumber
        ? validateRequiredText(
            clinical.hospitalRecordNumber,
            "Hospital record number",
          )
        : clinical.hospitalRecordNumber.length > 0 &&
            !clinical.hospitalRecordNumber.trim()
          ? "Enter a valid record number."
          : null,
  },
];
