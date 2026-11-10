import type { ReactNode } from "react";
import { Box, Paper, TextField, Typography } from "@mui/material";

import {
  BACKGROUND_FIELD_IDS as IDS,
  BACKGROUND_REQUIRED as REQUIRED,
  CAREGIVER_COUNT_OPTIONS,
} from "../constants/background.constants";

import { FieldError, FieldLabel } from "../components/FieldParts";
import { useDiphtheriaForm } from "../context/DiphtheriaFormContext";

import { YesNoUnknownField } from "../fields/ChoiceField";
import ToggleSwitch from "../fields/ToggleSwitch";
import DateField from "../fields/DateField";
import FacilityAutocomplete from "../fields/FacilityAutocomplete";
import SelectField from "../fields/SelectField";

import type { FacilityOption } from "../types/diphtheria.types";

export interface TravelHistoryBridge {
  value: unknown;
  onChange: (value: unknown) => void;
  readOnly: boolean;
}

export type TravelHistoryRenderer = (bridge: TravelHistoryBridge) => ReactNode;

interface Props {
  facilityOptions?: readonly FacilityOption[];
  facilityLoading?: boolean;
  facilityLoadError?: string | null;
  renderTravelHistory?: TravelHistoryRenderer;
}

const countOptions = CAREGIVER_COUNT_OPTIONS.map((value) => ({
  value,
  label: value,
}));

const questionSx = {
  color: "#17365F",
  fontSize: "0.9375rem",
  fontWeight: 600,
  lineHeight: 1.5,
} as const;

const cardSx = {
  p: { xs: 1.5, sm: 2 },
  borderColor: "#D4E2EF",
  borderRadius: "9px",
  bgcolor: "#F5F9FE",
  boxShadow: "none",
  minWidth: 0,
} as const;

interface ToggleCardProps {
  id: string;
  title: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled: boolean;
  children?: ReactNode;
}

function ToggleCard({
  id,
  title,
  checked,
  onChange,
  disabled,
  children,
}: ToggleCardProps) {
  return (
    <Paper variant="outlined" sx={cardSx}>
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
        <Typography sx={questionSx}>{title}</Typography>

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

      {checked && <Box sx={{ mt: 2, minWidth: 0 }}>{children}</Box>}
    </Paper>
  );
}

