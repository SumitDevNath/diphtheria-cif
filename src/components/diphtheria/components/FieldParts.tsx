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
      }}
    >
      {children}
      {/* {required ? " *" : ""} */}
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
  const hasError = Boolean(message);

  return (
    <FormHelperText
      id={`${id}-helper`}
      error={hasError}
      role={hasError ? "alert" : undefined}
      sx={{
        mx: 0,
        mt: 0.35,
        minHeight: 17,
        fontSize: "0.69rem",
        lineHeight: 1.35,
        whiteSpace: "normal",
        overflowWrap: "anywhere",
      }}
    >
      {message || " "}
    </FormHelperText>
  );
}
