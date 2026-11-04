import {
  VACCINATION_FIELD_IDS as IDS,
  VACCINATION_REQUIRED as REQUIRED,
  VACCINATION_SOURCE_OPTIONS,
} from "../constants/vaccination.constants";
import type { DiphtheriaFormData } from "../types/diphtheria.types";
import { validateDateText } from "../utils/date.utils";
import type { ValidationRule } from "./form.validation";

const historyAvailable = ({ vaccination }: DiphtheriaFormData): boolean =>
  vaccination.available;

const lastDateApplicable = ({ vaccination }: DiphtheriaFormData): boolean =>
  vaccination.available && vaccination.doses !== null && vaccination.doses > 0;

export const VACCINATION_VALIDATION_RULES: readonly ValidationRule[] = [
  // Vaccination information source
  {
    id: IDS.source,
    when: historyAvailable,
    validate: ({ vaccination }) => {
      if (vaccination.source === null) {
        return REQUIRED.source ? "Select a vaccination source." : null;
      }

      const validSource = VACCINATION_SOURCE_OPTIONS.some(
        (option) => option.value === vaccination.source,
      );

      return validSource ? null : "Select a valid vaccination source.";
    },
  },

  // Number of vaccine doses
  {
    id: IDS.doses,
    when: historyAvailable,
    validate: ({ vaccination }) => {
      const doses = vaccination.doses;

      // Zero is a valid dose count.
      if (doses === null) {
        return REQUIRED.doses ? "Select the number of doses." : null;
      }

      if (!Number.isSafeInteger(doses) || doses < 0) {
        return "Enter a valid non-negative dose count.";
      }

      return null;
    },
  },

  // Date applies only when at least one dose was received.
  {
    id: IDS.lastVaccinationDate,
    when: lastDateApplicable,
    validate: ({ vaccination }) => {
      const value = vaccination.lastVaccinationDate.trim();

      if (!value) {
        return REQUIRED.lastVaccinationDate
          ? "Date of last vaccination is required."
          : null;
      }

      return validateDateText(value, {
        noFuture: true,
      });
    },
  },
];
