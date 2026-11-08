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

import { focusFirstInvalidField } from "../utils/form.utils";

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
import { isSchoolOccupation } from "../utils/demographics.utils";

type FormAction =
  | {
      section: "identification";
      patch: Partial<CaseIdentification>;
    }
  | { section: "vitals"; patch: Partial<Vitals> }
  | {
      section: "background";
      patch: Partial<BackgroundInformation>;
    }
  | {
      section: "vaccination";
      patch: Partial<VaccinationHistory>;
    }
  | {
      section: "clinical";
      patch: Partial<ClinicalDetails>;
    }
  | {
      section: "treatment";
      patch: Partial<TreatmentInformation>;
    };

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
  addAntibioticRow: () => void;
  removeAntibioticRow: (id: string) => void;
  setTravelHistory: (value: unknown) => void;
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
    case "identification": {
      const next = {
        ...data.identification,
        ...action.patch,
      };

      if (
        "occupation" in action.patch &&
        !isSchoolOccupation(next.occupation)
      ) {
        next.schoolName = "";
      }

      return { ...data, identification: next };
    }

    case "vitals":
      return {
        ...data,
        vitals: {
          ...data.vitals,
          ...action.patch,
        },
      };

    case "background": {
      const next = {
        ...data.background,
        ...action.patch,
      };

      if (next.contactKnownCase !== "yes") {
        next.contactDetails = "";
        next.householdSize = "";
        next.caregiversTreated = null;
        next.travelHistory = null;

        next.similarIllnessInFamily = "no";
        next.similarIllnessDetails = "";

        next.healthcareVisit = "no";
        next.healthcareVisitDate = "";
        next.healthcareFacility = null;

        return { ...data, background: next };
      }

      // A visible switch begins in the OFF position.
      next.similarIllnessInFamily ??= "no";
      next.healthcareVisit ??= "no";

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
      const next = {
        ...data.vaccination,
        ...action.patch,
      };

      if (!next.available) {
        next.source = null;
        next.doses = null;
        next.lastVaccinationDate = "";
      }

      if (next.doses === 0) {
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
      const next = {
        ...data.treatment,
        ...action.patch,
      };

      if (next.antibioticsAdministered !== "yes") {
        next.antibioticRows = [createEmptyAntibioticRow()];
      } else if (next.antibioticRows.length === 0) {
        next.antibioticRows = [createEmptyAntibioticRow()];
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

      if (next === current.data) return;

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
          antibioticRows: previous.treatment.antibioticRows.map((row) =>
            row.id === id ? { ...row, ...patch } : row,
          ),
        },
      }));
    },
    [mutate],
  );

  // NEW: Explicit Add Row action.
  const addAntibioticRow = useCallback(() => {
    mutate((previous) => {
      if (previous.treatment.antibioticsAdministered !== "yes") {
        return previous;
      }

      return {
        ...previous,
        treatment: {
          ...previous.treatment,
          antibioticRows: [
            ...previous.treatment.antibioticRows,
            createEmptyAntibioticRow(),
          ],
        },
      };
    });
  }, [mutate]);

  const removeAntibioticRow = useCallback(
    (id: string) => {
      mutate((previous) => {
        const rows = previous.treatment.antibioticRows.filter(
          (row) => row.id !== id,
        );

        return {
          ...previous,
          treatment: {
            ...previous.treatment,
            antibioticRows:
              rows.length > 0 ? rows : [createEmptyAntibioticRow()],
          },
        };
      });
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

  // Retained for compatibility. Touching does not
  // show error messages before Submit.
  const markTouched = useCallback((id: string) => {
    setTouched((previous) =>
      previous[id] ? previous : { ...previous, [id]: true },
    );
  }, []);

  const validateNow = useCallback((): ValidationResult => {
    const current = latest.current;

    const result = evaluateForm(
      current.data,
      current.rules,
      current.implementedSections,
    );

    setSubmitAttempted(true);

    if (!result.valid) {
      focusFirstInvalidField(result.errors);
    }

    return result;
  }, []);

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
      addAntibioticRow,
      removeAntibioticRow,
      setTravelHistory,
      markTouched,
      validateNow,
    }),
    [
      update,
      updateClinicalGroup,
      updateAntibioticRow,
      addAntibioticRow,
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
