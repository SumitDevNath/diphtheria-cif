import {
  Box,
  InputAdornment,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
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
import SelectField from "../fields/SelectField";
import { NumberField, ValidatedField } from "../fields/ValidatedField";
import type { TemperatureUnit } from "../types/diphtheria.types";

const fieldCellSx = {
  minWidth: 0,
  width: "100%",
  "& .MuiOutlinedInput-root": {
    minHeight: 40,
    borderRadius: "6px",
    bgcolor: "#FFFFFF",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#C9D9EF",
  },
  "& .MuiInputBase-input": {
    minWidth: 0,
    fontSize: "0.78rem",
  },
  "& .MuiInputAdornment-root": {
    "& .MuiTypography-root": {
      color: "#5B708C",
      fontSize: "0.7rem",
      whiteSpace: "nowrap",
    },
  },
} as const;

export default function VitalsSection() {
  const { data, update, fieldError, markTouched, readOnly } =
    useDiphtheriaForm();

  const vitals = data.vitals;

  const renderNumericField = (key: NumericVitalKey) => {
    const config = NUMERIC_VITAL_FIELDS[key];

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
            update({
              section: "vitals",
              patch: { [key]: value },
            })
          }
          onBlur={() => markTouched(IDS[key])}
          error={fieldError(IDS[key])}
          required={REQUIRED[key]}
          readOnly={readOnly}
        />
      </Box>
    );
  };

  const changeTemperatureUnit = (nextUnit: TemperatureUnit) => {
    if (nextUnit === vitals.temperatureUnit) return;

    update({
      section: "vitals",
      patch: {
        temperatureUnit: nextUnit,
        // Avoid silently reinterpreting the existing measurement.
        temperature: "",
      },
    });
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
      {/* ROW 1: HEART RATE */}
      {renderNumericField("heartRate")}

      {/* ROW 1: RESPIRATORY RATE */}
      {renderNumericField("respiratoryRate")}

      {/* ROW 1: TEMPERATURE */}
      <Box sx={fieldCellSx}>
        <FieldLabel id={IDS.temperature} required={REQUIRED.temperature}>
          Temperature
        </FieldLabel>

        <TextField
          id={IDS.temperature}
          fullWidth
          size="small"
          value={vitals.temperature}
          placeholder="Temperature"
          error={Boolean(fieldError(IDS.temperature))}
          onChange={(event) =>
            update({
              section: "vitals",
              patch: {
                temperature: event.target.value,
              },
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
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip
                    title="Changing units clears the entered temperature."
                    arrow
                  >
                    <ToggleButtonGroup
                      size="small"
                      exclusive
                      value={vitals.temperatureUnit}
                      disabled={readOnly}
                      aria-label="Temperature unit"
                      onChange={(_, nextUnit) => {
                        if (nextUnit === "C" || nextUnit === "F") {
                          changeTemperatureUnit(nextUnit);
                        }
                      }}
                      sx={{
                        height: 28,
                        "& .MuiToggleButton-root": {
                          minWidth: 33,
                          px: 0.6,
                          py: 0.25,
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          textTransform: "none",
                          color: "#64748B",
                          borderColor: "#D4E0EE",
                          "&.Mui-selected": {
                            bgcolor: "#EAF3FF",
                            color: "#1755C9",
                            "&:hover": {
                              bgcolor: "#EAF3FF",
                            },
                          },
                        },
                      }}
                    >
                      <ToggleButton value="C" aria-label="Celsius">
                        °C
                      </ToggleButton>

                      <ToggleButton value="F" aria-label="Fahrenheit">
                        °F
                      </ToggleButton>
                    </ToggleButtonGroup>
                  </Tooltip>
                </InputAdornment>
              ),
            },
          }}
        />

        <FieldError
          id={IDS.temperature}
          message={fieldError(IDS.temperature)}
        />
      </Box>

      {/* ROW 2: BLOOD PRESSURE */}
      <Box sx={fieldCellSx}>
        <ValidatedField
          id={IDS.bloodPressure}
          label="BP"
          placeholder="Blood pressure (120/80)"
          unit="mmHg"
          value={vitals.bloodPressure}
          onChange={(bloodPressure) =>
            update({
              section: "vitals",
              patch: { bloodPressure },
            })
          }
          onBlur={() => markTouched(IDS.bloodPressure)}
          error={fieldError(IDS.bloodPressure)}
          required={REQUIRED.bloodPressure}
          readOnly={readOnly}
        />
      </Box>

      {/* ROW 2: OXYGEN SATURATION */}
      {renderNumericField("oxygenSaturation")}

      {/* ROW 2: AVPU */}
      <Box sx={fieldCellSx}>
        <SelectField
          id={IDS.avpu}
          label="AVPU"
          placeholder="Select AVPU"
          value={vitals.avpu}
          options={AVPU_OPTIONS}
          onChange={(avpu) =>
            update({
              section: "vitals",
              patch: { avpu },
            })
          }
          onBlur={() => markTouched(IDS.avpu)}
          error={fieldError(IDS.avpu)}
          required={REQUIRED.avpu}
          readOnly={readOnly}
        />
      </Box>
    </Box>
  );
}
