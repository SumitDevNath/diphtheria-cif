import { Box, FormControl, MenuItem, Select } from "@mui/material";
import { FieldError, FieldLabel } from "../components/FieldParts";
import type { Option } from "../types/diphtheria.types";

interface SelectFieldProps<T extends string | number> {
  id: string;
  label: string;
  value: T | null;
  onChange: (value: T | null) => void;
  options: readonly Option<T>[];
  onBlur?: () => void;
  placeholder?: string;
  error?: string;
  readOnly?: boolean;
  required?: boolean;
}

export default function SelectField<T extends string | number>({
  id,
  label,
  value,
  onChange,
  onBlur,
  options,
  error,
  readOnly = false,
  required = false,
  placeholder = "Select",
}: SelectFieldProps<T>) {
  return (
    <Box sx={{ minWidth: 0, width: "100%" }}>
      <FieldLabel id={id} required={required}>
        {label}
      </FieldLabel>

      <FormControl fullWidth size="small" error={Boolean(error)}>
        <Select<string>
          id={id}
          value={value === null ? "" : String(value)}
          displayEmpty
          disabled={readOnly}
          onBlur={onBlur}
          aria-describedby={`${id}-helper`}
          onChange={(event) => {
            const selected = options.find(
              (item) => String(item.value) === event.target.value,
            );

            onChange(selected?.value ?? null);
          }}
          renderValue={(current) => {
            if (current === "") {
              return (
                <Box component="span" sx={{ color: "#8C9DB1" }}>
                  {placeholder}
                </Box>
              );
            }

            return (
              options.find((item) => String(item.value) === current)?.label ??
              current
            );
          }}
          sx={{
            bgcolor: "#FFF",
            borderRadius: "6px",
          }}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>

          {options.map((option) => (
            <MenuItem key={String(option.value)} value={String(option.value)}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FieldError id={id} message={error} />
    </Box>
  );
}
