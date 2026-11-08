import {
  IDENTIFICATION_FIELD_IDS as IDS,
  IDENTIFICATION_REQUIRED as REQUIRED,
} from "../constants/form.constants";

import {
  isSchoolOccupation,
  showAdultPregnancyFields,
} from "../utils/demographics.utils";

import { validateDateText } from "../utils/date.utils";
import type { ValidationRule } from "./form.validation";

interface CommonDemographics {
  dateOfBirth?: string | null;
  sex?: string | null;
}

export function createIdentificationValidationRules({
  dateOfBirth,
  sex,
}: CommonDemographics = {}): readonly ValidationRule[] {
  const adultFieldsApplicable = showAdultPregnancyFields(dateOfBirth, sex);

  return [
    {
      id: IDS.occupation,
      validate: ({ identification }) =>
        identification.occupation?.trim() || !REQUIRED.occupation
          ? null
          : "Select or enter an occupation.",
    },
    {
      id: IDS.ethnicity,
      validate: ({ identification }) =>
        identification.ethnicity || !REQUIRED.ethnicity
          ? null
          : "Select ethnicity.",
    },
    {
      id: IDS.examinationDate,
      validate: ({ identification }) => {
        if (!identification.examinationDate.trim()) {
          return REQUIRED.examinationDate
            ? "Examination date is required."
            : null;
        }

        return validateDateText(identification.examinationDate, {
          noFuture: true,
        });
      },
    },
    {
      id: IDS.schoolName,
      when: ({ identification }) =>
        isSchoolOccupation(identification.occupation),
      validate: ({ identification }) =>
        identification.schoolName.trim() || !REQUIRED.schoolName
          ? null
          : "School name is required for Teacher or Student.",
    },
    {
      id: IDS.pregnancyStatus,
      when: () => adultFieldsApplicable,
      validate: ({ identification }) =>
        identification.pregnancyStatus || !REQUIRED.pregnancyStatus
          ? null
          : "Select pregnancy status.",
    },
    {
      id: IDS.motherName,
      when: () => adultFieldsApplicable,
      validate: ({ identification }) =>
        identification.motherName.trim() || !REQUIRED.motherName
          ? null
          : "Mother's name is required.",
    },
  ];
}

// Retain this export for existing consumers.
export const IDENTIFICATION_VALIDATION_RULES =
  createIdentificationValidationRules();
