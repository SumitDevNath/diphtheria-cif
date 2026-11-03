import { FormHelperText, FormLabel } from "@mui/material";

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
        fontWeight: 600,
        fontSize: "0.75rem",
        lineHeight: 1.45,
        "&.Mui-focused": { color: "#16355F" },
      }}
    >
      {children}
      {required ? " *" : ""}
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
  return (
    <FormHelperText
      id={`${id}-helper`}
      error={Boolean(message)}
      sx={{
        mx: 0,
        mt: 0.35,
        minHeight: 17,
        fontSize: "0.69rem",
        whiteSpace: "normal",
        overflowWrap: "anywhere",
        lineHeight: 1.35,
      }}
    >
      {message || " "}
    </FormHelperText>
  );
}
