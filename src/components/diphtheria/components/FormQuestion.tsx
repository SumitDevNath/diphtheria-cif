import { Box, Stack, Typography } from "@mui/material";
import type { ReactNode } from "react";

interface FormQuestionProps {
  number?: number;
  label: string;
  children: ReactNode;
}

export default function FormQuestion({
  number,
  label,
  children,
}: FormQuestionProps) {
  return (
    <Stack spacing={1} sx={{ minWidth: 0 }}>
      <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
        {number !== undefined && (
          <Box
            sx={{
              display: "grid",
              placeItems: "center",
              width: 23,
              height: 23,
              flexShrink: 0,
              borderRadius: "50%",
              bgcolor: "#EAF3FF",
              fontSize: "0.72rem",
              color: "#1755C9",
              fontWeight: 700,
            }}
          >
            {number}
          </Box>
        )}

        <Typography
          sx={{
            color: "#17365F",
            fontSize: "0.78rem",
            fontWeight: 500,
          }}
        >
          {label}
        </Typography>
      </Stack>

      <Box sx={{ minWidth: 0 }}>{children}</Box>
    </Stack>
  );
}
