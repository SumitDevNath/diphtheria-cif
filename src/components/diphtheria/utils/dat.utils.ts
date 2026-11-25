import { createInitialDATInformation } from "../constants/form.constants";
import type { DATInformation } from "../types/diphtheria.types";

/** Clears only DAT answers that become hidden, never the antibiotic records. */
export function normalizeDATInformation(value: DATInformation): DATInformation {
  const dat = { ...createInitialDATInformation(), ...value };

  if (dat.given !== "yes") {
    return {
      ...createInitialDATInformation(),
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
