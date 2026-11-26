import {
  Box,
  Checkbox,
  Collapse,
  Divider,
  FormControlLabel,
  FormGroup,
  InputAdornment,
  Paper,
  Stack,
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

/* -------------------------------------------------------------------------- */
/* Design tokens                                                              */
/* -------------------------------------------------------------------------- */

const t = {
  ink: "#17365F",
  muted: "#5B7391",
  accent: "#1755C9",
  accentSoft: "#E8F0FD",
  surface: "#FFFFFF",
  tint: "#F5F9FE",
  border: "#D4E2EF",
  divider: "#E3ECF6",
} as const;

const rowPaddingSx = {
  px: { xs: 2, sm: 2.5 },
  py: 2.25,
} as const;

const labelSx = {
  color: t.ink,
  fontSize: "0.875rem",
  fontWeight: 600,
  lineHeight: 1.45,
} as const;

const fieldSx = {
  width: "100%",
  minWidth: 0,
  "& .MuiOutlinedInput-root": {
    bgcolor: t.surface,
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
  columnGap: 3,
  rowGap: 2,
  alignItems: "start",
} as const;

/* -------------------------------------------------------------------------- */
/* Layout primitives                                                          */
/* -------------------------------------------------------------------------- */

interface QuestionProps {
  number: number;
  /**
   * "inline"  – taller 40px switch row (questions 2 and 6).
   * "choice"  – compact Yes/No selection row (questions 1 and 7).
   * "stacked" – label above an input (questions 3, 4, and 5).
   */
  variant?: "inline" | "choice" | "stacked";
  children: ReactNode;
}

/** Classic 1., 2., 3. numbering without badges; preserves existing field layout. */
function Question({ number, variant = "stacked", children }: QuestionProps) {
  return (
    <Box
      sx={{
        ...rowPaddingSx,
        display: "flex",
        alignItems: "flex-start",
        gap: 0.5,
        minWidth: 0,
      }}
    >
      <Typography
        component="span"
        aria-hidden
        sx={{
          flexShrink: 0,
          width: "auto",
          mt: variant === "inline" ? "10px" : variant === "choice" ? "6px" : 0,
          color: t.ink,
          fontSize: "0.875rem",
          fontWeight: 600,
          lineHeight: 1.45,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {number}.
      </Typography>
      <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
    </Box>
  );
}

interface ToggleRowProps {
  id: string;
  title: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled: boolean;
  children?: ReactNode;
}

/** Title + switch + live "Yes / No" state, with details that expand below. */
function ToggleRow({
  id,
  title,
  checked,
  onChange,
  disabled,
  children,
}: ToggleRowProps) {
  return (
    <>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          columnGap: 1.75,
          minHeight: 40,
        }}
      >
        <Typography sx={labelSx}>{title}</Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
          <ToggleSwitch
            id={id}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            ariaLabel={title}
          />
          <Typography
            aria-hidden
            sx={{
              minWidth: 24,
              color: checked ? t.accent : t.muted,
              fontSize: "0.8125rem",
              fontWeight: 600,
            }}
          >
            {checked ? "Yes" : "No"}
          </Typography>
        </Box>
      </Box>
      <Collapse in={checked} unmountOnExit>
        <Box sx={{ pt: 1.5, minWidth: 0 }}>{children}</Box>
      </Collapse>
    </>
  );
}

/** Original light-blue toggle-card design for Questions 2 and 6 only. */
interface SwitchCardProps {
  id: string;
  title: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled: boolean;
  children?: ReactNode;
}

function SwitchCard({
  id,
  title,
  checked,
  onChange,
  disabled,
  children,
}: SwitchCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderColor: t.border,
        borderRadius: "9px",
        bgcolor: t.tint,
        boxShadow: "none",
        minWidth: 0,
        width: { xs: "100%", md: "50%" },
      }}
    >
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
            color: t.ink,
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
      <Collapse in={checked} unmountOnExit>
        <Box sx={{ mt: 2, minWidth: 0 }}>{children}</Box>
      </Collapse>
    </Paper>
  );
}

/** A follow-up that belongs to the question above it: indented behind a rail. */
function FollowUp({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        mt: 2,
        pl: 2,
        minWidth: 0,
        borderLeft: `2px solid ${t.border}`,
      }}
    >
      {children}
    </Box>
  );
}

/* -------------------------------------------------------------------------- */
/* Multi-select                                                               */
/* -------------------------------------------------------------------------- */

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
      <Typography sx={{ ...labelSx, mb: 1 }}>
        {label}
        {required && <RequiredMark />}
      </Typography>
      <FormGroup row sx={{ gap: 1 }}>
        {options.map(({ value, label: optionLabel }) => {
          const isSelected = selected.includes(value);
          return (
            <FormControlLabel
              key={value}
              label={optionLabel}
              control={
                <Checkbox
                  size="small"
                  checked={isSelected}
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
                pr: 1.5,
                border: `1px solid ${isSelected ? t.accent : t.border}`,
                borderRadius: "8px",
                bgcolor: isSelected ? t.accentSoft : t.surface,
                "& .MuiFormControlLabel-label": {
                  color: t.ink,
                  fontSize: "0.875rem",
                  fontWeight: isSelected ? 600 : 400,
                },
              }}
            />
          );
        })}
      </FormGroup>
      <FieldError id={id} message={error} />
    </Box>
  );
}

