import { createEmptyAntibioticRow } from "../constants/form.constants";
import type { AntibioticRow } from "../types/diphtheria.types";

export function hasAntibioticContent(row: AntibioticRow): boolean {
  return Boolean(
    row.medication.trim() ||
    row.administrationRoute ||
    row.startDate ||
    row.endDate,
  );
}

/** Preserve row IDs and maintain exactly one empty row at the end. */
export function normalizeAntibioticRows(
  rows: readonly AntibioticRow[],
): AntibioticRow[] {
  const filled = rows.filter(hasAntibioticContent);
  const blank = [...rows].reverse().find((row) => !hasAntibioticContent(row));
  return [...filled, blank ?? createEmptyAntibioticRow()];
}

export function hasDuplicateMedication(
  rows: readonly AntibioticRow[],
): boolean {
  const names = rows
    .map((row) => row.medication.trim().toLocaleLowerCase())
    .filter(Boolean);
  return new Set(names).size !== names.length;
}

/** IDs are stable DOM IDs, not positional indices. */
export function focusFirstInvalidField(errors: Record<string, string>): void {
  const fieldId = Object.keys(errors)[0];
  if (!fieldId || typeof document === "undefined") return;
  requestAnimationFrame(() => {
    const element = document.getElementById(fieldId);
    if (!element) return;
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    if (element instanceof HTMLElement) element.focus({ preventScroll: true });
  });
}
