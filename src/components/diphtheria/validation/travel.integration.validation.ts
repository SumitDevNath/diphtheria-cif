import type { ValidationRule } from "./form.validation";

export const TRAVEL_HISTORY_FIELD_ID = "background-travelHistory";

export type TravelHistoryValidator = (value: unknown) => string | null;

interface TravelIntegrationOptions {
  hasRenderer: boolean;
  validator?: TravelHistoryValidator;
}

/**
 * Travel History is applicable only when
 * Background Question 1 is answered Yes.
 *
 * A connected renderer without a validator
 * is not considered a fully validated integration.
 */
export function createTravelHistoryValidationRule({
  hasRenderer,
  validator,
}: TravelIntegrationOptions): ValidationRule {
  return {
    id: TRAVEL_HISTORY_FIELD_ID,

    when: ({ background }) => background.contactKnownCase === "yes",

    validate: ({ background }) => {
      if (!hasRenderer) {
        return "Travel History module is not connected.";
      }

      if (!validator) {
        return "Travel History validation is not configured.";
      }

      try {
        return validator(background.travelHistory);
      } catch {
        return "Travel History could not be validated.";
      }
    },
  };
}
