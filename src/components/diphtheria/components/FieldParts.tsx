import { FormHelperText, FormLabel } from "@mui/material";
import {
  CIF_FONT_SIZES,
  CIF_FONT_WEIGHTS,
} from "../constants/typography.constants";

export function FieldLabel({
  id,
  children,
  required = false,
}: {
  id: string;
  children: string;
  required?: boolean;
}) {
  return (
    <FormLabel
      htmlFor={id}
      required={required}
      sx={{
        display: "block",
        mb: 0.6,
        color: "#16355F",
        fontWeight: CIF_FONT_WEIGHTS.fieldLabel,
        fontSize: CIF_FONT_SIZES.fieldLabel,
        lineHeight: 1.45,
        "&.Mui-focused": {
          color: "#16355F",
        },
        "& .MuiFormLabel-asterisk": {
          color: "#D32F2F",
          fontWeight: 700,
          ml: 0.25,
        },
      }}
    >
      {children}
    </FormLabel>
  );
}

export function FieldError({
  id,
  message,
}: {
  id: string;
  message?: string | null;
}) {
  if (!message) return null;

  return (
    <FormHelperText
      id={`${id}-helper`}
      error
      role="alert"
      sx={{
        mx: 0,
        mt: 0.5,
        fontSize: "0.75rem",
        lineHeight: 1.35,
        whiteSpace: "normal",
        overflowWrap: "anywhere",
      }}
    >
      {message}
    </FormHelperText>
  );
}
