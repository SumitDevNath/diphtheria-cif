import { useEffect } from "react";
import {
  Box,
  Checkbox,
  Collapse,
  FormControlLabel,
  FormGroup,
  InputAdornment,
  TextField,
  Typography,
} from "@mui/material";
import { FieldError, FieldLabel } from "../components/FieldParts";
import {
  AVPU_OPTIONS,
  NUMERIC_VITAL_FIELDS,
  VITALS_FIELD_IDS as IDS,
  VITALS_REQUIRED as REQUIRED,
  type NumericVitalKey,
} from "../constants/vitals.constants";
import { useDiphtheriaForm } from "../context/DiphtheriaFormContext";
import { NumberField, ValidatedField } from "../fields/ValidatedField";
import type { AVPU } from "../types/diphtheria.types";
import { convertTemperature } from "../utils/temperature.utils";

/* -------------------------------------------------------------------------- */
/* Design tokens (shared with DATAntitoxinSection)                            */
/* -------------------------------------------------------------------------- */

const t = {
  ink: "#17365F",
  muted: "#5B7391",
  accent: "#1755C9",
  accentSoft: "#E8F0FD",
  surface: "#FFFFFF",
  skipped: "#EEF3F9",
  inputBorder: "#C9D9EF",
} as const;

/**
 * Applied to every grid cell. Inputs share one height (42px) and one font
 * size (0.875rem) with the DAT section. A cell marked data-skipped="true"
 * (a "Not measured" vital) gets a tinted field so it reads as intentionally
 * skipped rather than just empty.
 */
const cellSx = {
  minWidth: 0,
  width: "100%",
  "& .MuiOutlinedInput-root": {
    minHeight: 42,
    borderRadius: "6px",
    bgcolor: t.surface,
  },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: t.inputBorder },
  "& .MuiInputBase-input": { minWidth: 0, fontSize: "0.875rem" },
  "& .MuiInputAdornment-root .MuiTypography-root": {
    color: t.muted,
    fontSize: "0.8125rem",
    whiteSpace: "nowrap",
  },
  '&[data-skipped="true"] .MuiOutlinedInput-root': { bgcolor: t.skipped },
} as const;

/* -------------------------------------------------------------------------- */
/* "Not measured" checkbox                                                    */
/* -------------------------------------------------------------------------- */

interface NotMeasuredOptionProps {
  id: string;
  checked: boolean;
  disabled: boolean;
  onChange: (checked: boolean) => void;
}

function NotMeasuredOption({
  id,
  checked,
  disabled,
  onChange,
}: NotMeasuredOptionProps) {
  return (
    <FormControlLabel
      sx={{
        m: 0,
        mt: 0.5,
        ml: -0.5, // pull the checkbox edge flush with the input's left edge
        "& .MuiFormControlLabel-label": {
          fontSize: "0.8125rem",
          color: t.muted,
        },
      }}
      control={
        <Checkbox
          id={id}
          size="small"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          sx={{ p: 0.5 }}
        />
      }
      label="Not measured"
    />
  );
}

/* -------------------------------------------------------------------------- */
/* Section                                                                    */
/* -------------------------------------------------------------------------- */

