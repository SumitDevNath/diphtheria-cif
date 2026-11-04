import type { ReactNode } from "react";
import {
  Autocomplete,
  Box,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { FieldError } from "../components/FieldParts";
import {
  BACKGROUND_FIELD_IDS as IDS,
  BACKGROUND_REQUIRED as REQUIRED,
  BINARY_RESPONSE_OPTIONS,
  CAREGIVER_COUNT_OPTIONS,
  CONTACT_RESPONSE_OPTIONS,
} from "../constants/background.constants";
import { useDiphtheriaForm } from "../context/DiphtheriaFormContext";
import DateField from "../fields/DateField";
import FacilityAutocomplete from "../fields/FacilityAutocomplete";
import type { FacilityOption, Option } from "../types/diphtheria.types";

const inputSx = {
  minWidth: 0,
  "& .MuiOutlinedInput-root": {
    bgcolor: "#FFFFFF",
    borderRadius: "6px",
    minHeight: 36,
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#C9D9EF",
  },
  "& .MuiInputBase-input": {
    fontSize: "0.78rem",
  },
};

interface QuestionRowProps {
  number: number;
  label: string;
  fieldId: string;
  error?: string;
  children: ReactNode;
}

/**
 * Shared alignment for all numbered questions.
 * The label and control are vertically centered.
 * Errors appear below the row without affecting alignment.
 */
function QuestionRow({
  number,
  label,
  fieldId,
  error,
  children,
}: QuestionRowProps) {
  return (
    <Box sx={{ minWidth: 0, width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          alignItems: { xs: "flex-start", sm: "center" },
          flexWrap: "wrap",
          columnGap: 1.5,
          rowGap: 0.75,
          minWidth: 0,
        }}
      >
        {/* Question number and label */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            minHeight: 36,
            minWidth: 0,
            maxWidth: "100%",
          }}
        >
          <Box
            sx={{
              display: "grid",
              placeItems: "center",
              width: 23,
              height: 23,
              flexShrink: 0,
              borderRadius: "50%",
              bgcolor: "#EAF3FF",
              color: "#1755C9",
              fontWeight: 700,
              fontSize: "0.72rem",
            }}
          >
            {number}
          </Box>

          <Typography
            sx={{
              color: "#17365F",
              fontSize: "0.78rem",
              lineHeight: 1.5,
              minWidth: 0,
              overflowWrap: "break-word",
            }}
          >
            {label}
          </Typography>
        </Box>

        {/* Answer control — same alignment for every question */}
        <Box
          sx={{
            minWidth: 0,
            maxWidth: "100%",
            display: "flex",
            alignItems: "center",
            minHeight: 36,
          }}
        >
          {children}
        </Box>
      </Box>

      {error && (
        <Box sx={{ mt: 0.25, pl: { xs: 0, sm: 4 } }}>
          <FieldError id={fieldId} message={error} />
        </Box>
      )}
    </Box>
  );
}

interface AnswerButtonsProps<T extends string> {
  id: string;
  label: string;
  options: readonly Option<T>[];
  value: T | null;
  onChange: (value: T | null) => void;
  onBlur: () => void;
  error?: string;
  readOnly: boolean;
}

