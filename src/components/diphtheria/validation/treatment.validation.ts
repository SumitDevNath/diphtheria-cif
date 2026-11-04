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
    return REQUIRED.medication ? "Select or enter a medication." : null;
  }

  if (medication === OTHER_MEDICATION) {
    return "Enter the actual medication name.";
  }

  if (row.medicationOrigin === null) {
    return "Select or specify the medication.";
  }

  if (
    row.medicationOrigin === "predefined" &&
    !PREDEFINED_MEDICATIONS.some((option) => option === medication)
  ) {
    return "Select a valid medication.";
  }

  return null;
}

function validateAntibioticRows(
  rows: readonly AntibioticRow[],
): FormFieldErrors {
  const errors: FormFieldErrors = {};

  const activeRows = rows.filter(hasAntibioticContent);

  if (activeRows.length === 0) {
    errors[IDS.antibioticRows] = "Add at least one antibiotic therapy record.";

    return errors;
  }

  const firstMedicationByName = new Map<string, string>();

  for (const row of activeRows) {
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

      const earlierRow = firstMedicationByName.get(normalized);

      if (earlierRow) {
        errors[medicationId] = "This medication is already recorded.";

        errors[earlierRow] = "This medication is entered more than once.";
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

    // CHRONOLOGICAL VALIDATION
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
