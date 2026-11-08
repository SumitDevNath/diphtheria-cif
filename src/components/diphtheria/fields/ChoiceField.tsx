import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { FieldError, FieldLabel } from "../components/FieldParts";
import {
  YES_NO_OPTIONS,
  YES_NO_UNKNOWN_OPTIONS,
} from "../constants/form.constants";
import type { Option, YesNo, YesNoUnknown } from "../types/diphtheria.types";

interface ChoiceProps<T extends string> {
  id: string;
  label: string;
  value: T | null;
  onChange: (value: T | null) => void;
  options: readonly Option<T>[];
  onBlur?: () => void;
  error?: string;
  readOnly?: boolean;
  required?: boolean;
}

export function ChoiceField<T extends string>({
  id,
  label,
  value,
  onChange,
  options,
  error,
  onBlur,
  readOnly = false,
  required = false,
}: ChoiceProps<T>) {
  return (
    <Box sx={{ minWidth: 0, display: "flex", alignItems: "center", gap: 2 }}>
      <FieldLabel id={id} required={required}>
        {label}
      </FieldLabel>

      <ToggleButtonGroup
        id={id}
        size="small"
        exclusive
        value={value}
        onChange={(_, nextValue: string | null) => {
          const selected = options.find((option) => option.value === nextValue);
          onChange(selected?.value ?? null);
        }}
        onBlur={onBlur}
        disabled={readOnly}
        aria-label={label}
        sx={{
          flexWrap: "wrap",
          gap: 0.5,
          "& .MuiToggleButton-root": {
            border: "1px solid #D4E0EE !important",
            borderRadius: "5px !important",
            px: 1.4,
            py: 0.65,
            color: "#476181",
            fontSize: "0.72rem",
            textTransform: "none",
            "&.Mui-selected": {
              bgcolor: "#EAF3FF",
              color: "#164CA4",
            },
          },
        }}
      >
        {options.map((option) => (
          <ToggleButton key={option.value} value={option.value}>
            {option.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>

      <FieldError id={id} message={error} />
    </Box>
  );
}

export function YesNoField(
  props: Omit<ChoiceProps<Exclude<YesNo, null>>, "options">,
) {
  return <ChoiceField {...props} options={YES_NO_OPTIONS} />;
}

export function YesNoUnknownField(
  props: Omit<ChoiceProps<Exclude<YesNoUnknown, null>>, "options">,
) {
  return <ChoiceField {...props} options={YES_NO_UNKNOWN_OPTIONS} />;
}
