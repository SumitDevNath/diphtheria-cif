import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  createEmptyAntibioticRow,
  createInitialDiphtheriaData,
} from "../constants/form.constants";
import {
  focusFirstInvalidField,
  normalizeAntibioticRows,
} from "../utils/form.utils";
import {
  evaluateForm,
  runValidation,
  type ValidationResult,
  type ValidationRule,
} from "../validation/form.validation";
import type {
  AntibioticRow,
  BackgroundInformation,
  CaseIdentification,
  ClinicalDetails,
  ClinicalGroupKey,
  ClinicalSelection,
  DiphtheriaFormData,
  FormFieldErrors,
  FormSectionKey,
  TreatmentInformation,
  VaccinationHistory,
  Vitals,
} from "../types/diphtheria.types";

type FormAction =
  | { section: "identification"; patch: Partial<CaseIdentification> }
  | { section: "vitals"; patch: Partial<Vitals> }
  | { section: "background"; patch: Partial<BackgroundInformation> }
  | { section: "vaccination"; patch: Partial<VaccinationHistory> }
  | { section: "clinical"; patch: Partial<ClinicalDetails> }
  | { section: "treatment"; patch: Partial<TreatmentInformation> };

interface FormValueContextType {
  data: DiphtheriaFormData;
  readOnly: boolean;
  errors: FormFieldErrors;
  touched: Readonly<Record<string, boolean>>;
  submitAttempted: boolean;
  implementedSections: readonly FormSectionKey[];
  fieldError: (id: string) => string | undefined;
}

interface FormActionsContextType {
  update: (action: FormAction) => void;
  updateClinicalGroup: (
    group: ClinicalGroupKey,
    patch: Partial<ClinicalSelection>,
  ) => void;
  updateAntibioticRow: (
    id: string,
    patch: Partial<Omit<AntibioticRow, "id">>,
  ) => void;
  removeAntibioticRow: (id: string) => void;
  setTravelHistory: (data: unknown) => void;
  markTouched: (id: string) => void;
  validateNow: () => ValidationResult;
}

export interface DiphtheriaFormProviderProps {
  children: ReactNode;
  value?: DiphtheriaFormData;
  defaultValue?: DiphtheriaFormData;
  onChange?: (data: DiphtheriaFormData) => void;
  readOnly?: boolean;
  validationRules?: readonly ValidationRule[];
  implementedSections?: readonly FormSectionKey[];
}

const ValueContext = createContext<FormValueContextType | null>(null);
const ActionsContext = createContext<FormActionsContextType | null>(null);

function applyFormAction(
  data: DiphtheriaFormData,
  action: FormAction,
): DiphtheriaFormData {
  switch (action.section) {
    case "identification":
      return {
        ...data,
        identification: {
          ...data.identification,
          ...action.patch,
        },
      };

    case "vitals":
      return {
        ...data,
        vitals: {
          ...data.vitals,
          ...action.patch,
        },
      };

    case "background": {
      const next = { ...data.background, ...action.patch };

      // Q1 controls Travel History and Questions 2–5.
      if (next.contactKnownCase !== "yes") {
        next.contactDetails = "";
        next.travelHistory = null;
        next.householdSize = "";
        next.caregiversTreated = null;
        next.similarIllnessInFamily = null;
        next.similarIllnessDetails = "";
        next.healthcareVisit = null;
        next.healthcareVisitDate = "";
        next.healthcareFacility = null;

        return { ...data, background: next };
      }

      if (next.similarIllnessInFamily !== "yes") {
        next.similarIllnessDetails = "";
      }

      if (next.healthcareVisit !== "yes") {
        next.healthcareVisitDate = "";
        next.healthcareFacility = null;
      }

      return { ...data, background: next };
    }

    case "vaccination": {
      const next = { ...data.vaccination, ...action.patch };

      if ("available" in action.patch && !next.available) {
        next.source = null;
        next.doses = null;
        next.lastVaccinationDate = "";
      }

      if ("doses" in action.patch && next.doses === 0) {
        next.lastVaccinationDate = "";
      }

      return { ...data, vaccination: next };
    }

    case "clinical":
      return {
        ...data,
        clinical: {
          ...data.clinical,
          ...action.patch,
        },
      };

    case "treatment": {
      const next = { ...data.treatment, ...action.patch };

      if (
        "antibioticsAdministered" in action.patch &&
        next.antibioticsAdministered !== "yes"
      ) {
        next.antibioticRows = [createEmptyAntibioticRow()];
      } else if ("antibioticRows" in action.patch) {
        next.antibioticRows = normalizeAntibioticRows(next.antibioticRows);
      }

      return { ...data, treatment: next };
    }
  }
}

