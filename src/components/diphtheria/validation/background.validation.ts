import {
  BACKGROUND_FIELD_IDS as IDS,
  BACKGROUND_REQUIRED as REQUIRED,
} from "../constants/background.constants";
import type {
  DiphtheriaFormData,
  YesNo,
  YesNoUnknown,
} from "../types/diphtheria.types";
import { validateDateText } from "../utils/date.utils";
import type { ValidationRule } from "./form.validation";

const validYesNo = (value: YesNo): boolean => value === "yes" || value === "no";

const validYesNoUnknown = (value: YesNoUnknown): boolean =>
  value === "yes" || value === "no" || value === "unknown";

const contactIsYes = ({ background }: DiphtheriaFormData): boolean =>
  background.contactKnownCase === "yes";

const familyIllnessIsYes = ({ background }: DiphtheriaFormData): boolean =>
  background.contactKnownCase === "yes" &&
  background.similarIllnessInFamily === "yes";

const healthcareVisitIsYes = ({ background }: DiphtheriaFormData): boolean =>
  background.contactKnownCase === "yes" && background.healthcareVisit === "yes";

function validateCount(value: string | null, required: boolean): string | null {
  if (value === null || value.trim() === "") {
    return required ? "Enter a number." : null;
  }

  if (!/^\d+$/.test(value.trim())) {
    return "Enter a non-negative whole number.";
  }

  if (!Number.isSafeInteger(Number(value.trim()))) {
    return "Enter a smaller whole number.";
  }

  return null;
}

function validateDetails(value: string, required: boolean): string | null {
  if (!value.trim()) {
    if (!value) {
      return required ? "Enter details." : null;
    }

    return "Enter valid details.";
  }

  return null;
}

export const BACKGROUND_VALIDATION_RULES: readonly ValidationRule[] = [
  // Question 1 is always visible.
  {
    id: IDS.contactKnownCase,
    validate: ({ background }) => {
      const value = background.contactKnownCase;

      if (value === null) {
        return REQUIRED.contactKnownCase ? "Select Yes, No, or Unknown." : null;
      }

      return validYesNoUnknown(value) ? null : "Select a valid response.";
    },
  },

  // Question 1 dependent details.
  {
    id: IDS.contactDetails,
    when: contactIsYes,
    validate: ({ background }) =>
      validateDetails(background.contactDetails, REQUIRED.contactDetails),
  },

  // Question 2: visible only when Question 1 is Yes.
  {
    id: IDS.householdSize,
    when: contactIsYes,
    validate: ({ background }) =>
      validateCount(background.householdSize, REQUIRED.householdSize),
  },

  // Question 3: visible only when Question 1 is Yes.
  {
    id: IDS.caregiversTreated,
    when: contactIsYes,
    validate: ({ background }) =>
      validateCount(background.caregiversTreated, REQUIRED.caregiversTreated),
  },

  // Question 4: visible only when Question 1 is Yes.
  {
    id: IDS.similarIllnessInFamily,
    when: contactIsYes,
    validate: ({ background }) => {
      const value = background.similarIllnessInFamily;

      if (value === null) {
        return REQUIRED.similarIllnessInFamily ? "Select Yes or No." : null;
      }

      return validYesNo(value) ? null : "Select a valid response.";
    },
  },

  // Question 4 dependent details.
  {
    id: IDS.similarIllnessDetails,
    when: familyIllnessIsYes,
    validate: ({ background }) =>
      validateDetails(
        background.similarIllnessDetails,
        REQUIRED.similarIllnessDetails,
      ),
  },

  // Question 5: visible only when Question 1 is Yes.
  {
    id: IDS.healthcareVisit,
    when: contactIsYes,
    validate: ({ background }) => {
      const value = background.healthcareVisit;

      if (value === null) {
        return REQUIRED.healthcareVisit ? "Select Yes or No." : null;
      }

      return validYesNo(value) ? null : "Select a valid response.";
    },
  },

  // Question 5 dependent date.
  {
    id: IDS.healthcareVisitDate,
    when: healthcareVisitIsYes,
    validate: ({ background }) => {
      const value = background.healthcareVisitDate;

      if (!value.trim()) {
        return REQUIRED.healthcareVisitDate
          ? "Date of visit is required."
          : null;
      }

      return validateDateText(value, {
        noFuture: true,
      });
    },
  },

  // Question 5 dependent facility.
  {
    id: IDS.healthcareFacility,
    when: healthcareVisitIsYes,
    validate: ({ background }) => {
      const facility = background.healthcareFacility;

      if (facility === null) {
        return REQUIRED.healthcareFacility
          ? "Select a healthcare facility."
          : null;
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
];
