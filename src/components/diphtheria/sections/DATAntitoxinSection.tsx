import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import type { ReactNode } from "react";

import { FieldError, FieldLabel, RequiredMark } from "../components/FieldParts";
import {
  DAT_ADMINISTRATION_MODES,
  DAT_FIELD_IDS as IDS,
  DAT_NOT_GIVEN_REASONS,
  DAT_PRETREATMENT_OPTIONS,
  DAT_REQUIRED as REQUIRED,
  DAT_SIDE_EFFECT_OPTIONS,
  DAT_TEST_RESULTS,
} from "../constants/treatment.constants";
import { createInitialDATInformation } from "../constants/form.constants";
import { useDiphtheriaForm } from "../context/DiphtheriaFormContext";
import { YesNoField } from "../fields/ChoiceField";
import DateField from "../fields/DateField";
import SelectField from "../fields/SelectField";
import ToggleSwitch from "../fields/ToggleSwitch";
import type {
  DATInformation,
  DATPreTreatment,
  DATSideEffect,
  Option,
} from "../types/diphtheria.types";

const labelSx = {
  color: "#17365F",
  fontSize: "0.875rem",
  fontWeight: 600,
  lineHeight: 1.45,
} as const;

// Match the Background Information ToggleCard styling exactly.
const toggleCardSx = {
  p: { xs: 1.5, sm: 2 },
  borderColor: "#D4E2EF",
  borderRadius: "9px",
  bgcolor: "#F5F9FE",
  boxShadow: "none",
  minWidth: 0,
} as const;

const fieldSx = {
  width: "100%",
  minWidth: 0,
  "& .MuiOutlinedInput-root": {
    bgcolor: "#FFFFFF",
    borderRadius: "6px",
    minHeight: 42,
  },
  "& .MuiInputBase-input": { fontSize: "0.875rem" },
} as const;

const twoColumnsSx = {
  display: "grid",
  gridTemplateColumns: {
    xs: "minmax(0, 1fr)",
    md: "repeat(2, minmax(0, 1fr))",
  },
  gap: 2,
  alignItems: "start",
} as const;

interface SwitchQuestionProps {
  id: string;
  title: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled: boolean;
  children?: ReactNode;
}

function SwitchQuestion({
  id,
  title,
  checked,
  onChange,
  disabled,
  children,
}: SwitchQuestionProps) {
  return (
    <Paper variant="outlined" sx={toggleCardSx}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          minHeight: 36,
          pb: checked ? 1.25 : 0,
          borderBottom: checked ? "1px solid #D6E3F0" : "none",
        }}
      >
        <Typography
          sx={{
            color: "#17365F",
            fontSize: "0.9375rem",
            fontWeight: 600,
            lineHeight: 1.5,
          }}
        >
          {title}
        </Typography>
        <Box sx={{ flexShrink: 0 }}>
          <ToggleSwitch
            id={id}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            ariaLabel={title}
          />
        </Box>
      </Box>
      {checked && <Box sx={{ mt: 2, minWidth: 0 }}>{children}</Box>}
    </Paper>
  );
}

interface MultiChoiceProps<T extends string> {
  id: string;
  label: string;
  options: readonly Option<T>[];
  selected: readonly T[];
  onChange: (selected: T[]) => void;
  error?: string;
  required: boolean;
  disabled: boolean;
}

function MultiChoice<T extends string>({
  id,
  label,
  options,
  selected,
  onChange,
  error,
  required,
  disabled,
}: MultiChoiceProps<T>) {
  return (
    <Box id={id} sx={{ minWidth: 0 }} role="group" aria-label={label}>
      <Typography sx={{ ...labelSx, mb: 0.5 }}>
        {label}
        {required && <RequiredMark />}
      </Typography>
      <FormGroup row sx={{ gap: { xs: 0.5, sm: 1.5 } }}>
        {options.map(({ value, label: optionLabel }) => (
          <FormControlLabel
            key={value}
            label={optionLabel}
            control={
              <Checkbox
                size="small"
                checked={selected.includes(value)}
                disabled={disabled}
                onChange={(event) =>
                  onChange(
                    event.target.checked
                      ? [...selected, value]
                      : selected.filter((item) => item !== value),
                  )
                }
              />
            }
            sx={{
              m: 0,
              "& .MuiFormControlLabel-label": { fontSize: "0.875rem" },
            }}
          />
        ))}
      </FormGroup>
      <FieldError id={id} message={error} />
    </Box>
  );
}

