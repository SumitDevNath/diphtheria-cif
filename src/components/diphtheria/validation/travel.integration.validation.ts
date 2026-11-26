import type { ValidationRule } from "./form.validation";

export const TRAVEL_HISTORY_FIELD_ID = "background-travelHistory";

export type TravelHistoryValidator = (value: unknown) => string | null;

interface TravelIntegrationOptions {
  hasRenderer: boolean;
  validator?: TravelHistoryValidator;
}

export function createTravelHistoryValidationRule({
  hasRenderer,
  validator,
}: TravelIntegrationOptions): ValidationRule {
  return {
    id: TRAVEL_HISTORY_FIELD_ID,

    when: ({ background }) => background.contactKnownCase === "yes",

    validate: ({ background }) => {
      if (!hasRenderer || !validator) {
        return null;
      }

      try {
        return validator(background.travelHistory);
      } catch {
        return "Travel History could not be validated.";
      }
    },
  };
}
