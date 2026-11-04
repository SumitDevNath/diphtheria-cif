import { useState } from "react";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  FormGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { FieldError } from "../components/FieldParts";
import type { ClinicalSelection } from "../types/diphtheria.types";

interface CheckboxGroupProps {
  id: string;
  title: string;
  number?: string;
  options: readonly string[];
  value: ClinicalSelection;
  onChange: (value: ClinicalSelection) => void;
  onBlur?: () => void;
  error?: string;
  readOnly?: boolean;
}

const normalize = (value: string) => value.trim().toLocaleLowerCase();

export default function CheckboxGroup({
  id,
  title,
  number,
  options,
  value,
  onChange,
  onBlur,
  error,
  readOnly = false,
}: CheckboxGroupProps) {
  const [customError, setCustomError] = useState<string | null>(null);

  const toggle = (option: string, checked: boolean) => {
    onChange({
      ...value,
      selected: checked
        ? Array.from(new Set([...value.selected, option]))
        : value.selected.filter((item) => item !== option),
    });

    onBlur?.();
  };

  const addCustom = () => {
    const next = value.otherDraft.trim();

    if (!next) {
      setCustomError("Enter an Other value.");
      return;
    }

    const exists = [...options, ...value.customOptions].some(
      (item) => normalize(item) === normalize(next),
    );

    if (exists) {
      setCustomError("This option already exists.");
      return;
    }

    onChange({
      ...value,
      customOptions: [...value.customOptions, next],
      selected: [...value.selected, next],
      otherDraft: "",
    });

    setCustomError(null);
    onBlur?.();
  };

  const removeCustom = (option: string) => {
    onChange({
      ...value,
      customOptions: value.customOptions.filter((item) => item !== option),
      selected: value.selected.filter((item) => item !== option),
    });

    onBlur?.();
  };

  return (
    <Box
      id={id}
      role="group"
      tabIndex={-1}
      aria-labelledby={`${id}-heading`}
      aria-describedby={error || customError ? `${id}-helper` : undefined}
      sx={{
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        width: "100%",
        height: "100%",
        minWidth: 0,
        p: 1.3,
        border: `1px solid ${error ? "#D32F2F" : "#E2EAF5"}`,
        borderRadius: "8px",
        bgcolor: "#F6F9FE",
      }}
    >
      {/* NUMBERED GROUP HEADER */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 0.75,
          pb: 0.9,
          mb: 0.6,
          borderBottom: "1px solid #DEE8F5",
          minWidth: 0,
        }}
      >
        {number && (
          <Box
            sx={{
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              width: 23,
              height: 23,
              bgcolor: "#EAF3FF",
              color: "#1755C9",
              borderRadius: "50%",
              fontSize: "0.67rem",
              fontWeight: 700,
            }}
          >
            {number}
          </Box>
        )}

        <Typography
          id={`${id}-heading`}
          component="h3"
          sx={{
            color: "#15365F",
            fontSize: "0.8rem",
            fontWeight: 700,
            lineHeight: 1.4,
            overflowWrap: "anywhere",
          }}
        >
          {title}
        </Typography>
      </Box>

      {/* PREDEFINED OPTIONS */}
      <FormGroup
        sx={{
          minWidth: 0,
          gap: 0.2,
        }}
      >
        {options.map((option) => (
          <FormControlLabel
            key={option}
            disabled={readOnly}
            control={
              <Checkbox
                size="small"
                checked={value.selected.includes(option)}
                onChange={(event) => toggle(option, event.target.checked)}
                sx={{
                  p: 0.4,
                  mr: 0.35,
                  color: "#BDD0E8",
                  "&.Mui-checked": {
                    color: "#2563EB",
                  },
                }}
              />
            }
            label={option}
            sx={{
              m: 0,
              minHeight: 25,
              alignItems: "flex-start",
              "& .MuiFormControlLabel-label": {
                pt: 0.35,
                color: "#29486C",
                fontSize: "0.72rem",
                lineHeight: 1.45,
                overflowWrap: "anywhere",
              },
            }}
          />
        ))}

        {/* OTHER, SPECIFY */}
        <FormControlLabel
          disabled={readOnly}
          control={
            <Checkbox
              size="small"
              checked={value.otherSelected}
              onChange={(event) => {
                const checked = event.target.checked;

                onChange({
                  ...value,
                  otherSelected: checked,
                  otherDraft: checked ? value.otherDraft : "",
                });

                setCustomError(null);
                onBlur?.();
              }}
              sx={{
                p: 0.4,
                mr: 0.35,
                color: "#BDD0E8",
                "&.Mui-checked": {
                  color: "#2563EB",
                },
              }}
            />
          }
          label="Other, specify"
          sx={{
            m: 0,
            minHeight: 25,
            alignItems: "flex-start",
            "& .MuiFormControlLabel-label": {
              pt: 0.35,
              color: "#29486C",
              fontSize: "0.72rem",
              lineHeight: 1.45,
            },
          }}
        />
      </FormGroup>

      {/* CUSTOM VALUE INPUT */}
      {value.otherSelected && !readOnly && (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{
            mt: 1,
            gap: 0.75,
            minWidth: 0,
          }}
        >
          <TextField
            id={`${id}-other`}
            size="small"
            fullWidth
            value={value.otherDraft}
            onChange={(event) => {
              onChange({
                ...value,
                otherDraft: event.target.value,
              });

              setCustomError(null);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addCustom();
              }
            }}
            placeholder="Specify other (if any)"
            aria-label={`Specify other ${title.toLowerCase()}`}
            sx={{
              minWidth: 0,
              "& .MuiOutlinedInput-root": {
                bgcolor: "#FFFFFF",
                borderRadius: "6px",
              },
              "& .MuiInputBase-input": {
                fontSize: "0.72rem",
              },
            }}
          />

          <Button
            variant="outlined"
            size="small"
            onClick={addCustom}
            disabled={!value.otherDraft.trim()}
            sx={{
              px: 1,
              minWidth: 45,
              flexShrink: 0,
              textTransform: "none",
              fontSize: "0.72rem",
            }}
          >
            Add
          </Button>
        </Stack>
      )}

      {/* SAVED CUSTOM OPTIONS */}
      {value.customOptions.length > 0 && (
        <Stack
          direction="row"
          sx={{
            mt: 1,
            flexWrap: "wrap",
            gap: 0.65,
            minWidth: 0,
          }}
        >
          {value.customOptions.map((option) => {
            const selected = value.selected.includes(option);

            return (
              <Chip
                key={option}
                size="small"
                label={option}
                color={selected ? "primary" : "default"}
                variant={selected ? "filled" : "outlined"}
                onClick={readOnly ? undefined : () => toggle(option, !selected)}
                onDelete={readOnly ? undefined : () => removeCustom(option)}
                sx={{
                  maxWidth: "100%",
                  height: "auto",
                  minHeight: 25,
                  "& .MuiChip-label": {
                    whiteSpace: "normal",
                    overflowWrap: "anywhere",
                    py: 0.4,
                    fontSize: "0.69rem",
                  },
                }}
              />
            );
          })}
        </Stack>
      )}

      <FieldError id={id} message={customError ?? error} />
    </Box>
  );
}