export default function BackgroundInformationSection({
  facilityOptions = [],
  facilityLoading = false,
  facilityLoadError = null,
  renderTravelHistory,
}: Props) {
  const { data, update, fieldError, markTouched, setTravelHistory, readOnly } =
    useDiphtheriaForm();

  const background = data.background;

  const contactIsYes = background.contactKnownCase === "yes";

  const similarIllnessOn = background.similarIllnessInFamily === "yes";

  const healthcareVisitOn = background.healthcareVisit === "yes";

  return (
    <Box
      sx={{
        px: { xs: 1.5, sm: 2 },
        py: 2,
        minWidth: 0,
      }}
    >
      {/* QUESTION 1 */}
      <YesNoUnknownField
        id={IDS.contactKnownCase}
        label="1. Contact with known case of Diphtheria / similar illness within 10 days prior to illness"
        value={background.contactKnownCase}
        onChange={(contactKnownCase) =>
          update({
            section: "background",
            patch: { contactKnownCase },
          })
        }
        onBlur={() => markTouched(IDS.contactKnownCase)}
        error={fieldError(IDS.contactKnownCase)}
        required={REQUIRED.contactKnownCase}
        readOnly={readOnly}
      />

      {/* Q1 DEPENDENT CONTENT */}
      {contactIsYes && (
        <Box sx={{ mt: 2, minWidth: 0 }}>
          <Box sx={{ mb: 2 }}>
            <FieldLabel
              id={IDS.contactDetails}
              required={REQUIRED.contactDetails}
            >
              Contact details
            </FieldLabel>

            <TextField
              id={IDS.contactDetails}
              size="small"
              fullWidth
              multiline
              minRows={2}
              value={background.contactDetails}
              onChange={(event) =>
                update({
                  section: "background",
                  patch: {
                    contactDetails: event.target.value,
                  },
                })
              }
              onBlur={() => markTouched(IDS.contactDetails)}
              error={Boolean(fieldError(IDS.contactDetails))}
              placeholder="Enter contact details"
              slotProps={{
                htmlInput: {
                  readOnly,
                  "aria-describedby": `${IDS.contactDetails}-helper`,
                },
              }}
            />

            <FieldError
              id={IDS.contactDetails}
              message={fieldError(IDS.contactDetails)}
            />
          </Box>

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

          {/* QUESTIONS 2 & 3 */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                sm: "repeat(2, minmax(0, 1fr))",
              },
              gap: 2,
              mb: 2,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <FieldLabel
                id={IDS.householdSize}
                required={REQUIRED.householdSize}
              >
                2. Number of persons living in the household
              </FieldLabel>

              <TextField
                id={IDS.householdSize}
                size="small"
                fullWidth
                type="number"
                value={background.householdSize}
                onChange={(event) =>
                  update({
                    section: "background",
                    patch: {
                      householdSize: event.target.value,
                    },
                  })
                }
                onBlur={() => markTouched(IDS.householdSize)}
                error={Boolean(fieldError(IDS.householdSize))}
                slotProps={{
                  htmlInput: {
                    min: 0,
                    step: 1,
                    readOnly,
                    "aria-describedby": `${IDS.householdSize}-helper`,
                  },
                }}
              />

              <FieldError
                id={IDS.householdSize}
                message={fieldError(IDS.householdSize)}
              />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <SelectField
                id={IDS.caregiversTreated}
                label="3. Number of accompanying care givers treated with antibiotics?"
                value={background.caregiversTreated}
                options={countOptions}
                onChange={(caregiversTreated) =>
                  update({
                    section: "background",
                    patch: { caregiversTreated },
                  })
                }
                onBlur={() => markTouched(IDS.caregiversTreated)}
                error={fieldError(IDS.caregiversTreated)}
                readOnly={readOnly}
                required={REQUIRED.caregiversTreated}
              />
            </Box>
          </Box>

          {/* QUESTIONS 4 & 5 — SIDE BY SIDE */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                md: "repeat(2, minmax(0, 1fr))",
              },
              alignItems: "start",
              gap: 2,
            }}
          >
            <ToggleCard
              id={IDS.similarIllnessInFamily}
              title="4. Other people with similar illness in the family?"
              checked={similarIllnessOn}
              disabled={readOnly}
              onChange={(checked) =>
                update({
                  section: "background",
                  patch: {
                    similarIllnessInFamily: checked ? "yes" : "no",
                  },
                })
              }
            >
              <FieldLabel
                id={IDS.similarIllnessDetails}
                required={REQUIRED.similarIllnessDetails}
              >
                Details of similar illness
              </FieldLabel>

              <TextField
                id={IDS.similarIllnessDetails}
                value={background.similarIllnessDetails}
                onChange={(event) =>
                  update({
                    section: "background",
                    patch: {
                      similarIllnessDetails: event.target.value,
                    },
                  })
                }
                onBlur={() => markTouched(IDS.similarIllnessDetails)}
                fullWidth
                multiline
                minRows={2}
                size="small"
                placeholder="Specify details"
                error={Boolean(fieldError(IDS.similarIllnessDetails))}
                slotProps={{
                  htmlInput: {
                    readOnly,
                    "aria-describedby": `${IDS.similarIllnessDetails}-helper`,
                  },
                }}
                sx={{ backgroundColor: "#ffffff" }}
              />

              <FieldError
                id={IDS.similarIllnessDetails}
                message={fieldError(IDS.similarIllnessDetails)}
              />
            </ToggleCard>

            <ToggleCard
              id={IDS.healthcareVisit}
              title="5. Attended health care facility in last 10 days?"
              checked={healthcareVisitOn}
              disabled={readOnly}
              onChange={(checked) =>
                update({
                  section: "background",
                  patch: {
                    healthcareVisit: checked ? "yes" : "no",
                  },
                })
              }
            >
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "minmax(0, 1fr)",
                  gap: 1.5,
                }}
              >
                <DateField
                  id={IDS.healthcareVisitDate}
                  label="Date of visit"
                  value={background.healthcareVisitDate}
                  onChange={(healthcareVisitDate) =>
                    update({
                      section: "background",
                      patch: { healthcareVisitDate },
                    })
                  }
                  onBlur={() => markTouched(IDS.healthcareVisitDate)}
                  error={fieldError(IDS.healthcareVisitDate)}
                  readOnly={readOnly}
                  required={REQUIRED.healthcareVisitDate}
                  noFuture
                />

                <FacilityAutocomplete
                  id={IDS.healthcareFacility}
                  label="Healthcare facility"
                  value={background.healthcareFacility}
                  onChange={(healthcareFacility) =>
                    update({
                      section: "background",
                      patch: { healthcareFacility },
                    })
                  }
                  options={facilityOptions}
                  loading={facilityLoading}
                  loadError={facilityLoadError}
                  onBlur={() => markTouched(IDS.healthcareFacility)}
                  error={fieldError(IDS.healthcareFacility)}
                  readOnly={readOnly}
                  required={REQUIRED.healthcareFacility}
                />
              </Box>
            </ToggleCard>
          </Box>
        </Box>
      )}
    </Box>
  );
}
