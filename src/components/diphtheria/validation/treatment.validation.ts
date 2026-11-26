import {
  antibioticFieldId,
  OTHER_MEDICATION,
  PREDEFINED_MEDICATIONS,
  TREATMENT_FIELD_IDS as IDS,
  TREATMENT_REQUIRED as REQUIRED,
  DAT_FIELD_IDS as DAT_IDS,
  DAT_REQUIRED,
} from "../constants/treatment.constants";

import { normalizeMedicationName } from "../utils/form.utils";

import {
  dmyToIso,
  validateDateText,
  validateDatDate,
} from "../utils/date.utils";

import type {
  AntibioticRow,
  DATInformation,
  FormFieldErrors,
} from "../types/diphtheria.types";
import { createInitialDATInformation } from "../constants/form.constants";
import { isDATInformationAvailable } from "../utils/dat.utils";

import type { ValidationRule } from "./form.validation";

function validateRows(rows: readonly AntibioticRow[]): FormFieldErrors {
  const errors: FormFieldErrors = {};

  if (rows.length === 0) {
    if (
      REQUIRED.medication ||
      REQUIRED.administrationRoute ||
      REQUIRED.startDate ||
      REQUIRED.endDate
    ) {
      errors[IDS.antibioticRows] = "Add an antibiotic therapy record.";
    }
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
      if (REQUIRED.medication || row.medicationOrigin === "custom") {
        errors[medicationId] =
          row.medicationOrigin === "custom"
            ? "Enter the custom medication name."
            : "Select a medication.";
      }
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
      if (REQUIRED.administrationRoute) {
        errors[routeId] = "Select an administration route.";
      }
    } else if (!["oral", "iv", "im"].includes(row.administrationRoute)) {
      errors[routeId] = "Select a valid route.";
    }

    if (!row.startDate.trim()) {
      if (REQUIRED.startDate) errors[startId] = "Start date is required.";
    } else {
      const message = validateDateText(row.startDate);

      if (message) errors[startId] = message;
    }

    if (!row.endDate.trim()) {
      if (REQUIRED.endDate) errors[endId] = "End date is required.";
    } else {
      const message = validateDateText(row.endDate);

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

function validateDAT(datInput: DATInformation | undefined): FormFieldErrors {
  const errors: FormFieldErrors = {};
  const dat = datInput ?? createInitialDATInformation();
  const R = DAT_REQUIRED;

  if (!dat.given) {
    if (R.given)
      errors[DAT_IDS.given] = "Select Yes or No for DAT treatment given.";
    return errors;
  }

  if (dat.given === "no") {
    if (!dat.notGivenReason && R.notGivenReason) {
      errors[DAT_IDS.notGivenReason] = "Select why DAT was not given.";
    }
    return errors;
  }

  if (dat.sensitivityTestDone) {
    if (!dat.testResult && R.testResult) {
      errors[DAT_IDS.testResult] = "Select the sensitivity test result.";
    }
    if (dat.testResult === "hypersensitive" && dat.preTreatmentGiven) {
      if (R.preTreatments && dat.preTreatments.length === 0) {
        errors[DAT_IDS.preTreatments] = "Select at least one pre-treatment.";
      }
      if (
        dat.preTreatments.includes("other") &&
        R.otherPreTreatment &&
        !dat.otherPreTreatment.trim()
      ) {
        errors[DAT_IDS.otherPreTreatment] = "Specify the other pre-treatment.";
      }
    }
  }

  if (R.manufacturer && !dat.manufacturer.trim()) {
    errors[DAT_IDS.manufacturer] = "Enter the manufacturer of DAT.";
  }
  if (dat.manufacturer.trim() && R.batchLot && !dat.batchLot.trim()) {
    errors[DAT_IDS.batchLot] = "Enter the Batch/Lot No. of DAT.";
  }

  if (!dat.administrationDate.trim()) {
    if (R.administrationDate)
      errors[DAT_IDS.administrationDate] = "Enter the DAT administration date.";
  } else {
    const dateError = validateDatDate(dat.administrationDate, true);
    if (dateError) errors[DAT_IDS.administrationDate] = dateError;
  }

  if (!dat.administrationMode) {
    if (R.administrationMode)
      errors[DAT_IDS.administrationMode] = "Select IV or IM.";
  } else if (!(["iv", "im"] as string[]).includes(dat.administrationMode)) {
    errors[DAT_IDS.administrationMode] =
      "Select a valid mode of administration.";
  }

  if (!dat.doseUnits.trim()) {
    if (R.doseUnits)
      errors[DAT_IDS.doseUnits] = "Enter the dose administered (units).";
  } else if (
    !/^(?:\d+(?:\.\d+)?|\.\d+)$/.test(dat.doseUnits.trim()) ||
    !Number.isFinite(Number(dat.doseUnits)) ||
    Number(dat.doseUnits) <= 0
  ) {
    errors[DAT_IDS.doseUnits] = "Enter a positive number of units.";
  }

  if (dat.sideEffectsOccurred) {
    if (R.sideEffects && dat.sideEffects.length === 0) {
      errors[DAT_IDS.sideEffects] = "Select at least one side effect.";
    }
    if (
      dat.sideEffects.includes("other") &&
      R.otherSideEffect &&
      !dat.otherSideEffect.trim()
    ) {
      errors[DAT_IDS.otherSideEffect] = "Describe the other side effect.";
    }
  }

  if (!dat.infusionContinued && R.infusionContinued) {
    errors[DAT_IDS.infusionContinued] = "Select Yes or No.";
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
  {
    when: ({ treatment }) => isDATInformationAvailable(treatment.dat),
    validateFields: ({ treatment }) => validateDAT(treatment.dat),
  },
];
