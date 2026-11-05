import { useRef } from "react";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import { Box, IconButton, InputAdornment, TextField } from "@mui/material";
import { FieldError, FieldLabel } from "../components/FieldParts";
import {
  dmyToIso,
  isoToDmy,
  todayIsoLocal,
  type DateConstraints,
} from "../utils/date.utils";

export interface DateFieldProps extends DateConstraints {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  required?: boolean;
  readOnly?: boolean;
  hideLabel?: boolean;
}

export default function DateField({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  required = false,
  readOnly = false,
  hideLabel = false,
  noFuture = false,
  minDate,
  maxDate,
}: DateFieldProps) {
  const pickerRef = useRef<HTMLInputElement>(null);

  // Validation errors are supplied by Context
  // only after Submit Form has been clicked.
  const message = error;

  const nativeValue = dmyToIso(value) ?? "";

  const min = minDate ? (dmyToIso(minDate) ?? undefined) : undefined;

  const explicitMax = maxDate ? (dmyToIso(maxDate) ?? undefined) : undefined;

  const today = todayIsoLocal();

  const max =
    noFuture && (!explicitMax || today < explicitMax) ? today : explicitMax;

  const openPicker = () => {
    const input = pickerRef.current;

    if (!input || readOnly) return;

    try {
      if (typeof input.showPicker === "function") {
        input.showPicker();
      } else {
        input.focus();
        input.click();
      }
    } catch {
      input.focus();
    }
  };

  return (
    <Box sx={{ width: "100%", minWidth: 0 }}>
      {!hideLabel && (
        <FieldLabel id={id} required={required}>
          {label}
        </FieldLabel>
      )}

      <Box sx={{ position: "relative" }}>
        <TextField
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={onBlur}
          error={Boolean(message)}
          placeholder="DD-MM-YYYY"
          size="small"
          fullWidth
          slotProps={{
            htmlInput: {
              inputMode: "numeric",
              maxLength: 10,
              readOnly,
              "aria-label": hideLabel ? label : undefined,
              "aria-describedby": `${id}-helper`,
            },
            input: {
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    type="button"
                    size="small"
                    aria-label={`Open ${label} calendar`}
                    onClick={openPicker}
                    disabled={readOnly}
                    edge="end"
                  >
                    <CalendarMonthOutlinedIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              bgcolor: "#FFFFFF",
              borderRadius: "6px",
            },
          }}
        />

        <Box
          component="input"
          ref={pickerRef}
          type="date"
          aria-label={`${label} native calendar`}
          tabIndex={-1}
          value={nativeValue}
          min={min}
          max={max}
          disabled={readOnly}
          onChange={(event) => {
            onChange(isoToDmy(event.target.value));
            onBlur?.();
          }}
          sx={{
            position: "absolute",
            width: "1px",
            height: "1px",
            opacity: 0,
            pointerEvents: "none",
            right: 0,
            bottom: 0,
          }}
        />
      </Box>

      <FieldError id={id} message={message} />
    </Box>
  );
}
