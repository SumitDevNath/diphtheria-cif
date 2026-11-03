import { Box, InputAdornment, TextField } from "@mui/material";
import { FieldError, FieldLabel } from "../components/FieldParts";

export interface ValidatedFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  readOnly?: boolean;
  multiline?: boolean;
  rows?: number;
  unit?: string;
  inputMode?: "text" | "numeric" | "decimal";
}

export function ValidatedField({
  id,
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  required = false,
  readOnly = false,
  multiline = false,
  rows,
  unit,
  inputMode = "text",
}: ValidatedFieldProps) {
  return (
    <Box sx={{ minWidth: 0, width: "100%" }}>
      <FieldLabel id={id} required={required}>
        {label}
      </FieldLabel>

      <TextField
        id={id}
        fullWidth
        size="small"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        error={Boolean(error)}
        multiline={multiline}
        rows={rows}
        slotProps={{
          htmlInput: {
            readOnly,
            inputMode,
            "aria-describedby": `${id}-helper`,
          },
          input: unit
            ? {
                endAdornment: (
                  <InputAdornment position="end">{unit}</InputAdornment>
                ),
              }
            : undefined,
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            bgcolor: "#FFF",
            borderRadius: "6px",
          },
        }}
      />

      <FieldError id={id} message={error} />
    </Box>
  );
}

export function NumberField(
  props: Omit<ValidatedFieldProps, "inputMode" | "multiline" | "rows"> & {
    decimal?: boolean;
  },
) {
  const { decimal = false, ...rest } = props;

  return (
    <ValidatedField {...rest} inputMode={decimal ? "decimal" : "numeric"} />
  );
}
