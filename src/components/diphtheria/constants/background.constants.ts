import type { BackgroundInformation, Option } from "../types/diphtheria.types";

type BackgroundFieldKey = Exclude<keyof BackgroundInformation, "travelHistory">;

export const BACKGROUND_FIELD_IDS = {
  contactKnownCase: "background-contactKnownCase",
  contactDetails: "background-contactDetails",
  householdSize: "background-householdSize",
  caregiversTreated: "background-caregiversTreated",
  similarIllnessInFamily: "background-similarIllnessInFamily",
  similarIllnessDetails: "background-similarIllnessDetails",
  healthcareVisit: "background-healthcareVisit",
  healthcareVisitDate: "background-healthcareVisitDate",
  healthcareFacility: "background-healthcareFacility",
} as const satisfies Record<BackgroundFieldKey, string>;

/**
 * Mandatory status is not specified in the Figma.
 * Update these flags after NDSS confirms requirements.
 *
 * Dependent fields are validated only while visible.
 */
export const BACKGROUND_REQUIRED: Record<BackgroundFieldKey, boolean> = {
  contactKnownCase: false,
  contactDetails: false,
  householdSize: false,
  caregiversTreated: false,
  similarIllnessInFamily: false,
  similarIllnessDetails: false,
  healthcareVisit: false,
  healthcareVisitDate: false,
  healthcareFacility: false,
};

/**
 * Dropdown suggestions, not an authoritative maximum.
 * Free-text entry supports larger values.
 */
export const CAREGIVER_COUNT_OPTIONS: readonly string[] = Array.from(
  { length: 11 },
  (_, index) => String(index),
);

export const CONTACT_RESPONSE_OPTIONS: readonly Option<
  "yes" | "no" | "unknown"
>[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unknown", label: "Unknown" },
];

export const BINARY_RESPONSE_OPTIONS: readonly Option<"yes" | "no">[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];
