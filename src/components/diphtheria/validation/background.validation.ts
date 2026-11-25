import {
  CAREGIVER_COUNT_OPTIONS,
  BACKGROUND_FIELD_IDS as IDS,
  BACKGROUND_REQUIRED as REQUIRED,
} from "../constants/background.constants";
import { validateDateText } from "../utils/date.utils";
import type { DiphtheriaFormData } from "../types/diphtheria.types";
import type { ValidationRule } from "./form.validation";

const contactIsYes = (data: DiphtheriaFormData): boolean =>
  data.background.contactKnownCase === "yes";

const validCount = (value: string): boolean => /^\d+$/.test(value.trim());

export const BACKGROUND_VALIDATION_RULES: readonly ValidationRule[] = [
  {
    id: IDS.contactKnownCase,
    validate: ({ background }) =>
      background.contactKnownCase || !REQUIRED.contactKnownCase
        ? null
        : "Select Yes, No or Unknown.",
  },
  {
    when: contactIsYes,
    validateFields: ({ background }) => {
      const errors: Record<string, string> = {};
      for (const contact of background.contacts ?? []) {
        if (contact.age.trim() && !/^\d+$/.test(contact.age.trim())) {
          errors[`background-contact-${contact.id}-age`] =
            "Enter a non-negative whole number for age.";
        }
      }
      return errors;
    },
  },
  {
    id: IDS.householdSize,
    when: contactIsYes,
    validate: ({ background }) => {
      if (!background.householdSize.trim()) {
        return REQUIRED.householdSize ? "Enter the household count." : null;
      }
      return validCount(background.householdSize)
        ? null
        : "Enter a non-negative whole number.";
    },
  },
  {
    id: IDS.caregiversTreated,
    when: contactIsYes,
    validate: ({ background }) =>
      !background.caregiversTreated && !REQUIRED.caregiversTreated
        ? null
        : CAREGIVER_COUNT_OPTIONS.includes(background.caregiversTreated ?? "")
          ? null
          : "Select the number of caregivers treated.",
  },
  {
    id: IDS.similarIllnessDetails,
    when: ({ background }) =>
      background.contactKnownCase === "yes" &&
      background.similarIllnessInFamily === "yes" &&
      background.caregiversTreated !== null &&
      background.caregiversTreated !== "",
    validate: ({ background }) =>
      background.similarIllnessDetails.trim() || !REQUIRED.similarIllnessDetails
        ? null
        : "Provide details of the similar illness.",
  },
  {
    id: IDS.healthcareVisitDate,
    when: ({ background }) =>
      background.contactKnownCase === "yes" &&
      background.healthcareVisit === "yes",
    validate: ({ background }) => {
      if (!background.healthcareVisitDate.trim()) {
        return REQUIRED.healthcareVisitDate
          ? "Date of visit is required."
          : null;
      }
      return validateDateText(background.healthcareVisitDate, {
        noFuture: true,
      });
    },
  },
  {
    id: IDS.healthcareFacility,
    when: ({ background }) =>
      background.contactKnownCase === "yes" &&
      background.healthcareVisit === "yes",
    validate: ({ background }) => {
      const facility = background.healthcareFacility;

      return (facility?.id && facility.name.trim()) ||
        (!facility && !REQUIRED.healthcareFacility)
        ? null
        : "Select a healthcare facility.";
    },
  },
];
