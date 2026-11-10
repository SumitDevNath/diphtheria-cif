import type { ReactNode } from "react";
import { Box, Paper, Typography } from "@mui/material";

import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import MonitorHeartOutlinedIcon from "@mui/icons-material/MonitorHeartOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import VaccinesOutlinedIcon from "@mui/icons-material/VaccinesOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import MedicationOutlinedIcon from "@mui/icons-material/MedicationOutlined";

interface SectionHeaderProps {
  id: string;
  title: string;
  number?: string | null;
  rightContent?: ReactNode;
  children?: ReactNode;
}

// Centralized icons for each section.
const SECTION_ICONS = {
  identification: BadgeOutlinedIcon,
  vitals: MonitorHeartOutlinedIcon,
  background: InfoOutlinedIcon,
  vaccination: VaccinesOutlinedIcon,
  clinical: MedicalServicesOutlinedIcon,
  treatment: MedicationOutlinedIcon,
} as const;

export default function SectionHeader({
  id,
  title,
  rightContent,
  children,
}: SectionHeaderProps) {
  const SectionIcon =
    SECTION_ICONS[id as keyof typeof SECTION_ICONS] ?? InfoOutlinedIcon;

  return (
    <Paper
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
          flexDirection: {
            xs: "column",
            md: "row",
          },
          alignItems: {
            xs: "stretch",
            md: id === "clinical" ? "flex-start" : "center",
          },
          justifyContent: id === "clinical" ? "flex-start" : "space-between",
          columnGap: id === "clinical" ? 5 : 2.5,
          minHeight: 48,
          px: { xs: 1.5, sm: 2 },
          pt: id === "clinical" ? 0.75 : 1.25,
          pb: id === "clinical" ? 1 : 1.25,
          bgcolor: "#F6F9FE",
        }}
      >
        {/* SECTION ICON + HEADING */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            gap: 1.25,
            minWidth: 0,
            minHeight: {
              md: id === "clinical" ? 42 : undefined,
            },
          }}
        >
          {/* MUI ICON */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              flexShrink: 0,
              borderRadius: "50%",
            }}
          >
            <SectionIcon sx={{ fontSize: 30, display: "block" }} />
          </Box>

          {/* SECTION HEADING */}
          <Typography
            id={`${id}-heading`}
            component="h2"
            sx={{
              m: 0,
              display: "flex",
              alignItems: "center",
              color: "#0A2850",
              fontSize: "1rem",
              fontWeight: 700,
              lineHeight: 1.5,
            }}
          >
            {title}
          </Typography>
        </Box>

        {/* RIGHT HEADER CONTENT */}
        {rightContent && (
          <Box
            sx={{
              minWidth: 0,
              display: "flex",
              alignItems: {
                xs: "center",
                md: id === "clinical" ? "flex-start" : "center",
              },
              justifyContent: "flex-start",
              flexShrink: { md: 0 },
            }}
          >
            {rightContent}
          </Box>
        )}
      </Box>

      {children}
    </Paper>
  );
}
