const DMY_PATTERN = /^(\d{2})-(\d{2})-(\d{4})$/;
const ISO_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Validate an actual calendar date; do not accept rollover (e.g. 31 February). */
export function dmyToIso(value: string): string | null {
  const match = DMY_PATTERN.exec(value);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);
  if (year < 1 || month < 1 || month > 12 || day < 1) return null;
  const candidate = new Date(0);
  candidate.setFullYear(year, month - 1, day);
  candidate.setHours(12, 0, 0, 0);
  if (
    candidate.getFullYear() !== year ||
    candidate.getMonth() !== month - 1 ||
    candidate.getDate() !== day
  )
    return null;
  return `${yyyy}-${mm}-${dd}`;
}

export function isoToDmy(value: string): string {
  const match = ISO_PATTERN.exec(value);
  if (!match) return "";
  const [, yyyy, mm, dd] = match;
  const candidate = `${dd}-${mm}-${yyyy}`;
  return dmyToIso(candidate) === value ? candidate : "";
}

export function todayIsoLocal(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export interface DateConstraints {
  noFuture?: boolean;
  minDate?: string; // DD-MM-YYYY
  maxDate?: string; // DD-MM-YYYY
}

export function validateDateText(
  value: string,
  { noFuture = false, minDate, maxDate }: DateConstraints = {},
): string | null {
  if (!value.trim()) return null; // requiredness is a separate rule
  const iso = dmyToIso(value);
  if (!iso) return "Enter a valid date (DD-MM-YYYY).";
  const minimum = minDate ? dmyToIso(minDate) : null;
  const maximum = maxDate ? dmyToIso(maxDate) : null;
  if (minimum && iso < minimum) return `Date must be on or after ${minDate}.`;
  if (maximum && iso > maximum) return `Date must be on or before ${maxDate}.`;
  if (noFuture && iso > todayIsoLocal()) return "Future dates are not allowed.";
  return null;
}
