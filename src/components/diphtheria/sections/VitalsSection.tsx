import { useEffect } from "react";
import {
  Box,
  Checkbox,
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

const fieldCellSx = {
  minWidth: 0,
  width: "100%",
  "& .MuiOutlinedInput-root": {
    minHeight: 40,
    borderRadius: "6px",
    bgcolor: "#FFFFFF",
  },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#C9D9EF" },
  "& .MuiInputBase-input": { minWidth: 0, fontSize: "0.78rem" },
  "& .MuiInputAdornment-root .MuiTypography-root": {
    color: "#5B708C",
    fontSize: "0.7rem",
    whiteSpace: "nowrap",
  },
} as const;

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
        mt: 0.25,
        "& .MuiFormControlLabel-label": {
          fontSize: "0.75rem",
          color: "#476181",
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
      <Box key={key} sx={fieldCellSx}>
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
        columnGap: { xs: 1.5, sm: 2, md: 2.5 },
        rowGap: { xs: 1, sm: 1.5 },
        px: { xs: 1.5, sm: 2 },
        py: 2,
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
      }}
    >
      {renderNumericField("heartRate")}
      {renderNumericField("respiratoryRate")}

      {/* Temperature is Fahrenheit-only. */}
      <Box sx={fieldCellSx}>
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
      <Box sx={fieldCellSx}>
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
          ...fieldCellSx,
          gridColumn: { xs: "1 / -1", sm: "1 / -1", md: "span 3" },
        }}
      >
        <FieldLabel id={IDS.avpu} required={REQUIRED.avpu}>
          AVPU
        </FieldLabel>
        <FormGroup
          row
          id={IDS.avpu}
          sx={{
            display: "flex",
            flexWrap: "nowrap",
            alignItems: "center",
            columnGap: { xs: 1, sm: 2 },
            overflowX: "auto",
            width: "100%",
            minWidth: 0,
          }}
        >
          {AVPU_OPTIONS.map((option) => (
            <FormControlLabel
              key={option.value}
              sx={{
                m: 0,
                mr: 0.75,
                flexShrink: 0,
                "& .MuiFormControlLabel-label": {
                  fontSize: "0.9375rem",
                  color: "#17365F",
                },
              }}
              control={
                <Checkbox
                  size="small"
                  checked={avpuValues.includes(option.value)}
                  disabled={
                    readOnly ||
                    (avpuIsUnresponsive && option.value !== "unresponsive")
                  }
                  onBlur={() => markTouched(IDS.avpu)}
                  onChange={(event) =>
                    toggleAVPU(option.value, event.target.checked)
                  }
                  sx={{ p: 0.5 }}
                />
              }
              label={
                <Typography
                  sx={{ fontSize: "0.9375rem", whiteSpace: "nowrap" }}
                >
                  {option.label}
                </Typography>
              }
            />
          ))}
        </FormGroup>
        <FieldError id={IDS.avpu} message={fieldError(IDS.avpu)} />
      </Box>
    </Box>
  );
}
