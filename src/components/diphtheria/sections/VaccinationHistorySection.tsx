import { Box, Typography } from "@mui/material";

/**
 * The vaccination questionnaire is already implemented in a reusable NDSS
 * module. Do not render or validate a second set of vaccination inputs here.
 *
 * Handoff contract (see types/diphtheria.types.ts and
 * constants/vaccination.constants.ts):
 * - available: whether vaccination history is available
 * - source: "card" (By Card) or "history" (History), if available
 * - doses: count of Diphtheria-containing vaccine doses, including zero
 * - lastVaccinationDate: when history is available and doses > 0
 *
 * The shared vaccination component must own its own validation/persistence.
 * The legacy vaccination object in the CIF payload is retained for compatibility;
 * this placeholder does not populate or validate it.
 */
export default function VaccinationHistorySection() {
  return (
    <Box sx={{ px: { xs: 1.5, sm: 2 }, py: 2, minWidth: 0 }}>
      <Typography
        variant="body2"
        sx={{ color: "#718096", fontSize: "0.78rem", lineHeight: 1.65 }}
      >
        Vaccination History is already captured by the shared NDSS module and is
        not duplicated in this Case Investigation Form. When integrating the
        reusable component, please record whether vaccination history is
        available; if available, record the information source (By Card or
        History), the number of Diphtheria-containing vaccine doses
        (DPT/Pentavalent/Td), and the date of last vaccination when at least one
        dose was received. Ensure these details are validated and recorded
        through the shared module.
      </Typography>
    </Box>
  );
}
