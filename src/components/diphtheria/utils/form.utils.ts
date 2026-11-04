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

/**
 * Preserve active row IDs and maintain exactly
 * one empty row at the end of the collection.
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
 * Scroll to the first invalid, visible field
 * according to its actual DOM position.
 *
 * Field IDs must match the IDs registered
 * by the validation rules.
 */
export function focusFirstInvalidField(errors: Record<string, string>): void {
  if (typeof document === "undefined") return;

  requestAnimationFrame(() => {
    const elements = Object.keys(errors)
      .map((id) => document.getElementById(id))
      .filter(
        (element): element is HTMLElement =>
          element instanceof HTMLElement && element.getClientRects().length > 0,
      );

    if (elements.length === 0) return;

    elements.sort((first, second) => {
      const position = first.compareDocumentPosition(second);

      if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
        return -1;
      }

      if (position & Node.DOCUMENT_POSITION_PRECEDING) {
        return 1;
      }

      return 0;
    });

    const firstInvalid = elements[0];

    if (!firstInvalid) return;

    firstInvalid.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });

    const inputSelector = [
      "input:not(:disabled)",
      "textarea:not(:disabled)",
      "select:not(:disabled)",
      "button:not(:disabled)",
    ].join(", ");

    const focusTarget = firstInvalid.matches(inputSelector)
      ? firstInvalid
      : (firstInvalid.querySelector<HTMLElement>(inputSelector) ??
        firstInvalid);

    focusTarget.focus({
      preventScroll: true,
    });
  });
}
