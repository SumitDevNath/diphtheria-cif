import { useMemo } from "react";
import { Box, Stack, Typography } from "@mui/material";
import SectionHeader from "./components/SectionHeader";
import { SECTION_DEFINITIONS } from "./constants/form.constants";
import {
  DiphtheriaFormProvider,
  type DiphtheriaFormProviderProps,
} from "./context/DiphtheriaFormContext";
import CaseIdentificationSection from "./sections/CaseIdentificationSection";
import { IDENTIFICATION_VALIDATION_RULES } from "./validation/identification.validation";
import type { FormSectionKey } from "./types/diphtheria.types";

export type DiphtheriaInvestigationFormProps = Omit<
  DiphtheriaFormProviderProps,
  "children"
>;

/** Reusable NDSS form entry; only identification is implemented in Phase 3. */
export default function DiphtheriaInvestigationForm(
  props: DiphtheriaInvestigationFormProps,
) {
  const rules = useMemo(
    () => [
      ...IDENTIFICATION_VALIDATION_RULES,
      ...(props.validationRules ?? []),
    ],
    [props.validationRules],
  );

  const implementedSections = useMemo<readonly FormSectionKey[]>(
    () =>
      Array.from(
        new Set<FormSectionKey>([
          "identification",
          ...(props.implementedSections ?? []),
        ]),
      ),
    [props.implementedSections],
  );

  return (
    <DiphtheriaFormProvider
      {...props}
      validationRules={rules}
      implementedSections={implementedSections}
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
    </DiphtheriaFormProvider>
  );
}
