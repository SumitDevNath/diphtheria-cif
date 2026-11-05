import { Box, Paper, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface SectionHeaderProps {
  id: string;
  title: string;
  number?: string | null;
  children?: ReactNode;
  rightContent?: ReactNode;
}

export default function SectionHeader({
  id,
  title,
  number,
  children,
  rightContent,
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
          alignItems: "center",
          justifyContent: rightContent ? "space-between" : "flex-start",
          flexWrap: rightContent ? "wrap" : "nowrap",
          gap: 1,
          minHeight: 48,
          px: { xs: 1.5, sm: 2 },
          py: 1.25,
          bgcolor: rightContent ? "#FFFFFF" : "#F6F9FE",
          borderBottom: rightContent ? "1px solid #DCE6F3" : "none",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            minWidth: 0,
          }}
        >
          {/* {number && (
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
          )} */}

          <Typography
            id={`${id}-heading`}
            component="h2"
            sx={{
              color: "#0A2850",
              fontSize: "1.25rem",
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
              maxWidth: "100%",
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
