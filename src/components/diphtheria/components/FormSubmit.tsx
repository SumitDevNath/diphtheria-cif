import { useMemo, useRef, useState } from "react";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";

import { useDiphtheriaForm } from "../context/DiphtheriaFormContext";

import type { DiphtheriaFormData } from "../types/diphtheria.types";

import {
  evaluateForm,
  type ValidationRule,
} from "../validation/form.validation";

import { TRAVEL_HISTORY_FIELD_ID } from "../validation/travel.integration.validation";

export type DiphtheriaSubmitHandler = (
  data: DiphtheriaFormData,
) => void | Promise<void>;

interface FormSubmitProps {
  validationRules: readonly ValidationRule[];
  onSubmit?: DiphtheriaSubmitHandler;
}

export default function FormSubmit({
  validationRules,
  onSubmit,
}: FormSubmitProps) {
  const { data, readOnly, implementedSections, submitAttempted, validateNow } =
    useDiphtheriaForm();

  const [submitting, setSubmitting] = useState(false);

  const [validatedSnapshot, setValidatedSnapshot] =
    useState<DiphtheriaFormData | null>(null);

  const [callbackError, setCallbackError] = useState<string | null>(null);

  const busyRef = useRef(false);

  /**
   * Validation automatically recalculates whenever
   * form data changes.
   *
   * The button becomes green only when the entire
   * applicable form passes its configured rules.
   */
  const result = useMemo(
    () => evaluateForm(data, validationRules, implementedSections),
    [data, validationRules, implementedSections],
  );

  const errorCount = Object.keys(result.errors).length;
  const isFormValid = result.valid;

  const showErrors = submitAttempted && !isFormValid;

  const showSuccess =
    validatedSnapshot === data && isFormValid && !callbackError;

  const travelError = result.errors[TRAVEL_HISTORY_FIELD_ID];

  const handleSubmit = async () => {
    if (readOnly || busyRef.current) return;

    setCallbackError(null);
    setValidatedSnapshot(null);

    const validation = validateNow();

    if (!validation.valid) {
      return;
    }

    busyRef.current = true;
    setSubmitting(true);

    try {
      /**
       * The form itself does not call an API.
       *
       * NDSS can supply an external callback later.
       * The current demo does not supply one.
       */
      if (onSubmit) {
        await onSubmit(data);
      }

      setValidatedSnapshot(data);
    } catch {
      setCallbackError("The submission callback could not complete.");
    } finally {
      busyRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <Box
      component="section"
      aria-label="Form validation and submission"
      sx={{
        width: "100%",
        minWidth: 0,
        pt: 1,
      }}
    >
      <Stack spacing={1.5}>
        {/* VALIDATION FEEDBACK */}
        {showErrors && (
          <Alert
            severity="error"
            variant="outlined"
            sx={{
              borderRadius: "8px",
              alignItems: "flex-start",
              "& .MuiAlert-message": {
                minWidth: 0,
                overflowWrap: "anywhere",
              },
            }}
          >
            <Typography
              sx={{
                fontSize: "0.8rem",
                fontWeight: 600,
              }}
            >
              Please correct the form before submitting.
            </Typography>

            {errorCount > 0 && (
              <Typography variant="body2" sx={{ mt: 0.35 }}>
                {errorCount}{" "}
                {errorCount === 1 ? "field requires" : "fields require"}{" "}
                attention. The first invalid field has been located.
              </Typography>
            )}

            {travelError && (
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Travel History: {travelError}
              </Typography>
            )}

            {result.incompleteSections.length > 0 && (
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                Incomplete sections: {result.incompleteSections.join(", ")}.
              </Typography>
            )}
          </Alert>
        )}

        {/* EXTERNAL CALLBACK FAILURE */}
        {callbackError && (
          <Alert
            severity="error"
            variant="outlined"
            sx={{ borderRadius: "8px" }}
          >
            {callbackError}
          </Alert>
        )}

        {/* FRONTEND VALIDATION SUCCESS */}
        {showSuccess && (
          <Alert
            severity="success"
            variant="outlined"
            sx={{ borderRadius: "8px" }}
          >
            {onSubmit
              ? "Validation passed. Form data was handed to the configured callback."
              : "Validation passed. Form data is ready for NDSS integration. No backend request was made."}
          </Alert>
        )}

        {/* SUBMIT BUTTON */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1.5,
          }}
        >
          {readOnly && (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Form is read-only.
            </Typography>
          )}

          <Button
            type="button"
            variant="contained"
            size="medium"
            loading={submitting}
            disabled={readOnly}
            onClick={() => {
              void handleSubmit();
            }}
            sx={{
              minWidth: 155,
              minHeight: 42,
              px: 3,
              py: 1.1,
              borderRadius: "7px",
              textTransform: "none",
              fontSize: "0.84rem",
              fontWeight: 600,
              boxShadow: "none",
              bgcolor: isFormValid ? "#16803D" : "#0B63C7",
              color: "#FFFFFF",
              "&:hover": {
                bgcolor: isFormValid ? "#116B32" : "#0953A8",
                boxShadow: "none",
              },
            }}
          >
            Submit Form
          </Button>
        </Box>
      </Stack>
    </Box>
  );
}
