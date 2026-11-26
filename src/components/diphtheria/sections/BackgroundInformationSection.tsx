import type { ReactNode } from "react";
import {
  Box,
  Button,
  Collapse,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

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
import ContactDetailsRows from "../fields/ContactDetailsRows";

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

/** Match the numbered question layout used by DATAntitoxinSection. */
const design = {
  ink: "#17365F",
  border: "#D4E2EF",
  divider: "#E3ECF6",
  surface: "#FFFFFF",
} as const;

const rowPaddingSx = {
  px: { xs: 2, sm: 2.5 },
  py: 2.25,
} as const;

interface QuestionProps {
  number: number;
  variant?: "choice" | "stacked";
  compact?: boolean;
  children: ReactNode;
}

function Question({
  number,
  variant = "stacked",
  compact = false,
  children,
}: QuestionProps) {
  return (
    <Box
      sx={{
        ...(compact ? {} : rowPaddingSx),
        display: "flex",
        alignItems: "flex-start",
        gap: 0.5,
        minWidth: 0,
      }}
    >
      <Typography
        component="span"
        aria-hidden
        sx={{
          flexShrink: 0,
          width: "auto",
          mt: variant === "choice" ? "6px" : 0,
          color: design.ink,
          fontSize: "0.875rem",
          fontWeight: 600,
          lineHeight: 1.45,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {number}.
      </Typography>
      <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
    </Box>
  );
}

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

      <Collapse in={checked} unmountOnExit>
        <Box sx={{ mt: 2, minWidth: 0 }}>{children}</Box>
      </Collapse>
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

  const hasResidenceAnswer = background.householdSize.trim() !== "";

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2 }, minWidth: 0 }}>
      <Paper
        component="section"
        aria-label="Background Information questions"
        variant="outlined"
        sx={{
          minWidth: 0,
          overflow: "hidden",
          borderColor: design.border,
          borderRadius: "10px",
          bgcolor: design.surface,
          boxShadow: "none",
        }}
      >
        {/* Q1 uses the same classic number-and-choice alignment as DAT. */}
        <Question number={1} variant="choice">
          <YesNoUnknownField
            id={IDS.contactKnownCase}
            label="Contact with known case of Diphtheria / similar illness within 10 days prior to illness"
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
            inline
            readOnly={readOnly}
          />
        </Question>

        {/* Keep existing dependent questions gated by Q1 = Yes. */}
        <Collapse in={contactIsYes} unmountOnExit>
          <Box sx={{ borderTop: `1px solid ${design.divider}` }}>
            <Stack divider={<Divider sx={{ borderColor: design.divider }} />}>
              {/* Contact rows and external Travel History are Q1 follow-ups. */}
              <Box sx={rowPaddingSx}>
                <Box
                  sx={{
                    pl: 2,
                    minWidth: 0,
                    borderLeft: `2px solid ${design.border}`,
                  }}
                >
                  <ContactDetailsRows />
                </Box>
              </Box>
              {/* EXTERNAL TRAVEL HISTORY */}
              <Box
                component="section"
                aria-label="Travel History"
                sx={{
                  mt: 1.5,
                  mb: 1.5,
                  ml: 1.5,
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

              {/* Q2 and Q3 retain the existing responsive two-column arrangement. */}
              <Box sx={rowPaddingSx}>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "minmax(0, 1fr)",
                      sm: "repeat(2, minmax(0, 1fr))",
                    },
                    gap: 2,
                  }}
                >
                  <Question number={2} compact>
                    <FieldLabel
                      id={IDS.householdSize}
                      required={REQUIRED.householdSize}
                    >
                      Number of persons living in the residence
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
                  </Question>

                  <Question number={3} compact>
                    <SelectField
                      id={IDS.caregiversTreated}
                      label="Number of accompanying care givers treated with antibiotics?"
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
                    {background.caregiversTreated !== null && !readOnly && (
                      <Button
                        type="button"
                        size="small"
                        variant="text"
                        onClick={() =>
                          update({
                            section: "background",
                            patch: { caregiversTreated: null },
                          })
                        }
                        sx={{
                          textTransform: "none",
                          fontSize: "0.75rem",
                          px: 0.5,
                          mt: 0.5,
                        }}
                      >
                        Clear selection
                      </Button>
                    )}
                  </Question>
                </Box>
              </Box>

              {/* Q4 and Q5 retain their blue toggle cards and dependent fields. */}
              <Box sx={rowPaddingSx}>
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
                  {hasResidenceAnswer && (
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
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            bgcolor: "#FFFFFF",
                          },
                        }}
                        slotProps={{
                          htmlInput: {
                            readOnly,
                            "aria-describedby": `${IDS.similarIllnessDetails}-helper`,
                          },
                        }}
                      />

                      <FieldError
                        id={IDS.similarIllnessDetails}
                        message={fieldError(IDS.similarIllnessDetails)}
                      />
                    </ToggleCard>
                  )}

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
            </Stack>
          </Box>
        </Collapse>
      </Paper>
    </Box>
  );
}