/* -------------------------------------------------------------------------- */
/* Section                                                                    */
/* -------------------------------------------------------------------------- */

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
    props?: {
      placeholder?: string;
      inputMode?: "decimal" | "text";
      adornment?: string;
    },
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
          input: props?.adornment
            ? {
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography sx={{ color: t.muted, fontSize: "0.8125rem" }}>
                      {props.adornment}
                    </Typography>
                  </InputAdornment>
                ),
              }
            : undefined,
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
      <Paper
        variant="outlined"
        sx={{
          minWidth: 0,
          overflow: "hidden",
          borderColor: t.border,
          borderRadius: "10px",
          bgcolor: t.surface,
          boxShadow: "none",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            px: { xs: 2, sm: 2.5 },
            py: 1.5,
            bgcolor: t.tint,
            borderBottom: `1px solid ${t.border}`,
          }}
        >
          <Typography
            component="h3"
            sx={{
              color: t.ink,
              fontSize: "1rem",
              fontWeight: 700,
              lineHeight: 1.4,
            }}
          >
            Diphtheria Antitoxin (DAT)
          </Typography>
        </Box>

        {/* Q1: DAT treatment given? */}
        <Question number={1} variant="choice">
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              alignItems: "flex-start",
              flexWrap: "wrap",
              columnGap: 2.5,
              rowGap: 1.5,
              minWidth: 0,
            }}
          >
            <YesNoField
              id={IDS.given}
              label="DAT treatment given?"
              value={dat.given}
              onChange={(given) => change({ given })}
              onBlur={() => markTouched(IDS.given)}
              error={fieldError(IDS.given)}
              readOnly={readOnly}
              required={REQUIRED.given}
              inline
            />

            {/* Restore the previous inline reason + dropdown layout only for No. */}
            {dat.given === "no" && (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: "flex-start",
                  gap: 1.5,
                  flex: { md: "0 1 45%" },
                  minWidth: { xs: 0, md: 330 },
                  width: { xs: "100%", md: "auto" },
                }}
              >
                <Typography
                  component="label"
                  htmlFor={IDS.notGivenReason}
                  sx={{
                    ...labelSx,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.25,
                    flexShrink: 0,
                    whiteSpace: "nowrap",
                  }}
                >
                  Why DAT was not given
                  {REQUIRED.notGivenReason && <RequiredMark />}
                </Typography>

                <Box
                  sx={{
                    flex: 1,
                    minWidth: 150,
                    // Only hide this SelectField's duplicate label, not its error.
                    "& .MuiFormLabel-root": { display: "none" },
                  }}
                >
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
              </Box>
            )}
          </Box>
        </Question>

        {/* Q2 – Q7: only when DAT was given */}
        <Collapse in={dat.given === "yes"} unmountOnExit>
          <Box sx={{ borderTop: `1px solid ${t.divider}` }}>
            <Stack divider={<Divider sx={{ borderColor: t.divider }} />}>
              {/* Q2: Sensitivity test */}
              <Box sx={rowPaddingSx}>
                <SwitchCard
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

                  <Collapse
                    in={dat.testResult === "hypersensitive"}
                    unmountOnExit
                  >
                    <FollowUp>
                      <ToggleRow
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
                          onChange={(preTreatments) =>
                            change({ preTreatments })
                          }
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
                              (otherPreTreatment) =>
                                change({ otherPreTreatment }),
                              REQUIRED.otherPreTreatment,
                              { placeholder: "Specify pre-treatment" },
                            )}
                          </Box>
                        )}
                      </ToggleRow>
                    </FollowUp>
                  </Collapse>
                </SwitchCard>
              </Box>

              {/* Q3: Manufacturer and dependent batch */}
              <Question number={3}>
                <Box sx={twoColumnsSx}>
                  {textField(
                    IDS.manufacturer,
                    "Manufacturer of DAT",
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
              </Question>

              {/* Q4: Date and mode */}
              <Question number={4}>
                <Box sx={twoColumnsSx}>
                  <DateField
                    id={IDS.administrationDate}
                    label="Date of DAT administration (DD/MM/YY)"
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
              </Question>

              {/* Q5: Dose */}
              <Question number={5}>
                <Box sx={{ maxWidth: 420, minWidth: 0 }}>
                  {textField(
                    IDS.doseUnits,
                    "Dose administered (units)",
                    dat.doseUnits,
                    (doseUnits) => change({ doseUnits }),
                    REQUIRED.doseUnits,
                    {
                      placeholder: "Enter dose",
                      inputMode: "decimal",
                      adornment: "units",
                    },
                  )}
                </Box>
              </Question>

              {/* Q6: Side effects */}
              <Box sx={rowPaddingSx}>
                <SwitchCard
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
                </SwitchCard>
              </Box>

              {/* Q7: Infusion continued? */}
              <Question number={7} variant="choice">
                <YesNoField
                  id={IDS.infusionContinued}
                  label="DAT infusion continued?"
                  value={dat.infusionContinued}
                  onChange={(infusionContinued) =>
                    change({ infusionContinued })
                  }
                  onBlur={() => markTouched(IDS.infusionContinued)}
                  error={fieldError(IDS.infusionContinued)}
                  required={REQUIRED.infusionContinued}
                  readOnly={readOnly}
                  inline
                />
              </Question>
            </Stack>
          </Box>
        </Collapse>
      </Paper>
    </Box>
  );
}
