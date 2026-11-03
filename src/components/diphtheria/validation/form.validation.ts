import { SECTION_DEFINITIONS } from "../constants/form.constants";
import { validateDateText, type DateConstraints } from "../utils/date.utils";
import type {
  DiphtheriaFormData,
  FormFieldErrors,
  FormSectionKey,
} from "../types/diphtheria.types";

export interface ValidationRule {
  id: string;
  validate: (data: DiphtheriaFormData) => string | null;
  when?: (data: DiphtheriaFormData) => boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: FormFieldErrors;
  incompleteSections: FormSectionKey[];
}

export function isMissing(value: unknown): boolean {
  return (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")
  );
}

export function requiredRule(
  id: string,
  select: (data: DiphtheriaFormData) => unknown,
  when?: ValidationRule["when"],
): ValidationRule {
  return {
    id,
    when,
    validate: (data) =>
      isMissing(select(data)) ? "This field is required." : null,
  };
}

export function dateRule(
  id: string,
  select: (data: DiphtheriaFormData) => string,
  constraints: DateConstraints = {},
  when?: ValidationRule["when"],
): ValidationRule {
  return {
    id,
    when,
    validate: (data) => validateDateText(select(data), constraints),
  };
}

export function runValidation(
  data: DiphtheriaFormData,
  rules: readonly ValidationRule[],
): FormFieldErrors {
  const errors: FormFieldErrors = {};
  for (const rule of rules) {
    if (rule.when && !rule.when(data)) continue;
    const message = rule.validate(data);
    if (message && !errors[rule.id]) errors[rule.id] = message;
  }
  return errors;
}

export function evaluateForm(
  data: DiphtheriaFormData,
  rules: readonly ValidationRule[],
  implementedSections: readonly FormSectionKey[],
): ValidationResult {
  const errors = runValidation(data, rules);
  const incompleteSections = SECTION_DEFINITIONS.map(
    (section) => section.id,
  ).filter((section) => !implementedSections.includes(section));
  return {
    errors,
    incompleteSections,
    valid: Object.keys(errors).length === 0 && incompleteSections.length === 0,
  };
}
