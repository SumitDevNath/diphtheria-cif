import {
  antibioticFieldId,
  OTHER_MEDICATION,
  PREDEFINED_MEDICATIONS,
  TREATMENT_FIELD_IDS as IDS,
  TREATMENT_REQUIRED as REQUIRED,
} from "../constants/treatment.constants";

import {
  hasAntibioticContent,
  normalizeMedicationName,
} from "../utils/form.utils";

import { dmyToIso, validateDateText } from "../utils/date.utils";

import type { AntibioticRow, FormFieldErrors } from "../types/diphtheria.types";

import type { ValidationRule } from "./form.validation";

function validateMedication(row: AntibioticRow): string | null {
  const medication = row.medication.trim();

  if (!medication) {
    if (!REQUIRED.medication) return null;

    return row.medicationOrigin === "custom"
      ? "Enter the custom medication name."
      : "Select a medication.";
  }

  if (medication === OTHER_MEDICATION) {
    return "Enter the actual medication name.";
  }

  if (row.medicationOrigin === null) {
    return "Select or specify the medication.";
  }

  if (
    row.medicationOrigin === "predefined" &&
    !PREDEFINED_MEDICATIONS.includes(medication)
  ) {
    return "Select a valid medication.";
  }

  if (
    row.medicationOrigin !== "predefined" &&
    row.medicationOrigin !== "custom"
  ) {
    return "Select a valid medication type.";
  }

  return null;
}

function validateAntibioticRows(
  rows: readonly AntibioticRow[],
): FormFieldErrors {
  const errors: FormFieldErrors = {};

  const activeRows = rows.filter(hasAntibioticContent);

  /**
   * If there are no active rows, validate the first
   * empty row so its four controls receive errors.
   *
   * If active rows exist, ignore the automatically
   * maintained trailing empty row.
   */
  const rowsToValidate = activeRows.length > 0 ? activeRows : rows.slice(0, 1);

  if (rowsToValidate.length === 0) {
    errors[IDS.antibioticRows] = "Add at least one antibiotic therapy record.";

    return errors;
  }

  const firstMedicationByName = new Map<string, string>();

  for (const row of rowsToValidate) {
    const medicationId = antibioticFieldId(row.id, "medication");

    const routeId = antibioticFieldId(row.id, "administrationRoute");

    const startId = antibioticFieldId(row.id, "startDate");

    const endId = antibioticFieldId(row.id, "endDate");

    // MEDICATION
    const medicationError = validateMedication(row);

    if (medicationError) {
      errors[medicationId] = medicationError;
    } else {
      const normalized = normalizeMedicationName(row.medication);

      const previousField = firstMedicationByName.get(normalized);

      if (previousField) {
        errors[medicationId] = "This medication is already recorded.";

        errors[previousField] = "This medication is entered more than once.";
      } else {
        firstMedicationByName.set(normalized, medicationId);
      }
    }

    // ADMINISTRATION ROUTE
    if (row.administrationRoute === null) {
      if (REQUIRED.administrationRoute) {
        errors[routeId] = "Select an administration route.";
      }
    } else if (!["oral", "iv", "im"].includes(row.administrationRoute)) {
      errors[routeId] = "Select a valid administration route.";
    }

    // START DATE
    if (!row.startDate.trim()) {
      if (REQUIRED.startDate) {
        errors[startId] = "Start date is required.";
      }
    } else {
      const startError = validateDateText(row.startDate, { noFuture: true });

      if (startError) {
        errors[startId] = startError;
      }
    }

    // END DATE
    if (!row.endDate.trim()) {
      if (REQUIRED.endDate) {
        errors[endId] = "End date is required.";
      }
    } else {
      const endError = validateDateText(row.endDate, { noFuture: true });

      if (endError) {
        errors[endId] = endError;
      }
    }

    // DATE ORDER
    const startIso = dmyToIso(row.startDate);
    const endIso = dmyToIso(row.endDate);

    if (startIso && endIso && endIso < startIso && !errors[endId]) {
      errors[endId] = "End date cannot precede start date.";
    }
  }

  return errors;
}

export const TREATMENT_VALIDATION_RULES: readonly ValidationRule[] = [
  {
    id: IDS.antibioticsAdministered,
    validate: ({ treatment }) => {
      const answer = treatment.antibioticsAdministered;

      if (answer === null) {
        return REQUIRED.antibioticsAdministered ? "Select Yes or No." : null;
      }

      return answer === "yes" || answer === "no"
        ? null
        : "Select a valid response.";
    },
  },
  {
    when: ({ treatment }) => treatment.antibioticsAdministered === "yes",

    validateFields: ({ treatment }) =>
      validateAntibioticRows(treatment.antibioticRows),
  },
];
