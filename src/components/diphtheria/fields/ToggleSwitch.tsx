import { Box, Stack, Switch, Typography } from "@mui/material";
import { FieldError } from "../components/FieldParts";

export default function ToggleSwitch({
  id,
  label,
  checked,
  onChange,
  error,
  readOnly = false,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  readOnly?: boolean;
}) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Stack
        direction="row"
        spacing={1}
        sx={{
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "#EAF3FF",
          borderRadius: "7px",
          px: 1.2,
          minHeight: 36,
        }}
      >
        <Typography
          component="label"
          htmlFor={id}
          sx={{
            color: "#16355F",
            fontSize: "0.75rem",
            fontWeight: 600,
          }}
        >
          {label}
        </Typography>

        <Switch
          id={id}
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          size="small"
          disabled={readOnly}
          slotProps={{
            input: {
              "aria-describedby": `${id}-helper`,
            },
          }}
        />
      </Stack>

      <FieldError id={id} message={error} />
    </Box>
  );
}
