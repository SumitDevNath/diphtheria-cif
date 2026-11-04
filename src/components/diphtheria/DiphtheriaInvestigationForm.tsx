import { useMemo } from "react";
import type { ReactNode } from "react";
import { Box, Stack, Typography } from "@mui/material";
import SectionHeader from "./components/SectionHeader";
import FormJsonPreview from "./components/FormJsonPreview";
import { SECTION_DEFINITIONS } from "./constants/form.constants";
import {
  DiphtheriaFormProvider,
  type DiphtheriaFormProviderProps,
} from "./context/DiphtheriaFormContext";
import BackgroundInformationSection from "./sections/BackgroundInformationSection";
import type { TravelHistoryRenderer } from "./sections/BackgroundInformationSection";
import CaseIdentificationSection from "./sections/CaseIdentificationSection";
import VitalsSection from "./sections/VitalsSection";
import type { FacilityOption, FormSectionKey } from "./types/diphtheria.types";
import { IDENTIFICATION_VALIDATION_RULES } from "./validation/identification.validation";
import { VITALS_VALIDATION_RULES } from "./validation/vitals.validation";
import { BACKGROUND_VALIDATION_RULES } from "./validation/background.validation";

export interface DiphtheriaInvestigationFormProps extends Omit<
  DiphtheriaFormProviderProps,
  "children" | "implementedSections"
> {
  facilityOptions?: readonly FacilityOption[];
  facilityLoading?: boolean;
  facilityLoadError?: string | null;
  renderTravelHistory?: TravelHistoryRenderer;
  showJsonPreview?: boolean;
}

const EMPTY_FACILITIES: readonly FacilityOption[] = [];

/**
 * Reusable, NDSS-embeddable frontend form.
 *
 * No API calls are made in this component.
 * The parent supplies facility data and optional
 * externally developed Travel History rendering.
 */
export default function DiphtheriaInvestigationForm({
  value,
  defaultValue,
  onChange,
  readOnly = false,
  validationRules,
  facilityOptions = EMPTY_FACILITIES,
  facilityLoading = false,
  facilityLoadError = null,
  renderTravelHistory,
  showJsonPreview = false,
}: DiphtheriaInvestigationFormProps): ReactNode {
  const rules = useMemo(
    () => [
      ...IDENTIFICATION_VALIDATION_RULES,
      ...VITALS_VALIDATION_RULES,
      ...BACKGROUND_VALIDATION_RULES,
      ...(validationRules ?? []),
    ],
    [validationRules],
  );

  const implementedSections = useMemo<readonly FormSectionKey[]>(
    () =>
      renderTravelHistory
        ? ["identification", "vitals", "background"]
        : ["identification", "vitals"],
    [renderTravelHistory],
  );

  return (
    <DiphtheriaFormProvider
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      readOnly={readOnly}
      validationRules={rules}
      implementedSections={implementedSections}
    >
      <Stack
        spacing={2}
        sx={{
          width: "100%",
          minWidth: 0,
        }}
      >
        <Stack
          component="section"
          aria-label="Diphtheria Case Investigation Form"
          spacing={1.5}
          sx={{
            width: "100%",
            minWidth: 0,
          }}
        >
          {SECTION_DEFINITIONS.map(({ id, title, number, phase }) => (
            <SectionHeader key={id} id={id} title={title} number={number}>
              {id === "identification" ? (
                <CaseIdentificationSection />
              ) : id === "vitals" ? (
                <VitalsSection />
              ) : id === "background" ? (
                <BackgroundInformationSection
                  facilityOptions={facilityOptions}
                  facilityLoading={facilityLoading}
                  facilityLoadError={facilityLoadError}
                  renderTravelHistory={renderTravelHistory}
                />
              ) : (
                <Box
                  sx={{
                    px: 2,
                    py: 2.5,
                    minHeight: 72,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#6E8097",
                      fontSize: "0.8rem",
                    }}
                  >
                    Section fields will be implemented in Phase {phase}.
                  </Typography>
                </Box>
              )}
            </SectionHeader>
          ))}
        </Stack>

        {showJsonPreview && <FormJsonPreview />}
      </Stack>
    </DiphtheriaFormProvider>
  );
}
