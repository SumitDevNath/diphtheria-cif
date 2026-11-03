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
  options: readonly string[];
  value: ClinicalSelection;
  onChange: (value: ClinicalSelection) => void;
  onBlur?: () => void;
  error?: string;
  readOnly?: boolean;
}

export default function CheckboxGroup({
  id,
  title,
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
        ? [...value.selected, option]
        : value.selected.filter((item) => item !== option),
    });

    onBlur?.();
  };

  const addCustom = () => {
    const next = value.otherDraft.trim();

    if (!next) return;

    const exists = [...options, ...value.customOptions].some(
      (item) => item.trim().toLocaleLowerCase() === next.toLocaleLowerCase(),
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

  return (
    <Box
      role="group"
      aria-labelledby={`${id}-title`}
      sx={{
        minWidth: 0,
        border: "1px solid #E2EAF5",
        bgcolor: "#F7FAFF",
        borderRadius: "8px",
        p: 1.3,
      }}
    >
      <Typography
        id={`${id}-title`}
        sx={{
          fontWeight: 700,
          fontSize: "0.78rem",
          color: "#15365F",
          borderBottom: "1px solid #E1EAF5",
          pb: 0.8,
          mb: 0.5,
        }}
      >
        {title}
      </Typography>

      <FormGroup>
        {options.map((option) => (
          <FormControlLabel
            key={option}
            control={
              <Checkbox
                size="small"
                checked={value.selected.includes(option)}
                onChange={(event) => toggle(option, event.target.checked)}
                disabled={readOnly}
              />
            }
            label={option}
            sx={{
              m: 0,
              "& .MuiFormControlLabel-label": {
                fontSize: "0.74rem",
                color: "#29486C",
              },
            }}
          />
        ))}

        <FormControlLabel
          control={
            <Checkbox
              size="small"
              checked={value.otherSelected}
              onChange={(event) => {
                onChange({
                  ...value,
                  otherSelected: event.target.checked,
                  otherDraft: event.target.checked ? value.otherDraft : "",
                });

                setCustomError(null);
                onBlur?.();
              }}
              disabled={readOnly}
            />
          }
          label="Other, specify"
          sx={{
            m: 0,
            "& .MuiFormControlLabel-label": {
              fontSize: "0.74rem",
              color: "#29486C",
            },
          }}
        />
      </FormGroup>

      {value.otherSelected && !readOnly && (
        <Stack direction={{ xs: "column", sm: "row" }} sx={{ mt: 1, gap: 1 }}>
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
            placeholder="Specify other"
            aria-label={`Add custom ${title.toLowerCase()} option`}
          />

          <Button
            variant="outlined"
            onClick={addCustom}
            disabled={!value.otherDraft.trim()}
            sx={{
              textTransform: "none",
              flexShrink: 0,
            }}
          >
            Add
          </Button>
        </Stack>
      )}

      {value.customOptions.length > 0 && (
        <Stack
          direction="row"
          sx={{
            mt: 1,
            flexWrap: "wrap",
            gap: 0.75,
          }}
        >
          {value.customOptions.map((item) => (
            <Chip
              key={item}
              size="small"
              label={item}
              color={value.selected.includes(item) ? "primary" : "default"}
              variant={value.selected.includes(item) ? "filled" : "outlined"}
              onClick={
                readOnly
                  ? undefined
                  : () => toggle(item, !value.selected.includes(item))
              }
              onDelete={
                readOnly
                  ? undefined
                  : () => {
                      onChange({
                        ...value,
                        customOptions: value.customOptions.filter(
                          (option) => option !== item,
                        ),
                        selected: value.selected.filter(
                          (option) => option !== item,
                        ),
                      });
                    }
              }
            />
          ))}
        </Stack>
      )}

      <FieldError id={id} message={error ?? customError} />
    </Box>
  );
}
