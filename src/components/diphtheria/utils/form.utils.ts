import { createEmptyAntibioticRow } from "../constants/form.constants";
import type { AntibioticRow } from "../types/diphtheria.types";

export function normalizeMedicationName(name: string): string {
  return name.trim().replace(/\s+/g, " ").toLocaleLowerCase();
}

export function hasAntibioticContent(row: AntibioticRow): boolean {
  return Boolean(
    row.medication.trim() ||
    row.medicationOrigin !== null ||
    row.administrationRoute !== null ||
    row.startDate ||
    row.endDate,
  );
}

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
  const names = rows
    .map((row) => normalizeMedicationName(row.medication))
    .filter(Boolean);

  return new Set(names).size !== names.length;
}

const FOCUSABLE_SELECTOR = [
  'input:not(:disabled):not([aria-hidden="true"])',
  "textarea:not(:disabled)",
  "select:not(:disabled)",
  '[role="combobox"]:not([aria-disabled="true"])',
  "button:not(:disabled)",
].join(", ");

/**
 * Scroll to the first visible invalid field in DOM order.
 *
 * Compatible with:
 * - MUI TextField
 * - MUI Select / Autocomplete
 * - ToggleButtonGroup
 * - Clinical checkbox groups
 * - Dynamic antibiotic rows
 */
export function focusFirstInvalidField(errors: Record<string, string>): void {
  if (typeof document === "undefined" || Object.keys(errors).length === 0) {
    return;
  }

  requestAnimationFrame(() => {
    const invalidFields = Object.keys(errors)
      .map((id) => document.getElementById(id))
      .filter(
        (element): element is HTMLElement =>
          element instanceof HTMLElement &&
          element.getClientRects().length > 0 &&
          getComputedStyle(element).visibility !== "hidden",
      );

    if (invalidFields.length === 0) {
      return;
    }

    invalidFields.sort((first, second) => {
      if (first === second) return 0;

      const position = first.compareDocumentPosition(second);

      if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
        return -1;
      }

      if (position & Node.DOCUMENT_POSITION_PRECEDING) {
        return 1;
      }

      return 0;
    });

    const firstInvalid = invalidFields[0];

    if (!firstInvalid) return;

    firstInvalid.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    const focusTarget = firstInvalid.matches(FOCUSABLE_SELECTOR)
      ? firstInvalid
      : (firstInvalid.querySelector<HTMLElement>(FOCUSABLE_SELECTOR) ??
        firstInvalid);

    focusTarget.focus({
      preventScroll: true,
    });
  });
}