export default function VitalsSection() {
  const { data, update, fieldError, markTouched, readOnly } =
    useDiphtheriaForm();

  const vitals = data.vitals;
  const displayTemperature =
    vitals.temperatureUnit === "C"
      ? convertTemperature(vitals.temperature, "C", "F")
      : vitals.temperature;

  // For existing NDSS data saved in Celsius, convert its value once
  // without silently reinterpreting the original numeric quantity.
  useEffect(() => {
    if (vitals.temperatureUnit === "C") {
      update({
        section: "vitals",
        patch: {
          temperature: convertTemperature(vitals.temperature, "C", "F"),
          temperatureUnit: "F",
        },
      });
    }
  }, [vitals.temperature, vitals.temperatureUnit, update]);

  const avpuValues: AVPU[] = Array.isArray(vitals.avpu)
    ? vitals.avpu
    : typeof vitals.avpu === "string"
      ? [vitals.avpu as AVPU]
      : [];

  const avpuIsUnresponsive = avpuValues.includes("unresponsive");

  const toggleAVPU = (option: AVPU, checked: boolean) => {
    const next: AVPU[] =
      option === "unresponsive"
        ? checked
          ? ["unresponsive"]
          : []
        : checked
          ? [...avpuValues.filter((value) => value !== "unresponsive"), option]
          : avpuValues.filter((value) => value !== option);

    update({ section: "vitals", patch: { avpu: [...new Set(next)] } });
  };

  const renderNumericField = (key: NumericVitalKey) => {
    const config = NUMERIC_VITAL_FIELDS[key];
    const isSaturation = key === "oxygenSaturation";
    const notMeasured = isSaturation && vitals.oxygenSaturationNotMeasured;

    return (
      <Box
        key={key}
        sx={cellSx}
        data-skipped={notMeasured ? "true" : undefined}
      >
        <NumberField
          id={IDS[key]}
          label={config.label}
          placeholder={config.placeholder}
          unit={config.unit}
          decimal={config.decimal}
          value={vitals[key]}
          onChange={(value) =>
            update({ section: "vitals", patch: { [key]: value } })
          }
          onBlur={() => markTouched(IDS[key])}
          error={fieldError(IDS[key])}
          required={REQUIRED[key] && !notMeasured}
          readOnly={readOnly || notMeasured}
        />
        {isSaturation && (
          <NotMeasuredOption
            id={IDS.oxygenSaturationNotMeasured}
            checked={vitals.oxygenSaturationNotMeasured}
            disabled={readOnly}
            onChange={(checked) =>
              update({
                section: "vitals",
                patch: {
                  oxygenSaturationNotMeasured: checked,
                  ...(checked ? { oxygenSaturation: "" } : {}),
                },
              })
            }
          />
        )}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "minmax(0, 1fr)",
          sm: "repeat(2, minmax(0, 1fr))",
          md: "repeat(4, minmax(0, 1fr))",
        },
        columnGap: { xs: 2, md: 2.5 },
        rowGap: { xs: 2, md: 2.5 },
        alignItems: "start",
        px: { xs: 2, sm: 2.5 },
        py: 2.5,
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
      }}
    >
      {renderNumericField("heartRate")}
      {renderNumericField("respiratoryRate")}

      {/* Temperature is Fahrenheit-only. */}
      <Box
        sx={cellSx}
        data-skipped={vitals.temperatureNotMeasured ? "true" : undefined}
      >
        <FieldLabel
          id={IDS.temperature}
          required={REQUIRED.temperature && !vitals.temperatureNotMeasured}
        >
          Temperature
        </FieldLabel>
        <TextField
          id={IDS.temperature}
          fullWidth
          size="small"
          value={displayTemperature}
          placeholder="Temperature"
          disabled={vitals.temperatureNotMeasured}
          error={Boolean(fieldError(IDS.temperature))}
          onChange={(event) =>
            update({
              section: "vitals",
              patch: { temperature: event.target.value, temperatureUnit: "F" },
            })
          }
          onBlur={() => markTouched(IDS.temperature)}
          slotProps={{
            htmlInput: {
              inputMode: "decimal",
              readOnly,
              "aria-describedby": `${IDS.temperature}-helper`,
            },
            input: {
              endAdornment: <InputAdornment position="end">°F</InputAdornment>,
            },
          }}
        />
        <FieldError
          id={IDS.temperature}
          message={fieldError(IDS.temperature)}
        />
        <NotMeasuredOption
          id={IDS.temperatureNotMeasured}
          checked={vitals.temperatureNotMeasured}
          disabled={readOnly}
          onChange={(checked) =>
            update({
              section: "vitals",
              patch: {
                temperatureNotMeasured: checked,
                temperatureUnit: "F",
                ...(checked ? { temperature: "" } : {}),
              },
            })
          }
        />
      </Box>

      {/* BP — label and placeholder do not include an example. */}
      <Box
        sx={cellSx}
        data-skipped={vitals.bloodPressureNotMeasured ? "true" : undefined}
      >
        <ValidatedField
          id={IDS.bloodPressure}
          label="Blood Pressure"
          placeholder="Blood pressure"
          unit="mmHg"
          value={vitals.bloodPressure}
          onChange={(bloodPressure) =>
            update({ section: "vitals", patch: { bloodPressure } })
          }
          onBlur={() => markTouched(IDS.bloodPressure)}
          error={fieldError(IDS.bloodPressure)}
          required={REQUIRED.bloodPressure && !vitals.bloodPressureNotMeasured}
          readOnly={readOnly || vitals.bloodPressureNotMeasured}
        />
        <NotMeasuredOption
          id={IDS.bloodPressureNotMeasured}
          checked={vitals.bloodPressureNotMeasured}
          disabled={readOnly}
          onChange={(checked) =>
            update({
              section: "vitals",
              patch: {
                bloodPressureNotMeasured: checked,
                ...(checked ? { bloodPressure: "" } : {}),
              },
            })
          }
        />
      </Box>

      {renderNumericField("oxygenSaturation")}

      {/* AVPU: multiple responses except Unresponsive, which is exclusive. */}
      <Box
        sx={{
          ...cellSx,
          gridColumn: { xs: "1 / -1", md: "span 3" },
        }}
      >
        <FieldLabel id={IDS.avpu} required={REQUIRED.avpu}>
          AVPU
        </FieldLabel>
        <FormGroup row id={IDS.avpu} sx={{ gap: 1, minWidth: 0 }}>
          {AVPU_OPTIONS.map((option) => {
            const isSelected = avpuValues.includes(option.value);
            const isLocked =
              avpuIsUnresponsive && option.value !== "unresponsive";

            return (
              <FormControlLabel
                key={option.value}
                label={option.label}
                sx={{
                  m: 0,
                  pl: 0.5,
                  pr: 1.75,
                  minHeight: 42, // same height as the text inputs beside it
                  border: `1px solid ${isSelected ? t.accent : t.inputBorder}`,
                  borderRadius: "8px",
                  bgcolor: isSelected
                    ? t.accentSoft
                    : isLocked
                      ? t.skipped
                      : t.surface,
                  opacity: isLocked ? 0.6 : 1,
                  "&:has(.Mui-focusVisible)": {
                    outline: `2px solid ${t.accent}`,
                    outlineOffset: 2,
                  },
                  "& .MuiFormControlLabel-label": {
                    color: t.ink,
                    fontSize: "0.875rem",
                    fontWeight: isSelected ? 600 : 400,
                    whiteSpace: "nowrap",
                  },
                }}
                control={
                  <Checkbox
                    size="small"
                    checked={isSelected}
                    disabled={readOnly || isLocked}
                    onBlur={() => markTouched(IDS.avpu)}
                    onChange={(event) =>
                      toggleAVPU(option.value, event.target.checked)
                    }
                    sx={{ p: 0.5 }}
                  />
                }
              />
            );
          })}
        </FormGroup>
        <Collapse in={avpuIsUnresponsive} unmountOnExit>
          <Typography sx={{ mt: 0.75, color: t.muted, fontSize: "0.8125rem" }}>
            Unresponsive is exclusive. Clear it to choose other levels.
          </Typography>
        </Collapse>
        <FieldError id={IDS.avpu} message={fieldError(IDS.avpu)} />
      </Box>
    </Box>
  );
}
