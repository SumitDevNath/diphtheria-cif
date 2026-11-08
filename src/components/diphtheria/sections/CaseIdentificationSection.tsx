import { useEffect } from "react";

import { Autocomplete, Box, TextField } from "@mui/material";

import {
  ETHNICITY_OPTIONS,
  IDENTIFICATION_FIELD_IDS as IDS,
  IDENTIFICATION_REQUIRED as REQUIRED,
  OCCUPATION_SUGGESTIONS,
  PREGNANCY_STATUS_OPTIONS,
} from "../constants/form.constants";

import { FieldError, FieldLabel } from "../components/FieldParts";
import { useDiphtheriaForm } from "../context/DiphtheriaFormContext";

import DateField from "../fields/DateField";
import SelectField from "../fields/SelectField";

import {
  isSchoolOccupation,
  showAdultPregnancyFields,
} from "../utils/demographics.utils";

interface Props {
  dateOfBirth?: string | null;
  sex?: string | null;
}

const fieldSx = {
  minWidth: 0,
  width: "100%",
  "& .MuiOutlinedInput-root": {
    minHeight: 42,
    bgcolor: "#FFFFFF",
    borderRadius: "6px",
  },
  "& .MuiInputBase-input": {
    fontSize: "0.875rem",
  },
} as const;

const occupations = [
  ...new Set([...OCCUPATION_SUGGESTIONS, "Teacher", "Student"]),
];

export default function CaseIdentificationSection({ dateOfBirth, sex }: Props) {
  const { data, update, fieldError, markTouched, readOnly } =
    useDiphtheriaForm();

  const identification = data.identification;

  const showSchool = isSchoolOccupation(identification.occupation);

  const showAdultFields = showAdultPregnancyFields(dateOfBirth, sex);

  // Clear fields that stop being applicable when
  // the common-form demographic information changes.
  // Do not erase prefilled values while DOB is unavailable.
  useEffect(() => {
    if (
      dateOfBirth &&
      !showAdultFields &&
      (identification.pregnancyStatus || identification.motherName)
    ) {
      update({
        section: "identification",
        patch: {
          pregnancyStatus: null,
          motherName: "",
        },
      });
    }
  }, [
    dateOfBirth,
    showAdultFields,
    identification.pregnancyStatus,
    identification.motherName,
    update,
  ]);

  const updateText = (key: "motherName" | "schoolName", value: string) => {
    update({
      section: "identification",
      patch: { [key]: value },
    });
  };

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "minmax(0, 1fr)",
          sm: "repeat(2, minmax(0, 1fr))",
          lg: "repeat(3, minmax(0, 1fr))",
        },
        alignItems: "start",
        gap: 2,
        px: { xs: 1.5, sm: 2 },
        py: 2,
        minWidth: 0,
      }}
    >
      {/* OCCUPATION */}
      <Box sx={fieldSx}>
        <FieldLabel id={IDS.occupation} required={REQUIRED.occupation}>
          Occupation
        </FieldLabel>

        <Autocomplete<string, false, false, true>
          freeSolo
          size="small"
          fullWidth
          readOnly={readOnly}
          options={occupations}
          value={identification.occupation ?? ""}
          onInputChange={(_, input, reason) => {
            if (reason === "input" || reason === "clear") {
              update({
                section: "identification",
                patch: {
                  occupation: input || null,
                  ...(isSchoolOccupation(input) ? {} : { schoolName: "" }),
                },
              });
            }
          }}
          onChange={(_, option) => {
            const occupation = typeof option === "string" ? option : null;

            update({
              section: "identification",
              patch: {
                occupation,
                ...(isSchoolOccupation(occupation) ? {} : { schoolName: "" }),
              },
            });
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              id={IDS.occupation}
              placeholder="Select or enter occupation"
              error={Boolean(fieldError(IDS.occupation))}
              onBlur={() => markTouched(IDS.occupation)}
              slotProps={{
                ...params.slotProps,
                htmlInput: {
                  ...params.slotProps.htmlInput,
                  "aria-describedby": `${IDS.occupation}-helper`,
                },
              }}
              sx={fieldSx}
            />
          )}
        />

        <FieldError id={IDS.occupation} message={fieldError(IDS.occupation)} />
      </Box>

      {/* ETHNICITY */}
      <Box sx={fieldSx}>
        <SelectField
          id={IDS.ethnicity}
          label="Ethnicity"
          value={identification.ethnicity}
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
        />
      </Box>

      {/* EXAMINATION DATE */}
      <Box sx={fieldSx}>
        <DateField
          id={IDS.examinationDate}
          label="Date of Examination"
          value={identification.examinationDate}
          onChange={(examinationDate) =>
            update({
              section: "identification",
              patch: { examinationDate },
            })
          }
          onBlur={() => markTouched(IDS.examinationDate)}
          error={fieldError(IDS.examinationDate)}
          required={REQUIRED.examinationDate}
          noFuture
          readOnly={readOnly}
        />
      </Box>

      {/* CONDITIONAL SCHOOL NAME */}
      {showSchool && (
        <Box sx={fieldSx}>
          <FieldLabel id={IDS.schoolName} required={REQUIRED.schoolName}>
            School Name
          </FieldLabel>

          <TextField
            id={IDS.schoolName}
            value={identification.schoolName}
            onChange={(event) => updateText("schoolName", event.target.value)}
            onBlur={() => markTouched(IDS.schoolName)}
            placeholder="Enter school name"
            size="small"
            fullWidth
            error={Boolean(fieldError(IDS.schoolName))}
            slotProps={{
              htmlInput: {
                readOnly,
                "aria-describedby": `${IDS.schoolName}-helper`,
              },
            }}
            sx={fieldSx}
          />

          <FieldError
            id={IDS.schoolName}
            message={fieldError(IDS.schoolName)}
          />
        </Box>
      )}

      {/* COMMON-FORM DOB DEPENDENT FIELDS */}
      {showAdultFields && (
        <>
          <Box sx={fieldSx}>
            <SelectField
              id={IDS.pregnancyStatus}
              label="Pregnancy Status (Female ≥18 years)"
              value={identification.pregnancyStatus}
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
            />
          </Box>
        </>
      )}
    </Box>
  );
}