function AnswerButtons<T extends string>({
  id,
  label,
  options,
  value,
  onChange,
  onBlur,
  error,
  readOnly,
}: AnswerButtonsProps<T>) {
  return (
    <ToggleButtonGroup
      id={id}
      aria-label={label}
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${id}-helper` : undefined}
      exclusive
      size="small"
      value={value}
      disabled={readOnly}
      onChange={(_, nextValue: T | null) => {
        onChange(nextValue);
      }}
      onBlur={onBlur}
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: 0.5,
        "& .MuiToggleButton-root": {
          minWidth: 51,
          height: 36,
          px: 1.25,
          py: 0.5,
          border: `1px solid ${error ? "#D32F2F" : "#D4E0EE"} !important`,
          borderRadius: "5px !important",
          textTransform: "none",
          fontSize: "0.72rem",
          color: "#476181",
          "&.Mui-selected": {
            bgcolor: "#EAF3FF",
            color: "#164CA4",
            "&:hover": {
              bgcolor: "#EAF3FF",
            },
          },
        },
      }}
    >
      {options.map((option) => (
        <ToggleButton key={option.value} value={option.value}>
          {option.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
}

interface DetailsFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  error?: string;
  readOnly: boolean;
  placeholder: string;
}

function DetailsField({
  id,
  value,
  onChange,
  onBlur,
  error,
  readOnly,
  placeholder,
}: DetailsFieldProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", sm: "row" },
        alignItems: { xs: "stretch", sm: "flex-start" },
        gap: 1,
        pl: { xs: 0, sm: 4 },
        mt: 0.75,
        maxWidth: 740,
        minWidth: 0,
      }}
    >
      <Typography
        component="label"
        htmlFor={id}
        sx={{
          pt: { xs: 0, sm: 1 },
          flexShrink: 0,
          color: "#17365F",
          fontWeight: 600,
          fontSize: "0.73rem",
        }}
      >
        If yes, details
      </Typography>

      <Box sx={{ flex: 1, ...inputSx }}>
        <TextField
          id={id}
          fullWidth
          size="small"
          placeholder={placeholder}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          error={Boolean(error)}
          slotProps={{
            htmlInput: {
              readOnly,
              "aria-describedby": error ? `${id}-helper` : undefined,
            },
          }}
        />

        {error && <FieldError id={id} message={error} />}
      </Box>
    </Box>
  );
}

export interface TravelHistoryBridge {
  value: unknown;
  onChange: (value: unknown) => void;
  readOnly: boolean;
}

export type TravelHistoryRenderer = (bridge: TravelHistoryBridge) => ReactNode;

interface BackgroundInformationSectionProps {
  facilityOptions: readonly FacilityOption[];
  facilityLoading?: boolean;
  facilityLoadError?: string | null;
  renderTravelHistory?: TravelHistoryRenderer;
}

export default function BackgroundInformationSection({
  facilityOptions,
  facilityLoading = false,
  facilityLoadError = null,
  renderTravelHistory,
}: BackgroundInformationSectionProps) {
  const { data, update, setTravelHistory, markTouched, fieldError, readOnly } =
    useDiphtheriaForm();

  const background = data.background;

  const updateBackground = (patch: Partial<typeof background>) => {
    update({ section: "background", patch });
  };

  const contactIsYes = background.contactKnownCase === "yes";

  return (
    <Box
      sx={{
        px: { xs: 1.5, sm: 2 },
        py: 2,
        minWidth: 0,
      }}
    >
      {/* QUESTION 1 */}
      <Box
        sx={{
          pb: contactIsYes ? 1.5 : 0,
          borderBottom: contactIsYes ? "1px solid #E4ECF6" : "none",
        }}
      >
        <QuestionRow
          number={1}
          label="Contact with known case of Diphtheria / similar illness within 10 days prior to illness"
          fieldId={IDS.contactKnownCase}
          error={fieldError(IDS.contactKnownCase)}
        >
          <AnswerButtons
            id={IDS.contactKnownCase}
            label="Contact with known Diphtheria case"
            options={CONTACT_RESPONSE_OPTIONS}
            value={background.contactKnownCase}
            onChange={(contactKnownCase) =>
              updateBackground({ contactKnownCase })
            }
            onBlur={() => markTouched(IDS.contactKnownCase)}
            error={fieldError(IDS.contactKnownCase)}
            readOnly={readOnly}
          />
        </QuestionRow>

        {contactIsYes && (
          <DetailsField
            id={IDS.contactDetails}
            value={background.contactDetails}
            placeholder="Enter contact details"
            onChange={(contactDetails) => updateBackground({ contactDetails })}
            onBlur={() => markTouched(IDS.contactDetails)}
            error={fieldError(IDS.contactDetails)}
            readOnly={readOnly}
          />
        )}
      </Box>

      {/* REMAINING QUESTIONS ONLY WHEN QUESTION 1 IS YES */}
      {contactIsYes && (
        <>
          {/* EXTERNAL TRAVEL HISTORY */}
          <Box
            component="section"
            aria-label="Travel History"
            sx={{
              mt: 1.5,
              mb: 1.5,
              maxWidth: { xs: "100%", lg: "72%" },
              border: "1px solid #D6E4F5",
              borderRadius: "8px",
              overflow: "hidden",
              minWidth: 0,
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.3,
                borderBottom: "1px solid #D6E4F5",
                bgcolor: "#FBFDFF",
              }}
            >
              <Typography
                component="h3"
                sx={{
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  color: "#13345E",
                }}
              >
                Travel History
              </Typography>
            </Box>

            <Box
              sx={{
                p: { xs: 1.5, sm: 2 },
                minWidth: 0,
              }}
            >
              {renderTravelHistory ? (
                renderTravelHistory({
                  value: background.travelHistory,
                  onChange: setTravelHistory,
                  readOnly,
                })
              ) : (
                <Typography
                  variant="body2"
                  sx={{
                    color: "#718096",
                    fontSize: "0.78rem",
                  }}
                >
                  External Travel History module will be integrated here. No
                  travel-history fields are implemented in this form.
                </Typography>
              )}
            </Box>
          </Box>

          {/* QUESTION 2 */}
          <Box
            sx={{
              py: 1.1,
              borderBottom: "1px solid #E4ECF6",
            }}
          >
            <QuestionRow
              number={2}
              label="Number of persons living in the household"
              fieldId={IDS.householdSize}
              error={fieldError(IDS.householdSize)}
            >
              <Box
                sx={{
                  width: 140,
                  maxWidth: "100%",
                  ...inputSx,
                }}
              >
                <TextField
                  id={IDS.householdSize}
                  fullWidth
                  size="small"
                  value={background.householdSize}
                  placeholder="Number"
                  error={Boolean(fieldError(IDS.householdSize))}
                  onChange={(event) =>
                    updateBackground({
                      householdSize: event.target.value,
                    })
                  }
                  onBlur={() => markTouched(IDS.householdSize)}
                  slotProps={{
                    htmlInput: {
                      inputMode: "numeric",
                      readOnly,
                      "aria-label": "Number of persons living in the household",
                      "aria-describedby": fieldError(IDS.householdSize)
                        ? `${IDS.householdSize}-helper`
                        : undefined,
                    },
                  }}
                />
              </Box>
            </QuestionRow>
          </Box>

          {/* QUESTION 3 */}
          <Box
            sx={{
              py: 1.1,
              borderBottom: "1px solid #E4ECF6",
            }}
          >
            <QuestionRow
              number={3}
              label="Number of accompanying care givers treated with antibiotics?"
              fieldId={IDS.caregiversTreated}
              error={fieldError(IDS.caregiversTreated)}
            >
              <Box
                sx={{
                  width: 150,
                  maxWidth: "100%",
                  ...inputSx,
                }}
              >
                <Autocomplete<string, false, false, true>
                  id={IDS.caregiversTreated}
                  freeSolo
                  options={CAREGIVER_COUNT_OPTIONS}
                  value={background.caregiversTreated}
                  readOnly={readOnly}
                  onChange={(_, nextValue) =>
                    updateBackground({
                      caregiversTreated: nextValue,
                    })
                  }
                  onInputChange={(_, text, reason) => {
                    if (reason === "input" || reason === "clear") {
                      updateBackground({
                        caregiversTreated: text || null,
                      });
                    }
                  }}
                  onBlur={() => markTouched(IDS.caregiversTreated)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      placeholder="Select or enter"
                      error={Boolean(fieldError(IDS.caregiversTreated))}
                      slotProps={{
                        ...params.slotProps,
                        htmlInput: {
                          ...params.slotProps.htmlInput,
                          inputMode: "numeric",
                          "aria-describedby": fieldError(IDS.caregiversTreated)
                            ? `${IDS.caregiversTreated}-helper`
                            : undefined,
                        },
                      }}
                    />
                  )}
                />
              </Box>
            </QuestionRow>
          </Box>

          {/* QUESTION 4 */}
          <Box
            sx={{
              py: 1.1,
              borderBottom: "1px solid #E4ECF6",
            }}
          >
            <QuestionRow
              number={4}
              label="Other people with similar illness in the family?"
              fieldId={IDS.similarIllnessInFamily}
              error={fieldError(IDS.similarIllnessInFamily)}
            >
              <AnswerButtons
                id={IDS.similarIllnessInFamily}
                label="Similar illness in the family"
                options={BINARY_RESPONSE_OPTIONS}
                value={background.similarIllnessInFamily}
                onChange={(similarIllnessInFamily) =>
                  updateBackground({
                    similarIllnessInFamily,
                  })
                }
                onBlur={() => markTouched(IDS.similarIllnessInFamily)}
                error={fieldError(IDS.similarIllnessInFamily)}
                readOnly={readOnly}
              />
            </QuestionRow>

            {background.similarIllnessInFamily === "yes" && (
              <DetailsField
                id={IDS.similarIllnessDetails}
                placeholder="Enter family illness details"
                value={background.similarIllnessDetails}
                onChange={(similarIllnessDetails) =>
                  updateBackground({
                    similarIllnessDetails,
                  })
                }
                onBlur={() => markTouched(IDS.similarIllnessDetails)}
                error={fieldError(IDS.similarIllnessDetails)}
                readOnly={readOnly}
              />
            )}
          </Box>

          {/* QUESTION 5 */}
          <Box sx={{ pt: 1.1 }}>
            <QuestionRow
              number={5}
              label="Attended health care facility in last 10 days?"
              fieldId={IDS.healthcareVisit}
              error={fieldError(IDS.healthcareVisit)}
            >
              <AnswerButtons
                id={IDS.healthcareVisit}
                label="Healthcare facility visit"
                options={BINARY_RESPONSE_OPTIONS}
                value={background.healthcareVisit}
                onChange={(healthcareVisit) =>
                  updateBackground({ healthcareVisit })
                }
                onBlur={() => markTouched(IDS.healthcareVisit)}
                error={fieldError(IDS.healthcareVisit)}
                readOnly={readOnly}
              />
            </QuestionRow>

            {background.healthcareVisit === "yes" && (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "minmax(0, 1fr)",
                    sm: "minmax(0, 1fr) minmax(0, 1.7fr)",
                  },
                  columnGap: 1.5,
                  rowGap: 1,
                  mt: 0.75,
                  pl: { xs: 0, sm: 4 },
                  maxWidth: 760,
                  minWidth: 0,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#C9D9EF",
                  },
                }}
              >
                <DateField
                  id={IDS.healthcareVisitDate}
                  label="If yes, date"
                  value={background.healthcareVisitDate}
                  onChange={(healthcareVisitDate) =>
                    updateBackground({
                      healthcareVisitDate,
                    })
                  }
                  onBlur={() => markTouched(IDS.healthcareVisitDate)}
                  error={fieldError(IDS.healthcareVisitDate)}
                  required={REQUIRED.healthcareVisitDate}
                  readOnly={readOnly}
                  noFuture
                />

                <FacilityAutocomplete
                  id={IDS.healthcareFacility}
                  label="Name & Location"
                  value={background.healthcareFacility}
                  onChange={(healthcareFacility) =>
                    updateBackground({
                      healthcareFacility,
                    })
                  }
                  options={facilityOptions}
                  loading={facilityLoading}
                  loadError={facilityLoadError}
                  onBlur={() => markTouched(IDS.healthcareFacility)}
                  error={fieldError(IDS.healthcareFacility)}
                  required={REQUIRED.healthcareFacility}
                  readOnly={readOnly}
                />
              </Box>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}
