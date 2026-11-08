import { Box, FormControlLabel, Typography } from "@mui/material";
import {
  VACCINATION_DOSE_LABEL,
  VACCINATION_DOSE_OPTIONS,
  VACCINATION_FIELD_IDS as IDS,
  VACCINATION_REQUIRED as REQUIRED,
  VACCINATION_SOURCE_OPTIONS,
} from "../constants/vaccination.constants";
import {
  CIF_FONT_SIZES,
  CIF_FONT_WEIGHTS,
} from "../constants/typography.constants";
import { RequiredMark } from "../components/FieldParts";
import { useDiphtheriaForm } from "../context/DiphtheriaFormContext";
import DateField from "../fields/DateField";
import SelectField from "../fields/SelectField";
import ToggleSwitch from "../fields/ToggleSwitch";

const fieldCellSx = {
  minWidth: 0,
  width: "100%",

  // Desktop labels are rendered separately in grid row 1.
  "& .MuiFormLabel-root": {
    display: { lg: "none" },
  },

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

const desktopLabelSx = {
  display: { xs: "none", lg: "block" },
  mb: 0.6,
  minWidth: 0,
  color: "#16355F",
  fontSize: CIF_FONT_SIZES.fieldLabel,
  fontWeight: CIF_FONT_WEIGHTS.fieldLabel,
  lineHeight: 1.45,
} as const;

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
        <ToggleSwitch
          id={IDS.available}
          checked={data.vaccination.available}
          disabled={readOnly}
          ariaLabel="Vaccination history available?"
          onChange={(available) =>
            update({
              section: "vaccination",
              patch: { available },
            })
          }
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

export default function VaccinationHistorySection() {
  const { data, update, fieldError, markTouched, readOnly } =
    useDiphtheriaForm();

  const vaccination = data.vaccination;

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
          sm: "repeat(3, minmax(0, 1fr))",
          lg: "minmax(320px, 1.6fr) repeat(3, minmax(0, 1fr))",
        },

        // Desktop: row 1 = field labels,
        // row 2 = question and input boxes.
        gridTemplateRows: {
          lg: "auto auto",
        },

        alignItems: "start",
        columnGap: { xs: 1.5, sm: 2 },
        rowGap: { xs: 1.25, sm: 1.5, lg: 0 },
        px: { xs: 1.5, sm: 2 },
        py: 2,
        minWidth: 0,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* VACCINATION QUESTION — CENTERED WITH INPUT BOXES */}
      <Box
        sx={{
          gridColumn: {
            xs: "1 / -1",
            lg: "1",
          },
          gridRow: {
            lg: "2",
          },

          display: "flex",
          alignItems: "center",
          minWidth: 0,

          // Match the height of the actual white inputs,
          // rather than the entire field with its label.
          height: { lg: 42 },
          minHeight: { xs: 42, lg: 42 },
        }}
      >
        <Typography
          component="p"
          sx={{
            m: 0,
            color: "#17365F",
            fontWeight: CIF_FONT_WEIGHTS.vaccinationQuestion,
            fontSize: CIF_FONT_SIZES.vaccinationQuestion,
            lineHeight: 1.5,
            overflowWrap: "anywhere",
          }}
        >
          {VACCINATION_DOSE_LABEL}
        </Typography>
      </Box>

      {/* DESKTOP FIELD LABELS — GRID ROW 1 */}
      <Typography
        component="label"
        htmlFor={IDS.source}
        sx={{
          ...desktopLabelSx,
          gridColumn: { lg: "2" },
          gridRow: { lg: "1" },
        }}
      >
        Vaccination source{REQUIRED.source && <RequiredMark />}
      </Typography>

      <Typography
        component="label"
        htmlFor={IDS.doses}
        sx={{
          ...desktopLabelSx,
          gridColumn: { lg: "3" },
          gridRow: { lg: "1" },
        }}
      >
        Dose count{REQUIRED.doses && <RequiredMark />}
      </Typography>

      <Typography
        component="label"
        htmlFor={IDS.lastVaccinationDate}
        sx={{
          ...desktopLabelSx,
          gridColumn: { lg: "4" },
          gridRow: { lg: "1" },
        }}
      >
        Date of last vaccination
        {REQUIRED.lastVaccinationDate && dateApplicable && <RequiredMark />}
      </Typography>

      {/* SOURCE — GRID ROW 2 */}
      <Box
        sx={{
          ...fieldCellSx,
          gridColumn: { lg: "2" },
          gridRow: { lg: "2" },
        }}
      >
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

      {/* DOSE COUNT — GRID ROW 2 */}
      <Box
        sx={{
          ...fieldCellSx,
          gridColumn: { lg: "3" },
          gridRow: { lg: "2" },
        }}
      >
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

      {/* LAST VACCINATION DATE — GRID ROW 2 */}
      <Box
        sx={{
          ...fieldCellSx,
          gridColumn: { lg: "4" },
          gridRow: { lg: "2" },
        }}
      >
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
