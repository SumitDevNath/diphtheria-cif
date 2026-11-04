import { Box, FormControlLabel, Switch, Typography } from "@mui/material";
import {
  VACCINATION_DOSE_LABEL,
  VACCINATION_DOSE_OPTIONS,
  VACCINATION_FIELD_IDS as IDS,
  VACCINATION_REQUIRED as REQUIRED,
  VACCINATION_SOURCE_OPTIONS,
} from "../constants/vaccination.constants";
import { useDiphtheriaForm } from "../context/DiphtheriaFormContext";
import DateField from "../fields/DateField";
import SelectField from "../fields/SelectField";

const fieldCellSx = {
  minWidth: 0,
  width: "100%",
  "& .MuiOutlinedInput-root": {
    minHeight: 42,
    bgcolor: "#FFFFFF",
    borderRadius: "6px",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#C9D9EF",
  },
  "& .MuiInputBase-input": {
    fontSize: "0.78rem",
  },
  "& .MuiSelect-select": {
    fontSize: "0.78rem",
  },
} as const;

/**
 * Header-level toggle.
 * OFF is a valid boolean value, not an unanswered field.
 */
export function VaccinationAvailabilitySwitch() {
  const { data, update, readOnly } = useDiphtheriaForm();

  return (
    <FormControlLabel
      labelPlacement="start"
      label={
        <Typography
          sx={{
            color: "#16355F",
            fontSize: "0.74rem",
            fontWeight: 600,
            lineHeight: 1.4,
          }}
        >
          Vaccination history available?
        </Typography>
      }
      control={
        <Switch
          id={IDS.available}
          size="small"
          checked={data.vaccination.available}
          disabled={readOnly}
          onChange={(event) =>
            update({
              section: "vaccination",
              patch: {
                available: event.target.checked,
              },
            })
          }
          slotProps={{
            input: {
              "aria-label": "Vaccination history available?",
              "aria-controls": "vaccination-history-fields",
            },
          }}
        />
      }
      sx={{
        m: 0,
        px: 1.25,
        py: 0.25,
        gap: 0.75,
        maxWidth: "100%",
        bgcolor: "#E3EEFF",
        borderRadius: "12px",
      }}
    />
  );
}

/**
 * Vaccination record fields.
 * The parent SectionHeader renders the availability switch.
 */
export default function VaccinationHistorySection() {
  const { data, update, fieldError, markTouched, readOnly } =
    useDiphtheriaForm();

  const vaccination = data.vaccination;

  // Keep externally provided dose counts displayable, even
  // when they are outside the provisional dropdown range.
  const doseOptions =
    vaccination.doses !== null &&
    !VACCINATION_DOSE_OPTIONS.some(
      (option) => option.value === vaccination.doses,
    )
      ? [
          ...VACCINATION_DOSE_OPTIONS,
          {
            value: vaccination.doses,
            label: String(vaccination.doses),
          },
        ]
      : VACCINATION_DOSE_OPTIONS;

  // The last vaccination date is not applicable for
  // zero doses, or until a dose count is selected.
  const dateApplicable = vaccination.doses !== null && vaccination.doses > 0;

  if (!vaccination.available) {
    return null;
  }

  return (
    <Box
      id="vaccination-history-fields"
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "minmax(0, 1fr)",
          sm: "repeat(2, minmax(0, 1fr))",
          md: [
            "minmax(0, 4.6fr)",
            "minmax(0, 1.5fr)",
            "minmax(0, 1fr)",
            "minmax(0, 2.3fr)",
          ].join(" "),
        },
        alignItems: "center",
        columnGap: { xs: 1.5, sm: 2 },
        rowGap: { xs: 1.25, sm: 1.5 },
        px: { xs: 1.5, sm: 2 },
        py: 2,
        minWidth: 0,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* VACCINATION DOSE INFORMATION LABEL */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          minWidth: 0,
          minHeight: 42,
          gridColumn: {
            xs: "auto",
            sm: "1 / -1",
            md: "auto",
          },
        }}
      >
        <Typography
          component="p"
          sx={{
            color: "#17365F",
            fontWeight: 600,
            fontSize: "0.75rem",
            lineHeight: 1.5,
          }}
        >
          {VACCINATION_DOSE_LABEL}
        </Typography>
      </Box>

      {/* SOURCE: BY CARD / HISTORY */}
      <Box sx={fieldCellSx}>
        <SelectField
          id={IDS.source}
          label="Vaccination source"
          placeholder="By Card / History"
          value={vaccination.source}
          options={VACCINATION_SOURCE_OPTIONS}
          onChange={(source) =>
            update({
              section: "vaccination",
              patch: { source },
            })
          }
          onBlur={() => markTouched(IDS.source)}
          error={fieldError(IDS.source)}
          required={REQUIRED.source}
          readOnly={readOnly}
        />
      </Box>

      {/* NUMBER OF DOSES */}
      <Box sx={fieldCellSx}>
        <SelectField
          id={IDS.doses}
          label="Dose count"
          placeholder="Select"
          value={vaccination.doses}
          options={doseOptions}
          onChange={(doses) =>
            update({
              section: "vaccination",
              patch: { doses },
            })
          }
          onBlur={() => markTouched(IDS.doses)}
          error={fieldError(IDS.doses)}
          required={REQUIRED.doses}
          readOnly={readOnly}
        />
      </Box>

      {/* DATE OF LAST VACCINATION */}
      <Box sx={fieldCellSx}>
        <DateField
          id={IDS.lastVaccinationDate}
          label="Date of last vaccination"
          value={vaccination.lastVaccinationDate}
          onChange={(lastVaccinationDate) =>
            update({
              section: "vaccination",
              patch: { lastVaccinationDate },
            })
          }
          onBlur={() => markTouched(IDS.lastVaccinationDate)}
          error={fieldError(IDS.lastVaccinationDate)}
          required={REQUIRED.lastVaccinationDate && dateApplicable}
          readOnly={readOnly || !dateApplicable}
          noFuture
        />
      </Box>
    </Box>
  );
}