export function DiphtheriaFormProvider({
  children,
  value,
  defaultValue,
  onChange,
  readOnly = false,
  validationRules = [],
  implementedSections = [],
}: DiphtheriaFormProviderProps) {
  const [internalData, setInternalData] = useState<DiphtheriaFormData>(
    () => defaultValue ?? createInitialDiphtheriaData(),
  );

  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  const data = value ?? internalData;

  // Validation calculations can run while editing, but
  // their messages are not displayed until Submit.
  const errors = useMemo(
    () => runValidation(data, validationRules),
    [data, validationRules],
  );

  const latest = useRef({
    data,
    onChange,
    readOnly,
    controlled: value !== undefined,
    rules: validationRules,
    implementedSections,
  });

  latest.current = {
    data,
    onChange,
    readOnly,
    controlled: value !== undefined,
    rules: validationRules,
    implementedSections,
  };

  const mutate = useCallback(
    (apply: (previous: DiphtheriaFormData) => DiphtheriaFormData) => {
      const current = latest.current;

      if (current.readOnly) return;

      const next = apply(current.data);

      latest.current = {
        ...current,
        data: next,
      };

      if (!current.controlled) {
        setInternalData(next);
      }

      current.onChange?.(next);
    },
    [],
  );

  const update = useCallback(
    (action: FormAction) => {
      mutate((previous) => applyFormAction(previous, action));
    },
    [mutate],
  );

  const updateClinicalGroup = useCallback(
    (group: ClinicalGroupKey, patch: Partial<ClinicalSelection>) => {
      mutate((previous) => ({
        ...previous,
        clinical: {
          ...previous.clinical,
          [group]: {
            ...previous.clinical[group],
            ...patch,
          },
        },
      }));
    },
    [mutate],
  );

  const updateAntibioticRow = useCallback(
    (id: string, patch: Partial<Omit<AntibioticRow, "id">>) => {
      mutate((previous) => ({
        ...previous,
        treatment: {
          ...previous.treatment,
          antibioticRows: normalizeAntibioticRows(
            previous.treatment.antibioticRows.map((row) =>
              row.id === id ? { ...row, ...patch } : row,
            ),
          ),
        },
      }));
    },
    [mutate],
  );

  const removeAntibioticRow = useCallback(
    (id: string) => {
      mutate((previous) => ({
        ...previous,
        treatment: {
          ...previous.treatment,
          antibioticRows: normalizeAntibioticRows(
            previous.treatment.antibioticRows.filter((row) => row.id !== id),
          ),
        },
      }));
    },
    [mutate],
  );

  const setTravelHistory = useCallback(
    (payload: unknown) => {
      mutate((previous) => {
        if (previous.background.contactKnownCase !== "yes") {
          return previous;
        }

        return {
          ...previous,
          background: {
            ...previous.background,
            travelHistory: payload,
          },
        };
      });
    },
    [mutate],
  );

  // Retained for compatibility with the existing fields.
  // A touched field no longer triggers validation styling.
  const markTouched = useCallback((id: string) => {
    setTouched((previous) =>
      previous[id] ? previous : { ...previous, [id]: true },
    );
  }, []);

  const validateNow = useCallback((): ValidationResult => {
    const {
      data: current,
      rules,
      implementedSections: implemented,
    } = latest.current;

    const result = evaluateForm(current, rules, implemented);

    // Enable field-level error display only after Submit.
    setSubmitAttempted(true);

    if (!result.valid) {
      focusFirstInvalidField(result.errors);
    }

    return result;
  }, []);

  /**
   * Only show a validation message after Submit Form.
   * Once Submit has been attempted, errors update
   * automatically whenever the corresponding value changes.
   */
  const fieldError = useCallback(
    (id: string): string | undefined =>
      submitAttempted ? errors[id] : undefined,
    [errors, submitAttempted],
  );

  const values = useMemo<FormValueContextType>(
    () => ({
      data,
      readOnly,
      errors,
      touched,
      submitAttempted,
      implementedSections,
      fieldError,
    }),
    [
      data,
      readOnly,
      errors,
      touched,
      submitAttempted,
      implementedSections,
      fieldError,
    ],
  );

  const actions = useMemo<FormActionsContextType>(
    () => ({
      update,
      updateClinicalGroup,
      updateAntibioticRow,
      removeAntibioticRow,
      setTravelHistory,
      markTouched,
      validateNow,
    }),
    [
      update,
      updateClinicalGroup,
      updateAntibioticRow,
      removeAntibioticRow,
      setTravelHistory,
      markTouched,
      validateNow,
    ],
  );

  return (
    <ActionsContext.Provider value={actions}>
      <ValueContext.Provider value={values}>{children}</ValueContext.Provider>
    </ActionsContext.Provider>
  );
}

export function useDiphtheriaFormValues(): FormValueContextType {
  const context = useContext(ValueContext);

  if (!context) {
    throw new Error("useDiphtheriaFormValues requires DiphtheriaFormProvider.");
  }

  return context;
}

export function useDiphtheriaFormActions(): FormActionsContextType {
  const context = useContext(ActionsContext);

  if (!context) {
    throw new Error(
      "useDiphtheriaFormActions requires DiphtheriaFormProvider.",
    );
  }

  return context;
}

export function useDiphtheriaForm() {
  return {
    ...useDiphtheriaFormValues(),
    ...useDiphtheriaFormActions(),
  };
}
