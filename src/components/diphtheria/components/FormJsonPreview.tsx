import { useMemo, useState } from "react";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { useDiphtheriaFormValues } from "../context/DiphtheriaFormContext";

export default function FormJsonPreview() {
  const { data } = useDiphtheriaFormValues();

  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">(
    "idle",
  );

  const json = useMemo(() => {
    try {
      return JSON.stringify(data, null, 2) ?? "{}";
    } catch {
      return '{"error": "Form state could not be serialized."}';
    }
  }, [data]);

  const copyJson = async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  };

  return (
    <Accordion
      defaultExpanded
      disableGutters
      variant="outlined"
      sx={{
        mt: 2,
        border: "1px solid #DCE6F3",
        borderRadius: "9px !important",
        boxShadow: "none",
        overflow: "hidden",
        "&::before": { display: "none" },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          bgcolor: "#F6F9FE",
          px: 2,
          minHeight: 52,
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          sx={{
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <Typography
            component="h2"
            sx={{
              fontSize: "0.9rem",
              fontWeight: 700,
              color: "#0A2850",
            }}
          >
            Form JSON Preview
          </Typography>

          <Chip
            label="Frontend only"
            size="small"
            color="primary"
            variant="outlined"
          />
        </Stack>
      </AccordionSummary>

      <AccordionDetails sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Stack
          direction="row"
          sx={{
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1,
            mb: 1.5,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: "#64748B",
              fontSize: "0.76rem",
            }}
          >
            Live form values from React Context
          </Typography>

          <Button
            variant="outlined"
            size="small"
            startIcon={<ContentCopyOutlinedIcon />}
            onClick={() => void copyJson()}
            sx={{ textTransform: "none" }}
          >
            Copy JSON
          </Button>
        </Stack>

        {copyStatus !== "idle" && (
          <Typography
            role="status"
            sx={{
              mb: 1,
              fontSize: "0.75rem",
              color: copyStatus === "copied" ? "success.main" : "error.main",
            }}
          >
            {copyStatus === "copied"
              ? "JSON copied to clipboard."
              : "Clipboard unavailable. Select and copy the JSON manually."}
          </Typography>
        )}

        <Box
          component="pre"
          aria-label="Current Diphtheria form JSON"
          sx={{
            m: 0,
            p: { xs: 1.5, sm: 2 },
            bgcolor: "#F7F9FC",
            border: "1px solid #E2EAF5",
            borderRadius: "7px",
            color: "#1E3A5F",
            fontFamily: "monospace",
            fontSize: "0.76rem",
            lineHeight: 1.65,
            whiteSpace: "pre-wrap",
            overflowWrap: "anywhere",
            overflowX: "auto",
            maxHeight: 560,
            overflowY: "auto",
          }}
        >
          {json}
        </Box>

        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 1.5,
            color: "#718096",
          }}
        >
          Development preview only. Data is not submitted, uploaded, or saved to
          a backend. Disable this preview in the production NDSS application.
        </Typography>
      </AccordionDetails>
    </Accordion>
  );
}
