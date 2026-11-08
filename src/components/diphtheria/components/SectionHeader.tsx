import type { ReactNode } from "react";
import { Box, Paper, Typography } from "@mui/material";

interface SectionHeaderProps {
  id: string;
  title: string;
  number?: string | null;
  rightContent?: ReactNode;
  children?: ReactNode;
}

export default function SectionHeader({
  id,
  title,
  number,
  rightContent,
  children,
}: SectionHeaderProps) {
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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            minWidth: 0,
            minHeight: {
              md: id === "clinical" ? 42 : undefined,
            },
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
              fontSize: "1rem",
              fontWeight: 700,
              lineHeight: 1.5,
            }}
          >
            {title}
          </Typography>
        </Box>

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
