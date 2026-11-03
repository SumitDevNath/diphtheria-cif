import { Box, Paper, Stack, Typography } from "@mui/material";

const FORM_SECTIONS = [
  {
    id: "case-identification",
    title: "More Case Identification / Demographic Details",
    number: null,
    phase: 3,
  },
  {
    id: "vitals",
    title: "Vitals",
    number: "02",
    phase: 4,
  },
  {
    id: "background-information",
    title: "Background Information",
    number: "03",
    phase: 5,
  },
  {
    id: "vaccination-history",
    title: "Vaccination History",
    number: null,
    phase: 6,
  },
  {
    id: "clinical-details",
    title: "Clinical Details",
    number: "04",
    phase: 7,
  },
  {
    id: "treatment-information",
    title: "Treatment Information",
    number: "05",
    phase: 8,
  },
] as const;

export default function DiphtheriaInvestigationForm() {
  return (
    <Stack
      component="section"
      aria-label="Diphtheria Case Investigation Form"
      spacing={1.5}
      sx={{ width: "100%", minWidth: 0 }}
    >
      {FORM_SECTIONS.map(({ id, title, number, phase }) => (
        <Paper
          key={id}
          component="section"
          aria-labelledby={`${id}-heading`}
          variant="outlined"
          sx={{
            minWidth: 0,
            overflow: "hidden",
            borderColor: "#DCE6F3",
            borderRadius: "9px",
            boxShadow: "none",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              minHeight: 48,
              px: { xs: 1.5, sm: 2 },
              py: 1.25,
              bgcolor: "#F6F9FE",
            }}
          >
            {number && (
              <Box
                sx={{
                  display: "grid",
                  placeItems: "center",
                  width: 24,
                  height: 24,
                  flexShrink: 0,
                  borderRadius: "50%",
                  bgcolor: "#EAF3FF",
                  color: "#1755C9",
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {number}
              </Box>
            )}

            <Typography
              id={`${id}-heading`}
              component="h2"
              sx={{
                color: "#0A2850",
                fontSize: "0.9rem",
                fontWeight: 700,
                lineHeight: 1.5,
              }}
            >
              {title}
            </Typography>
          </Box>

          <Box sx={{ px: 2, py: 2.5, minHeight: 72 }}>
            <Typography
              variant="body2"
              sx={{ color: "#6E8097", fontSize: "0.8rem" }}
            >
              Section fields will be implemented in Phase {phase}.
            </Typography>
          </Box>
        </Paper>
      ))}
    </Stack>
  );
}
