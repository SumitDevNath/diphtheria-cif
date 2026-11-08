import { Box, Typography } from "@mui/material";

import {
  CLINICAL_FIELD_IDS as IDS,
  CLINICAL_REQUIRED as REQUIRED,
} from "../constants/clinical.constants";

import { useDiphtheriaForm } from "../context/DiphtheriaFormContext";
import DateField from "../fields/DateField";
import { RequiredMark } from "./FieldParts";

export default function ClinicalOnsetHeaderField() {
  const { data, update, fieldError, markTouched, readOnly } =
    useDiphtheriaForm();

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        alignItems: "flex-start",
        justifyContent: "flex-start",
        columnGap: 1.5,
        rowGap: 1,
        minWidth: 0,
      }}
    >
      {/* QUESTION TEXT */}
      <Typography
        component="label"
        htmlFor={IDS.onsetDate}
        sx={{
          display: "flex",
          alignItems: "center",
          height: { xs: "auto", md: 42 },
          minHeight: 42,
          m: 0,
          color: "#17365F",
          fontSize: "0.875rem",
          fontWeight: 600,
          lineHeight: 1.4,
          whiteSpace: { xs: "normal", md: "nowrap" },
          flexShrink: 0,
        }}
      >
        Date of onset of fever and sore throat
        {REQUIRED.onsetDate && <RequiredMark />}
      </Typography>

      {/* DATE INPUT */}
      <Box
        sx={{
          width: { xs: "100%", md: 185 },
          minWidth: 0,
          flexShrink: 0,

          "& .MuiFormControl-root": {
            m: 0,
          },

          "& .MuiOutlinedInput-root": {
            minHeight: 42,
          },
        }}
      >
        <DateField
          id={IDS.onsetDate}
          label="Date of onset of fever and sore throat"
          hideLabel
          value={data.clinical.onsetDate}
          onChange={(onsetDate) =>
            update({
              section: "clinical",
              patch: { onsetDate },
            })
          }
          onBlur={() => markTouched(IDS.onsetDate)}
          error={fieldError(IDS.onsetDate)}
          readOnly={readOnly}
          required={REQUIRED.onsetDate}
          noFuture
        />
      </Box>
    </Box>
  );
}
