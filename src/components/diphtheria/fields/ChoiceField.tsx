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
  /** Place the question label and choices side by side when space allows. */
  inline?: boolean;
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
  inline = false,
}: ChoiceProps<T>) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Box
        sx={
          inline
            ? {
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-start",
                flexWrap: "wrap",
                columnGap: 1.5,
                rowGap: 1,
              }
            : undefined
        }
      >
        <Box
          sx={
            inline
              ? {
                  flex: "0 1 auto",
                  minWidth: 0,
                  "& .MuiFormLabel-root": { mb: 0 },
                }
              : undefined
          }
        >
          <FieldLabel id={id} required={required}>
            {label}
          </FieldLabel>
        </Box>

        <ToggleButtonGroup
          id={id}
          size="small"
          exclusive
          value={value}
          onChange={(_, nextValue: string | null) => {
            // MUI returns null when the active button is clicked again.
            // Keep the selection until the user chooses another option.
            if (nextValue === null) return;

            const selected = options.find(
              (option) => option.value === nextValue,
            );
            if (selected) onChange(selected.value);
          }}
          onBlur={onBlur}
          disabled={readOnly}
          aria-label={label}
          sx={{
            flexWrap: "wrap",
            ...(inline ? { flexShrink: 0 } : {}),
            gap: 0.5,
            "& .MuiToggleButton-root": {
              border: "1px solid #D4E0EE !important",
              borderRadius: "5px !important",
              px: 1.4,
              py: 0.65,
              color: "#476181",
              fontSize: "0.8rem",
              fontWeight: 500,
              textTransform: "none",
              "&.Mui-selected": {
                bgcolor: "#EAF3FF",
                color: "#164CA4",
              },
              // Other options look subdued after a selection, but stay clickable.
              ...(value !== null && {
                "&:not(.Mui-selected)": {
                  bgcolor: "#F2F4F7",
                  color: "#8493A6",
                  "&:hover": {
                    bgcolor: "#E8EEF6",
                    color: "#476181",
                  },
                },
              }),
            },
          }}
        >
          {options.map((option) => (
            <ToggleButton key={option.value} value={option.value}>
              {option.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

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
