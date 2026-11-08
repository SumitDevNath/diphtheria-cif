import { dmyToIso, todayIsoLocal } from "./date.utils";

export function getPatientAge(dateOfBirth?: string | null): number | null {
  if (!dateOfBirth) return null;

  const value = dateOfBirth.trim();

  // Accept DD-MM-YYYY or YYYY-MM-DD from NDSS.
  const iso = /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : dmyToIso(value);

  if (!iso) return null;

  const [year, month, day] = iso.split("-").map(Number);

  // Verify that an ISO date is a real calendar date.
  if (
    !year ||
    !month ||
    !day ||
    dmyToIso(
      `${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}-${year}`,
    ) !== iso ||
    iso > todayIsoLocal()
  ) {
    return null;
  }

  const now = new Date();

  let age = now.getFullYear() - year;

  if (
    now.getMonth() + 1 < month ||
    (now.getMonth() + 1 === month && now.getDate() < day)
  ) {
    age--;
  }

  return age;
}

export function isSchoolOccupation(occupation: string | null): boolean {
  return /\b(teacher|student)\b/i.test(occupation?.trim() ?? "");
}

/**
 * The female-eligibility value is optional because
 * it belongs to the common NDSS form.
 *
 * When sex is supplied, pregnancy status is only
 * displayed for an eligible female patient.
 */
export function showAdultPregnancyFields(
  dateOfBirth?: string | null,
  sex?: string | null,
): boolean {
  const age = getPatientAge(dateOfBirth);

  if (age === null || age < 18) return false;

  const normalizedSex = sex?.trim().toLowerCase();

  return !normalizedSex || normalizedSex === "female" || normalizedSex === "f";
}
