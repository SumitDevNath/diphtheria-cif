import {
  ETHNICITY_OPTIONS,
  IDENTIFICATION_FIELD_IDS as IDS,
  IDENTIFICATION_REQUIRED as REQUIRED,
  PREGNANCY_STATUS_OPTIONS,
} from "../constants/form.constants";
import type { DiphtheriaFormData, Option } from "../types/diphtheria.types";
import { validateDateText } from "../utils/date.utils";
import type { ValidationRule } from "./form.validation";

function textRule(
  id: string,
  select: (data: DiphtheriaFormData) => string | null,
  required: boolean,
): ValidationRule {
  return {
    id,
    validate: (data) => {
      const value = select(data);

      if (value === null || value === "") {
        return required ? "This field is required." : null;
      }

      return value.trim() ? null : "Enter a valid value.";
    },
  };
}

function optionRule<T extends string>(
  id: string,
  select: (data: DiphtheriaFormData) => T | null,
  options: readonly Option<T>[],
  required: boolean,
): ValidationRule {
  return {
    id,
    validate: (data) => {
      const value = select(data);

      if (value === null) {
        return required ? "Please select an option." : null;
      }

      return options.some((option) => option.value === value)
        ? null
        : "Select a valid option.";
    },
  };
}

export const IDENTIFICATION_VALIDATION_RULES: readonly ValidationRule[] = [
  textRule(
    IDS.motherName,
    (data) => data.identification.motherName,
    REQUIRED.motherName,
  ),
  textRule(
    IDS.occupation,
    (data) => data.identification.occupation,
    REQUIRED.occupation,
  ),
  optionRule(
    IDS.ethnicity,
    (data) => data.identification.ethnicity,
    ETHNICITY_OPTIONS,
    REQUIRED.ethnicity,
  ),
  optionRule(
    IDS.pregnancyStatus,
    (data) => data.identification.pregnancyStatus,
    PREGNANCY_STATUS_OPTIONS,
    REQUIRED.pregnancyStatus,
  ),
  {
    id: IDS.examinationDate,
    validate: ({ identification }) => {
      if (!identification.examinationDate.trim()) {
        return REQUIRED.examinationDate
          ? "Date of examination is required."
          : null;
      }

      return validateDateText(identification.examinationDate, {
        noFuture: true,
      });
    },
  },
  textRule(
    IDS.schoolName,
    (data) => data.identification.schoolName,
    REQUIRED.schoolName,
  ),
];
