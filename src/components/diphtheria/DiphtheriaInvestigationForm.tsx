import { Box, Stack, Typography } from "@mui/material";
import SectionHeader from "./components/SectionHeader";
import { SECTION_DEFINITIONS } from "./constants/form.constants";
import {
  DiphtheriaFormProvider,
  type DiphtheriaFormProviderProps,
} from "./context/DiphtheriaFormContext";

export type DiphtheriaInvestigationFormProps = Omit<
  DiphtheriaFormProviderProps,
  "children"
>;

/**
 * NDSS-embeddable form root.
 * Actual section fields arrive in Phases 3–8.
 */
export default function DiphtheriaInvestigationForm(
  props: DiphtheriaInvestigationFormProps,
) {
  return (
    <DiphtheriaFormProvider {...props}>
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
          </SectionHeader>
        ))}
      </Stack>
    </DiphtheriaFormProvider>
  );
}
