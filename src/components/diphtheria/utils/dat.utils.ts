import { createInitialDATInformation } from "../constants/form.constants";
import type { DATInformation } from "../types/diphtheria.types";

/** Older saved DAT records may not contain the new availability flag. */
export function isDATInformationAvailable(
  value: DATInformation | undefined,
): boolean {
  if (!value) return false;
  if (typeof value.informationAvailable === "boolean")
    return value.informationAvailable;
  return value.given === "yes" || value.given === "no";
}

/** Clears hidden DAT answers without touching the antibiotic records. */
export function normalizeDATInformation(value: DATInformation): DATInformation {
  const available = isDATInformationAvailable(value);
  const dat = {
    ...createInitialDATInformation(),
    ...value,
    informationAvailable: available,
  };

  if (!available) {
    return { ...createInitialDATInformation(), informationAvailable: false };
  }

  if (dat.given !== "yes") {
    return {
      ...createInitialDATInformation(),
      informationAvailable: true,
      given: dat.given,
      notGivenReason: dat.given === "no" ? dat.notGivenReason : null,
    };
  }

  dat.notGivenReason = null;

  if (!dat.sensitivityTestDone) dat.testResult = null;
  if (!dat.sensitivityTestDone || dat.testResult !== "hypersensitive") {
    dat.preTreatmentGiven = false;
  }
  if (!dat.preTreatmentGiven) dat.preTreatments = [];
  if (!dat.preTreatments.includes("other")) dat.otherPreTreatment = "";

  if (!dat.manufacturer.trim()) dat.batchLot = "";
  if (!dat.sideEffectsOccurred) dat.sideEffects = [];
  if (!dat.sideEffects.includes("other")) dat.otherSideEffect = "";

  return dat;
}
