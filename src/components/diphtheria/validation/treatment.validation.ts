import {
  antibioticFieldId,
  OTHER_MEDICATION,
  PREDEFINED_MEDICATIONS,
  TREATMENT_FIELD_IDS as IDS,
} from "../constants/treatment.constants";

import { normalizeMedicationName } from "../utils/form.utils";

import { dmyToIso, validateDateText } from "../utils/date.utils";

import type { AntibioticRow, FormFieldErrors } from "../types/diphtheria.types";

import type { ValidationRule } from "./form.validation";

function validateRows(rows: readonly AntibioticRow[]): FormFieldErrors {
  const errors: FormFieldErrors = {};

  if (rows.length === 0) {
    errors[IDS.antibioticRows] = "Add an antibiotic therapy record.";
    return errors;
  }

  const seen = new Map<string, string>();

  for (const row of rows) {
    const medicationId = antibioticFieldId(row.id, "medication");
    const routeId = antibioticFieldId(row.id, "administrationRoute");
    const startId = antibioticFieldId(row.id, "startDate");
    const endId = antibioticFieldId(row.id, "endDate");

    const medication = row.medication.trim();

    if (!medication) {
      errors[medicationId] =
        row.medicationOrigin === "custom"
          ? "Enter the custom medication name."
          : "Select a medication.";
    } else if (medication === OTHER_MEDICATION) {
      errors[medicationId] = "Specify the actual medication.";
    } else if (row.medicationOrigin === null) {
      errors[medicationId] = "Select or specify the medication.";
    } else if (
      row.medicationOrigin === "predefined" &&
      !PREDEFINED_MEDICATIONS.includes(medication)
    ) {
      errors[medicationId] = "Select a valid medication.";
    } else {
      const name = normalizeMedicationName(medication);
      const previousId = seen.get(name);

      if (previousId) {
        errors[previousId] = "This medication is duplicated.";
        errors[medicationId] = "This medication is duplicated.";
      } else {
        seen.set(name, medicationId);
      }
    }

    if (!row.administrationRoute) {
      errors[routeId] = "Select an administration route.";
    } else if (!["oral", "iv", "im"].includes(row.administrationRoute)) {
      errors[routeId] = "Select a valid route.";
    }

    if (!row.startDate.trim()) {
      errors[startId] = "Start date is required.";
    } else {
      const message = validateDateText(row.startDate, { noFuture: true });

      if (message) errors[startId] = message;
    }

    if (!row.endDate.trim()) {
      errors[endId] = "End date is required.";
    } else {
      const message = validateDateText(row.endDate, { noFuture: true });

      if (message) errors[endId] = message;
    }

    const start = dmyToIso(row.startDate);
    const end = dmyToIso(row.endDate);

    if (start && end && end < start && !errors[endId]) {
      errors[endId] = "End date cannot precede start date.";
    }
  }

  return errors;
}

export const TREATMENT_VALIDATION_RULES: readonly ValidationRule[] = [
  {
    id: IDS.antibioticsAdministered,
    validate: ({ treatment }) =>
      treatment.antibioticsAdministered === "yes" ||
      treatment.antibioticsAdministered === "no" ||
      treatment.antibioticsAdministered === null
        ? null
        : "Select a valid therapy response.",
  },
  {
    when: ({ treatment }) => treatment.antibioticsAdministered === "yes",
    validateFields: ({ treatment }) => validateRows(treatment.antibioticRows),
  },
];
