import { Autocomplete, Box, TextField } from "@mui/material";
import { FieldError, FieldLabel } from "../components/FieldParts";
import {
  ETHNICITY_OPTIONS,
  IDENTIFICATION_FIELD_IDS as IDS,
  IDENTIFICATION_REQUIRED as REQUIRED,
  OCCUPATION_SUGGESTIONS,
  PREGNANCY_STATUS_OPTIONS,
} from "../constants/form.constants";
import { useDiphtheriaForm } from "../context/DiphtheriaFormContext";
import DateField from "../fields/DateField";
import SelectField from "../fields/SelectField";
import { ValidatedField } from "../fields/ValidatedField";

const inputCellSx = {
  minWidth: 0,
  "& .MuiOutlinedInput-root": {
    minHeight: 48,
    borderRadius: "6px",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#C9D9EF",
  },
  "& .MuiInputBase-input": {
    fontSize: "0.78rem",
  },
};

interface OccupationFieldProps {
  value: string | null;
  onChange: (value: string | null) => void;
  onBlur: () => void;
  error?: string;
  readOnly: boolean;
}

function OccupationField({
  value,
  onChange,
  onBlur,
  error,
  readOnly,
}: OccupationFieldProps) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <FieldLabel id={IDS.occupation} required={REQUIRED.occupation}>
        Occupation
      </FieldLabel>

      <Autocomplete<string, false, false, true>
        id={IDS.occupation}
        freeSolo
        options={OCCUPATION_SUGGESTIONS}
        value={value}
        readOnly={readOnly}
        onChange={(_, nextValue) => onChange(nextValue?.trim() || null)}
        onInputChange={(_, text, reason) => {
          if (reason === "input" || reason === "clear") {
            onChange(text || null);
          }
        }}
        onBlur={onBlur}
        renderInput={(params) => (
          <TextField
            {...params}
            size="small"
            placeholder="Select or enter occupation"
            error={Boolean(error)}
            slotProps={{
              ...params.slotProps,
              htmlInput: {
                ...params.slotProps.htmlInput,
                "aria-describedby": `${IDS.occupation}-helper`,
              },
            }}
          />
        )}
      />

      <FieldError id={IDS.occupation} message={error} />
    </Box>
  );
}

export default function CaseIdentificationSection() {
  const { data, update, fieldError, markTouched, readOnly } =
    useDiphtheriaForm();

  const values = data.identification;

  return (
    <Box
      sx={{
        px: { xs: 1.5, sm: 2 },
        py: 2,
        minWidth: 0,
      }}
    >
      {/* FIRST ROW */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            sm: "repeat(2, minmax(0, 1fr))",
            md: "minmax(0, 5fr) minmax(0, 3fr) minmax(0, 3fr)",
          },
          columnGap: { xs: 1.5, sm: 2, md: 2.5 },
          rowGap: 1.25,
        }}
      >
        {/* Mother's name */}
        <Box sx={inputCellSx}>
          <ValidatedField
            id={IDS.motherName}
            label="Mother's name"
            value={values.motherName}
            onChange={(motherName) =>
              update({
                section: "identification",
                patch: { motherName },
              })
            }
            onBlur={() => markTouched(IDS.motherName)}
            error={fieldError(IDS.motherName)}
            required={REQUIRED.motherName}
            readOnly={readOnly}
          />
        </Box>

        {/* Occupation */}
        <Box sx={inputCellSx}>
          <OccupationField
            value={values.occupation}
            onChange={(occupation) =>
              update({
                section: "identification",
                patch: { occupation },
              })
            }
            onBlur={() => markTouched(IDS.occupation)}
            error={fieldError(IDS.occupation)}
            readOnly={readOnly}
          />
        </Box>

        {/* Ethnicity */}
        <Box sx={inputCellSx}>
          <SelectField
            id={IDS.ethnicity}
            label="Ethnicity"
            value={values.ethnicity}
            options={ETHNICITY_OPTIONS}
            onChange={(ethnicity) =>
              update({
                section: "identification",
                patch: { ethnicity },
              })
            }
            onBlur={() => markTouched(IDS.ethnicity)}
            error={fieldError(IDS.ethnicity)}
            required={REQUIRED.ethnicity}
            readOnly={readOnly}
            placeholder="Select ethnicity"
          />
        </Box>
      </Box>

      {/* SECOND ROW */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            sm: "repeat(2, minmax(0, 1fr))",
            md: "minmax(0, 3fr) minmax(0, 2fr) minmax(0, 5.5fr)",
          },
          columnGap: { xs: 1.5, sm: 2, md: 2.5 },
          rowGap: 1.25,
          mt: { xs: 1.25, sm: 1.5, md: 1.75 },
        }}
      >
        {/* Pregnancy status */}
        <Box sx={inputCellSx}>
          <SelectField
            id={IDS.pregnancyStatus}
            label="If Female of Child Bearing Age, Pregnancy Status"
            value={values.pregnancyStatus}
            options={PREGNANCY_STATUS_OPTIONS}
            onChange={(pregnancyStatus) =>
              update({
                section: "identification",
                patch: { pregnancyStatus },
              })
            }
            onBlur={() => markTouched(IDS.pregnancyStatus)}
            error={fieldError(IDS.pregnancyStatus)}
            required={REQUIRED.pregnancyStatus}
            readOnly={readOnly}
            placeholder="Select status"
          />
        </Box>

        {/* Date of examination */}
        <Box sx={inputCellSx}>
          <DateField
            id={IDS.examinationDate}
            label="Date of examination"
            value={values.examinationDate}
            onChange={(examinationDate) =>
              update({
                section: "identification",
                patch: { examinationDate },
              })
            }
            onBlur={() => markTouched(IDS.examinationDate)}
            error={fieldError(IDS.examinationDate)}
            required={REQUIRED.examinationDate}
            readOnly={readOnly}
            noFuture
          />
        </Box>

        {/* School name */}
        <Box
          sx={{
            ...inputCellSx,
            gridColumn: {
              xs: "auto",
              sm: "1 / -1",
              md: "auto",
            },
          }}
        >
          <ValidatedField
            id={IDS.schoolName}
            label="School name (if applicable)"
            placeholder="Enter school name"
            value={values.schoolName}
            onChange={(schoolName) =>
              update({
                section: "identification",
                patch: { schoolName },
              })
            }
            onBlur={() => markTouched(IDS.schoolName)}
            error={fieldError(IDS.schoolName)}
            required={REQUIRED.schoolName}
            readOnly={readOnly}
          />
        </Box>
      </Box>
    </Box>
  );
}
