import { useCallback, useMemo, type ReactNode } from "react";

import { Box, Stack, Typography } from "@mui/material";

import { FieldError } from "./components/FieldParts";
import FormJsonPreview from "./components/FormJsonPreview";
import FormSubmit from "./components/FormSubmit";
import type { DiphtheriaSubmitHandler } from "./components/FormSubmit";
import SectionHeader from "./components/SectionHeader";

import { SECTION_DEFINITIONS } from "./constants/form.constants";

import {
  DiphtheriaFormProvider,
  useDiphtheriaFormValues,
  type DiphtheriaFormProviderProps,
} from "./context/DiphtheriaFormContext";

import BackgroundInformationSection from "./sections/BackgroundInformationSection";

import type {
  TravelHistoryBridge,
  TravelHistoryRenderer,
} from "./sections/BackgroundInformationSection";

import CaseIdentificationSection from "./sections/CaseIdentificationSection";
import ClinicalDetailsSection from "./sections/ClinicalDetailsSection";
import TreatmentInformationSection from "./sections/TreatmentInformationSection";
import VitalsSection from "./sections/VitalsSection";

import VaccinationHistorySection, {
  VaccinationAvailabilitySwitch,
} from "./sections/VaccinationHistorySection";

import type { FacilityOption, FormSectionKey } from "./types/diphtheria.types";

import { BACKGROUND_VALIDATION_RULES } from "./validation/background.validation";
import { CLINICAL_VALIDATION_RULES } from "./validation/clinical.validation";
import { IDENTIFICATION_VALIDATION_RULES } from "./validation/identification.validation";
import { TREATMENT_VALIDATION_RULES } from "./validation/treatment.validation";

import {
  createTravelHistoryValidationRule,
  TRAVEL_HISTORY_FIELD_ID,
  type TravelHistoryValidator,
} from "./validation/travel.integration.validation";

import { VACCINATION_VALIDATION_RULES } from "./validation/vaccination.validation";
import { VITALS_VALIDATION_RULES } from "./validation/vitals.validation";

export interface DiphtheriaInvestigationFormProps extends Omit<
  DiphtheriaFormProviderProps,
  "children" | "implementedSections"
> {
  facilityOptions?: readonly FacilityOption[];
  facilityLoading?: boolean;
  facilityLoadError?: string | null;

  renderTravelHistory?: TravelHistoryRenderer;
  validateTravelHistory?: TravelHistoryValidator;

  showJsonPreview?: boolean;
  onSubmit?: DiphtheriaSubmitHandler;
}

const EMPTY_FACILITIES: readonly FacilityOption[] = [];

const IMPLEMENTED_SECTIONS: readonly FormSectionKey[] = SECTION_DEFINITIONS.map(
  (section) => section.id,
);

interface TravelHistorySlotProps {
  bridge: TravelHistoryBridge;
  renderTravelHistory?: TravelHistoryRenderer;
}

function TravelHistorySlot({
  bridge,
  renderTravelHistory,
}: TravelHistorySlotProps) {
  const { fieldError } = useDiphtheriaFormValues();

  const error = fieldError(TRAVEL_HISTORY_FIELD_ID);

  return (
    <Box
      id={TRAVEL_HISTORY_FIELD_ID}
      tabIndex={-1}
      role="group"
      aria-label="Travel History"
      aria-invalid={Boolean(error)}
      aria-describedby={error ? `${TRAVEL_HISTORY_FIELD_ID}-helper` : undefined}
      sx={{
        minWidth: 0,
        width: "100%",
        borderRadius: "6px",
        outline: error ? "1px solid" : "none",
        outlineColor: "error.main",
        outlineOffset: "2px",
      }}
    >
      {renderTravelHistory ? (
        renderTravelHistory(bridge)
      ) : (
        <Typography
          variant="body2"
          sx={{
            color: "#718096",
            fontSize: "0.78rem",
            lineHeight: 1.6,
          }}
        >
          The external Travel History module has not yet been integrated. Its
          existing implementation will be connected here during NDSS
          integration.
        </Typography>
      )}

      {error && <FieldError id={TRAVEL_HISTORY_FIELD_ID} message={error} />}
    </Box>
  );
}

export default function DiphtheriaInvestigationForm({
  value,
  defaultValue,
  onChange,
  onSubmit,
  readOnly = false,
  validationRules,

  facilityOptions = EMPTY_FACILITIES,
  facilityLoading = false,
  facilityLoadError = null,

  renderTravelHistory,
  validateTravelHistory,

  showJsonPreview = false,
}: DiphtheriaInvestigationFormProps): ReactNode {
  const travelHistoryRule = useMemo(
    () =>
      createTravelHistoryValidationRule({
        hasRenderer: Boolean(renderTravelHistory),
        validator: validateTravelHistory,
      }),
    [renderTravelHistory, validateTravelHistory],
  );

  const rules = useMemo(
    () => [
      ...IDENTIFICATION_VALIDATION_RULES,
      ...VITALS_VALIDATION_RULES,
      ...BACKGROUND_VALIDATION_RULES,
      travelHistoryRule,
      ...VACCINATION_VALIDATION_RULES,
      ...CLINICAL_VALIDATION_RULES,
      ...TREATMENT_VALIDATION_RULES,
      ...(validationRules ?? []),
    ],
    [travelHistoryRule, validationRules],
  );

  const renderTravelSlot = useCallback(
    (bridge: TravelHistoryBridge): ReactNode => (
      <TravelHistorySlot
        bridge={bridge}
        renderTravelHistory={renderTravelHistory}
      />
    ),
    [renderTravelHistory],
  );

  return (
    <DiphtheriaFormProvider
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      readOnly={readOnly}
      validationRules={rules}
      implementedSections={IMPLEMENTED_SECTIONS}
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
          {SECTION_DEFINITIONS.map(({ id, title, number }) => (
            <SectionHeader
              key={id}
              id={id}
              title={title}
              number={number}
              rightContent={
                id === "vaccination" ? (
                  <VaccinationAvailabilitySwitch />
                ) : undefined
              }
            >
              {id === "identification" ? (
                <CaseIdentificationSection />
              ) : id === "vitals" ? (
                <VitalsSection />
              ) : id === "background" ? (
                <BackgroundInformationSection
                  facilityOptions={facilityOptions}
                  facilityLoading={facilityLoading}
                  facilityLoadError={facilityLoadError}
                  renderTravelHistory={renderTravelSlot}
                />
              ) : id === "vaccination" ? (
                <VaccinationHistorySection />
              ) : id === "clinical" ? (
                <ClinicalDetailsSection
                  facilityOptions={facilityOptions}
                  facilityLoading={facilityLoading}
                  facilityLoadError={facilityLoadError}
                />
              ) : id === "treatment" ? (
                <TreatmentInformationSection />
              ) : null}
            </SectionHeader>
          ))}
        </Stack>

        <FormSubmit validationRules={rules} onSubmit={onSubmit} />

        {showJsonPreview && <FormJsonPreview />}
      </Stack>
    </DiphtheriaFormProvider>
  );
}
