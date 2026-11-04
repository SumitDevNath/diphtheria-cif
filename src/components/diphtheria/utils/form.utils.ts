import { createEmptyAntibioticRow } from "../constants/form.constants";
import type { AntibioticRow } from "../types/diphtheria.types";

/** Normalize names for case-insensitive duplicate checks. */
export function normalizeMedicationName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

/** An active record contains data or a medication selection mode. */
export function hasAntibioticContent(row: AntibioticRow): boolean {
  return Boolean(
    row.medication.trim() ||
    row.medicationOrigin !== null ||
    row.administrationRoute !== null ||
    row.startDate ||
    row.endDate,
  );
}

/**
 * Keep all active rows in their existing order.
 * Preserve one existing trailing blank row when possible.
 * Never use array positions as record IDs.
 */
export function normalizeAntibioticRows(
  rows: readonly AntibioticRow[],
): AntibioticRow[] {
  const activeRows = rows.filter(hasAntibioticContent);

  const existingBlank = [...rows]
    .reverse()
    .find((row) => !hasAntibioticContent(row));

  return [...activeRows, existingBlank ?? createEmptyAntibioticRow()];
}

export function hasDuplicateMedication(
  rows: readonly AntibioticRow[],
): boolean {
  const medications = rows
    .map((row) => normalizeMedicationName(row.medication))
    .filter(Boolean);

  return new Set(medications).size !== medications.length;
}

/**
 * Focus and scroll to the first invalid field.
 * Error keys must match actual DOM element IDs.
 */
export function focusFirstInvalidField(errors: Record<string, string>): void {
  const fieldId = Object.keys(errors)[0];

  if (!fieldId || typeof document === "undefined") {
    return;
  }

  requestAnimationFrame(() => {
    const element = document.getElementById(fieldId);

    if (!(element instanceof HTMLElement)) {
      return;
    }

    element.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    element.focus({ preventScroll: true });
  });
}