export default function DATAntitoxinSection() {
  const { data, update, fieldError, markTouched, readOnly } =
    useDiphtheriaForm();

  // Existing saved investigations may predate the new DAT section.
  const dat = data.treatment.dat ?? createInitialDATInformation();

  const change = (patch: Partial<DATInformation>) => {
    update({
      section: "treatment",
      patch: { dat: { ...dat, ...patch } },
    });
  };

  const textField = (
    id: string,
    label: string,
    value: string,
    onValueChange: (value: string) => void,
    required: boolean,
    props?: { placeholder?: string; inputMode?: "decimal" | "text" },
  ) => (
    <Box sx={{ minWidth: 0 }}>
      <FieldLabel id={id} required={required}>
        {label}
      </FieldLabel>
      <TextField
        id={id}
        size="small"
        fullWidth
        value={value}
        placeholder={props?.placeholder}
        onChange={(event) => onValueChange(event.target.value)}
        onBlur={() => markTouched(id)}
        error={Boolean(fieldError(id))}
        slotProps={{
          htmlInput: {
            readOnly,
            inputMode: props?.inputMode,
            "aria-describedby": `${id}-helper`,
          },
        }}
        sx={fieldSx}
      />
      <FieldError id={id} message={fieldError(id)} />
    </Box>
  );

  return (
    <Box
      component="section"
      aria-label="Diphtheria Antitoxin (DAT)"
      sx={{ minWidth: 0 }}
    >
      <Typography
        component="h3"
        sx={{
          mb: 1.5,
          ml: 1,
          color: "#1755C9",
          fontSize: "0.875rem",
          fontWeight: 700,
          textTransform: "uppercase",
        }}
      >
        Diphtheria Antitoxin (DAT)
      </Typography>

      <Paper
        variant="outlined"
        sx={{
          p: { xs: 1.5, sm: 2 },
          minWidth: 0,
          borderColor: "#DCE6F3",
          borderRadius: "8px",
          boxShadow: "none",
        }}
      >
        {/* QUESTION 1: DAT treatment given? */}
        <YesNoField
          id={IDS.given}
          label="1. DAT treatment given?"
          value={dat.given}
          onChange={(given) => change({ given })}
          onBlur={() => markTouched(IDS.given)}
          error={fieldError(IDS.given)}
          readOnly={readOnly}
          required={REQUIRED.given}
        />

        {dat.given === "no" && (
          <Box sx={{ mt: 2, maxWidth: 420, minWidth: 0 }}>
            <SelectField
              id={IDS.notGivenReason}
              label="Why DAT was not given"
              placeholder="Select reason"
              value={dat.notGivenReason}
              options={DAT_NOT_GIVEN_REASONS}
              onChange={(notGivenReason) => change({ notGivenReason })}
              onBlur={() => markTouched(IDS.notGivenReason)}
              error={fieldError(IDS.notGivenReason)}
              required={REQUIRED.notGivenReason}
              readOnly={readOnly}
            />
          </Box>
        )}

        {dat.given === "yes" && (
          <Box sx={{ mt: 2.5, display: "grid", gap: 2.5, minWidth: 0 }}>
            {/* QUESTION 2: Sensitivity test */}
            <SwitchQuestion
              id={IDS.sensitivityTestDone}
              title="2. Sensitivity test done?"
              checked={dat.sensitivityTestDone}
              onChange={(sensitivityTestDone) =>
                change({ sensitivityTestDone })
              }
              disabled={readOnly}
            >
              <Box sx={{ maxWidth: 420, minWidth: 0 }}>
                <SelectField
                  id={IDS.testResult}
                  label="Test results"
                  placeholder="Select test result"
                  value={dat.testResult}
                  options={DAT_TEST_RESULTS}
                  onChange={(testResult) => change({ testResult })}
                  onBlur={() => markTouched(IDS.testResult)}
                  error={fieldError(IDS.testResult)}
                  required={REQUIRED.testResult}
                  readOnly={readOnly}
                />
              </Box>

              {dat.testResult === "hypersensitive" && (
                <Box sx={{ mt: 1.75 }}>
                  <SwitchQuestion
                    id={IDS.preTreatmentGiven}
                    title="Pre-treatment given?"
                    checked={dat.preTreatmentGiven}
                    onChange={(preTreatmentGiven) =>
                      change({ preTreatmentGiven })
                    }
                    disabled={readOnly}
                  >
                    <MultiChoice<DATPreTreatment>
                      id={IDS.preTreatments}
                      label="Select at least one pre-treatment"
                      options={DAT_PRETREATMENT_OPTIONS}
                      selected={dat.preTreatments}
                      onChange={(preTreatments) => change({ preTreatments })}
                      error={fieldError(IDS.preTreatments)}
                      required={REQUIRED.preTreatments}
                      disabled={readOnly}
                    />
                    {dat.preTreatments.includes("other") && (
                      <Box sx={{ mt: 1.5, maxWidth: 480 }}>
                        {textField(
                          IDS.otherPreTreatment,
                          "Other pre-treatment (specify)",
                          dat.otherPreTreatment,
                          (otherPreTreatment) => change({ otherPreTreatment }),
                          REQUIRED.otherPreTreatment,
                          { placeholder: "Specify pre-treatment" },
                        )}
                      </Box>
                    )}
                  </SwitchQuestion>
                </Box>
              )}
            </SwitchQuestion>

            {/* QUESTION 3: Manufacturer and dependent batch */}
            <Box sx={twoColumnsSx}>
              {textField(
                IDS.manufacturer,
                "3. Manufacturer of DAT",
                dat.manufacturer,
                (manufacturer) => change({ manufacturer }),
                REQUIRED.manufacturer,
                { placeholder: "Enter manufacturer" },
              )}
              {dat.manufacturer.trim() &&
                textField(
                  IDS.batchLot,
                  "Batch/Lot No. of DAT",
                  dat.batchLot,
                  (batchLot) => change({ batchLot }),
                  REQUIRED.batchLot,
                  { placeholder: "Enter batch / lot number" },
                )}
            </Box>

            {/* QUESTION 4: Date and mode */}
            <Box sx={twoColumnsSx}>
              <DateField
                id={IDS.administrationDate}
                label="4. Date of DAT administration (DD/MM/YY)"
                displayFormat="DD/MM/YY"
                value={dat.administrationDate}
                onChange={(administrationDate) =>
                  change({ administrationDate })
                }
                onBlur={() => markTouched(IDS.administrationDate)}
                error={fieldError(IDS.administrationDate)}
                required={REQUIRED.administrationDate}
                readOnly={readOnly}
                noFuture
              />
              <SelectField
                id={IDS.administrationMode}
                label="Mode of administration"
                placeholder="Select IV or IM"
                value={dat.administrationMode}
                options={DAT_ADMINISTRATION_MODES}
                onChange={(administrationMode) =>
                  change({ administrationMode })
                }
                onBlur={() => markTouched(IDS.administrationMode)}
                error={fieldError(IDS.administrationMode)}
                required={REQUIRED.administrationMode}
                readOnly={readOnly}
              />
            </Box>

            {/* QUESTION 5: Dose */}
            <Box sx={{ maxWidth: 420, minWidth: 0 }}>
              {textField(
                IDS.doseUnits,
                "5. Dose administered (units)",
                dat.doseUnits,
                (doseUnits) => change({ doseUnits }),
                REQUIRED.doseUnits,
                { placeholder: "Enter dose in units", inputMode: "decimal" },
              )}
            </Box>

            {/* QUESTION 6: Side effects */}
            <SwitchQuestion
              id={IDS.sideEffectsOccurred}
              title="6. Side effects of DAT?"
              checked={dat.sideEffectsOccurred}
              onChange={(sideEffectsOccurred) =>
                change({ sideEffectsOccurred })
              }
              disabled={readOnly}
            >
              <MultiChoice<DATSideEffect>
                id={IDS.sideEffects}
                label="Select at least one side effect"
                options={DAT_SIDE_EFFECT_OPTIONS}
                selected={dat.sideEffects}
                onChange={(sideEffects) => change({ sideEffects })}
                error={fieldError(IDS.sideEffects)}
                required={REQUIRED.sideEffects}
                disabled={readOnly}
              />
              {dat.sideEffects.includes("other") && (
                <Box sx={{ maxWidth: 480, mt: 1.5 }}>
                  {textField(
                    IDS.otherSideEffect,
                    "Other side effect (describe)",
                    dat.otherSideEffect,
                    (otherSideEffect) => change({ otherSideEffect }),
                    REQUIRED.otherSideEffect,
                    { placeholder: "Describe the side effect" },
                  )}
                </Box>
              )}
            </SwitchQuestion>

            {/* QUESTION 7: DAT infusion continued? */}
            <YesNoField
              id={IDS.infusionContinued}
              label="7. DAT infusion continued?"
              value={dat.infusionContinued}
              onChange={(infusionContinued) => change({ infusionContinued })}
              onBlur={() => markTouched(IDS.infusionContinued)}
              error={fieldError(IDS.infusionContinued)}
              required={REQUIRED.infusionContinued}
              readOnly={readOnly}
            />
          </Box>
        )}
      </Paper>
    </Box>
  );
}
