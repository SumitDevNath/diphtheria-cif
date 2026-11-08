import { BACKGROUND_FIELD_IDS as IDS } from "../constants/background.constants";
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
      background.contactKnownCase ? null : "Select Yes, No or Unknown.",
  },
  {
    id: IDS.contactDetails,
    when: contactIsYes,
    validate: ({ background }) =>
      background.contactDetails.trim() ? null : "Contact details are required.",
  },
  {
    id: IDS.householdSize,
    when: contactIsYes,
    validate: ({ background }) => {
      if (!background.householdSize.trim()) {
        return "Enter the household count.";
      }
      return validCount(background.householdSize)
        ? null
        : "Enter a non-negative whole number.";
    },
  },
  {
    id: IDS.caregiversTreated,
    when: contactIsYes,
    validate: ({ background }) => {
      const count = background.caregiversTreated;
      if (count === null || count.trim() === "") {
        return "Select the number of caregivers treated.";
      }
      return validCount(count) ? null : "Select a valid count.";
    },
  },
  {
    id: IDS.similarIllnessDetails,
    when: ({ background }) =>
      background.contactKnownCase === "yes" &&
      background.similarIllnessInFamily === "yes",
    validate: ({ background }) =>
      background.similarIllnessDetails.trim()
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
        return "Date of visit is required.";
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

      return facility?.id && facility.name.trim()
        ? null
        : "Select a healthcare facility.";
    },
  },
];
