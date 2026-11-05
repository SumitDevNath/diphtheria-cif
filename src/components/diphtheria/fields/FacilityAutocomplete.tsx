import { Autocomplete, Box, TextField } from "@mui/material";
import { FieldError, FieldLabel } from "../components/FieldParts";
import type { FacilityOption } from "../types/diphtheria.types";

interface FacilityAutocompleteProps {
  id: string;
  label: string;
  value: FacilityOption | null;
  onChange: (value: FacilityOption | null) => void;
  options: readonly FacilityOption[];
  loading?: boolean;
  loadError?: string | null;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  readOnly?: boolean;
}

export default function FacilityAutocomplete({
  id,
  label,
  value,
  onChange,
  options,
  loading = false,
  loadError,
  onBlur,
  error,
  required = false,
  readOnly = false,
}: FacilityAutocompleteProps) {
  // Only show form-validation errors supplied by Context.
  const message = error;

  return (
    <Box sx={{ minWidth: 0, width: "100%" }}>
      <FieldLabel id={id} required={required}>
        {label}
      </FieldLabel>

      <Autocomplete<FacilityOption, false, false, false>
        options={options}
        value={value}
        loading={loading}
        readOnly={readOnly}
        onChange={(_, nextValue) => onChange(nextValue)}
        onBlur={onBlur}
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, chosen) => option.id === chosen.id}
        loadingText="Loading facilities..."
        noOptionsText={
          loadError
            ? "Facilities are temporarily unavailable"
            : "No facilities found"
        }
        renderInput={(params) => (
          <TextField
            {...params}
            id={id}
            size="small"
            placeholder="Select healthcare facility"
            error={Boolean(message)}
            slotProps={{
              ...params.slotProps,
              htmlInput: {
                ...params.slotProps.htmlInput,
                "aria-describedby": `${id}-helper`,
              },
            }}
          />
        )}
        sx={{
          "& .MuiOutlinedInput-root": {
            bgcolor: "#FFFFFF",
            borderRadius: "6px",
          },
        }}
      />

      <FieldError id={id} message={message} />
    </Box>
  );
}
