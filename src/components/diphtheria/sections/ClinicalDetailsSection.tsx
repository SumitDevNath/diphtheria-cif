import { Box, Typography } from "@mui/material";
import ToggleSwitch from "../fields/ToggleSwitch";
import {
  CLINICAL_FIELD_IDS as IDS,
  CLINICAL_GROUPS,
  CLINICAL_REQUIRED as REQUIRED,
} from "../constants/clinical.constants";
import { useDiphtheriaForm } from "../context/DiphtheriaFormContext";
import CheckboxGroup from "../fields/CheckboxGroup";
import DateField from "../fields/DateField";
import FacilityAutocomplete from "../fields/FacilityAutocomplete";
import { ValidatedField } from "../fields/ValidatedField";
import type { FacilityOption } from "../types/diphtheria.types";

interface ClinicalDetailsSectionProps {
  facilityOptions: readonly FacilityOption[];
  facilityLoading?: boolean;
  facilityLoadError?: string | null;
}

const inputCellSx = {
  minWidth: 0,
  width: "100%",
  "& .MuiOutlinedInput-root": {
    minHeight: 40,
    bgcolor: "#FFFFFF",
    borderRadius: "6px",
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#C9D9EF",
  },
  "& .MuiInputBase-input": {
    fontSize: "0.78rem",
  },
} as const;

export default function ClinicalDetailsSection({
  facilityOptions,
  facilityLoading = false,
  facilityLoadError = null,
}: ClinicalDetailsSectionProps) {
  const {
    data,
    update,
    updateClinicalGroup,
    fieldError,
    markTouched,
    readOnly,
  } = useDiphtheriaForm();

  const clinical = data.clinical;

  return (
    <Box
      sx={{
        px: { xs: 1.5, sm: 2 },
        py: 2,
        minWidth: 0,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* FOUR CLINICAL CHECKBOX GROUPS */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "minmax(0, 1fr)",
            sm: "repeat(2, minmax(0, 1fr))",
            lg: "repeat(4, minmax(0, 1fr))",
          },
          gap: { xs: 1, sm: 1.25 },
          alignItems: "stretch",
          minWidth: 0,
        }}
      >
        {CLINICAL_GROUPS.map(({ key, number, title, options }) => (
          <Box
            key={key}
            sx={{
              minWidth: 0,
              height: "100%",
            }}
          >
            <CheckboxGroup
              id={IDS[key]}
              number={number}
              title={title}
              required={REQUIRED[key]}
              options={options}
              value={clinical[key]}
              onChange={(nextValue) => updateClinicalGroup(key, nextValue)}
              onBlur={() => markTouched(IDS[key])}
              error={fieldError(IDS[key])}
              readOnly={readOnly}
            />
          </Box>
        ))}
      </Box>

      {/* HOSPITAL / FACILITY VISIT DETAILS */}
      <Box
        component="section"
        aria-labelledby="clinical-facility-heading"
        sx={{
          mt: 2,
          p: { xs: 1.25, sm: 1.5 },
          border: "1px solid #E2EAF5",
          borderRadius: "7px",
          bgcolor: "#F6F9FE",
          minWidth: 0,
        }}
      >
        {/* Heading on the left, compact toggle question and switch on the right. */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            columnGap: 2,
            rowGap: 1,
            mb: clinical.hospitalVisitAvailable ? 1.5 : 0,
            minWidth: 0,
          }}
        >
          <Typography
            id="clinical-facility-heading"
            component="h3"
            sx={{
              m: 0,
              fontSize: "1rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.015em",
            }}
          >
            Hospital / Facility Visit Details
          </Typography>

          <Box
            sx={{
              display: "inline-flex",
              flexShrink: { xs: 1, md: 0 },
              minWidth: 0,
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 1,
              px: 1.25,
              py: 0.5,
              bgcolor: "#DEEBFB",
              borderRadius: "12px",
              maxWidth: "100%",
            }}
          >
            <Typography
              sx={{
                color: "#173B69",
                fontSize: "0.875rem",
                fontWeight: 600,
                lineHeight: 1.4,
              }}
            >
              Is hospital visit details available?
            </Typography>
            <ToggleSwitch
              id={IDS.hospitalVisitAvailable}
              checked={clinical.hospitalVisitAvailable}
              disabled={readOnly}
              ariaLabel="Is hospital visit details available?"
              onChange={(hospitalVisitAvailable) =>
                update({
                  section: "clinical",
                  patch: { hospitalVisitAvailable },
                })
              }
            />
          </Box>
        </Box>

        {clinical.hospitalVisitAvailable && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                sm: "repeat(2, minmax(0, 1fr))",
                md: [
                  "minmax(0, 2.2fr)",
                  "minmax(0, 1.1fr)",
                  "minmax(0, 1.1fr)",
                  "minmax(0, 1fr)",
                ].join(" "),
              },
              columnGap: { xs: 1.5, sm: 2 },
              rowGap: 1.25,
              alignItems: "start",
              minWidth: 0,
            }}
          >
            {/* HOSPITAL / FACILITY */}
            <Box sx={inputCellSx}>
              <FacilityAutocomplete
                id={IDS.hospital}
                label="Name of hospital/facility"
                value={clinical.hospital}
                onChange={(hospital) =>
                  update({
                    section: "clinical",
                    patch: { hospital },
                  })
                }
                options={facilityOptions}
                loading={facilityLoading}
                loadError={facilityLoadError}
                onBlur={() => markTouched(IDS.hospital)}
                error={fieldError(IDS.hospital)}
                required={REQUIRED.hospital}
                readOnly={readOnly}
              />
            </Box>

            {/* DATE OF VISIT */}
            <Box sx={inputCellSx}>
              <DateField
                id={IDS.visitDate}
                label="Date of Visit"
                value={clinical.visitDate}
                onChange={(visitDate) =>
                  update({
                    section: "clinical",
                    patch: { visitDate },
                  })
                }
                onBlur={() => markTouched(IDS.visitDate)}
                error={fieldError(IDS.visitDate)}
                required={REQUIRED.visitDate}
                readOnly={readOnly}
                noFuture
              />
            </Box>

            {/* DATE OF ADMISSION */}
            <Box sx={inputCellSx}>
              <DateField
                id={IDS.admissionDate}
                label="Date of Admission"
                value={clinical.admissionDate}
                onChange={(admissionDate) =>
                  update({
                    section: "clinical",
                    patch: { admissionDate },
                  })
                }
                onBlur={() => markTouched(IDS.admissionDate)}
                error={fieldError(IDS.admissionDate)}
                required={REQUIRED.admissionDate}
                readOnly={readOnly}
                noFuture
              />
            </Box>

            {/* HOSPITAL RECORD NUMBER */}
            <Box sx={inputCellSx}>
              <ValidatedField
                id={IDS.hospitalRecordNumber}
                label="Hospital Record No."
                placeholder="Record number"
                value={clinical.hospitalRecordNumber}
                onChange={(hospitalRecordNumber) =>
                  update({
                    section: "clinical",
                    patch: { hospitalRecordNumber },
                  })
                }
                onBlur={() => markTouched(IDS.hospitalRecordNumber)}
                error={fieldError(IDS.hospitalRecordNumber)}
                required={REQUIRED.hospitalRecordNumber}
                readOnly={readOnly}
              />
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
