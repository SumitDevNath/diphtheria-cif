import { Box, Typography } from "@mui/material";
import { DiphtheriaInvestigationForm } from "../components/diphtheria";

export default function DiphtheriaDemoPage() {
  return (
    <Box
      component="main"
      sx={{
        boxSizing: "border-box",
        width: "100%",
        minWidth: 0,
        px: { xs: 1, sm: 2, md: 3 },
        py: { xs: 2, md: 3 },
        bgcolor: "#FFFFFF",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 1160,
          minWidth: 0,
          mx: "auto",
        }}
      >
        <Typography
          component="h1"
          variant="h5"
          sx={{
            color: "#0A2850",
            fontWeight: 700,
            fontSize: { xs: "1.15rem", sm: "1.4rem" },
          }}
        >
          Diphtheria Case Investigation Form
        </Typography>

        <Typography variant="body2" sx={{ color: "#6E8097", mt: 0.5 }}>
          NDSS frontend development preview
        </Typography>

        <Box sx={{ mt: 2 }}>
          <DiphtheriaInvestigationForm />
        </Box>
      </Box>
    </Box>
  );
}
