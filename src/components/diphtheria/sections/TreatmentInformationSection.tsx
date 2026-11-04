import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

import MedicationRow from "../fields/MedicationRow";
import { FieldError } from "../components/FieldParts";
import { TREATMENT_FIELD_IDS as IDS } from "../constants/treatment.constants";
import { useDiphtheriaForm } from "../context/DiphtheriaFormContext";

const treatmentTableSx = {
  width: "100%",
  minWidth: 0,
  tableLayout: "fixed",
  borderCollapse: "separate",
  borderSpacing: 0,
  display: "block",

  "@container (min-width: 900px)": {
    display: "table",
  },

  "& .MuiTableHead-root": {
    display: "none",
    "@container (min-width: 900px)": {
      display: "table-header-group",
    },
  },

  "& .MuiTableBody-root": {
    display: "block",
    "@container (min-width: 900px)": {
      display: "table-row-group",
    },
  },

  "& .MuiTableRow-root": {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: 1.25,
    p: 1.25,
    borderBottom: "1px solid #E2EAF5",

    "@container (min-width: 620px)": {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    },

    "@container (min-width: 900px)": {
      display: "table-row",
      p: 0,
      borderBottom: "none",
    },
  },

  "& .MuiTableCell-root": {
    display: "block",
    minWidth: 0,
    p: 0,
    border: "none",
    verticalAlign: "top",

    "@container (min-width: 900px)": {
      display: "table-cell",
      p: 1,
      borderRight: "1px solid #E2EAF5",
      borderBottom: "1px solid #E2EAF5",
    },
  },

  "& .MuiTableHead-root .MuiTableCell-root": {
    bgcolor: "#F3F7FD",
    color: "#22436B",
    fontWeight: 600,
    fontSize: "0.73rem",
    lineHeight: 1.4,
    py: 1.3,
  },

  "& .MuiTableBody-root .MuiTableRow-root:last-child": {
    borderBottom: "none",
  },

  "& .MuiTableCell-root:last-child": {
    borderRight: "none",
  },
} as const;

export default function TreatmentInformationSection() {
  const { data, update, markTouched, fieldError, readOnly } =
    useDiphtheriaForm();

  const { antibioticsAdministered, antibioticRows } = data.treatment;

  const questionError = fieldError(IDS.antibioticsAdministered);

  const recordsError = fieldError(IDS.antibioticRows);

  const therapyGiven = antibioticsAdministered === "yes";

  const steroidsSelected = antibioticRows.some(
    (row) =>
      row.medication === "Steroids" && row.medicationOrigin === "predefined",
  );

  return (
    <Box
      sx={{
        px: { xs: 1.5, sm: 2 },
        py: 2,
        minWidth: 0,
        width: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* ANTIBIOTIC THERAPY QUESTION */}
      <Box
        sx={{
          display: "flex",
          flexDirection: {
            xs: "column",
            sm: "row",
          },
          alignItems: {
            xs: "flex-start",
            sm: "center",
          },
          columnGap: 2,
          rowGap: 0.75,
          minWidth: 0,
          pl: { xs: 0, sm: 3 },
        }}
      >
        <Typography
          id="antibiotic-therapy-question"
          sx={{
            display: "flex",
            alignItems: "center",
            minHeight: 34,
            color: "#17365F",
            fontSize: "0.78rem",
            fontWeight: 500,
          }}
        >
          Administered antibiotic therapy?
        </Typography>

        <ToggleButtonGroup
          id={IDS.antibioticsAdministered}
          aria-labelledby="antibiotic-therapy-question"
          aria-describedby={
            questionError ? `${IDS.antibioticsAdministered}-helper` : undefined
          }
          value={antibioticsAdministered}
          exclusive
          size="small"
          disabled={readOnly}
          onChange={(_, nextValue: string | null) => {
            if (nextValue === "yes" || nextValue === "no") {
              update({
                section: "treatment",
                patch: {
                  antibioticsAdministered: nextValue,
                },
              });
            }
          }}
          onBlur={() => markTouched(IDS.antibioticsAdministered)}
          sx={{
            display: "flex",
            gap: 0.5,
            "& .MuiToggleButton-root": {
              minWidth: 55,
              height: 32,
              px: 1.5,
              py: 0.5,
              textTransform: "none",
              fontSize: "0.73rem",
              color: "#476181",
              border: `1px solid ${
                questionError ? "#D32F2F" : "#D4E0EE"
              } !important`,
              borderRadius: "5px !important",

              "&:hover": {
                bgcolor: "transparent",
              },

              "&.Mui-selected": {
                bgcolor: "#EAF3FF",
                color: "#164CA4",
                "&:hover": {
                  bgcolor: "#EAF3FF",
                },
              },
            },
          }}
        >
          <ToggleButton value="yes">Yes</ToggleButton>
          <ToggleButton value="no">No</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {questionError && (
        <FieldError id={IDS.antibioticsAdministered} message={questionError} />
      )}

      {/* ANTIBIOTIC THERAPY RECORD */}
      {therapyGiven && (
        <Box
          id={IDS.antibioticRows}
          tabIndex={-1}
          sx={{
            mt: 2,
            minWidth: 0,
            outline: "none",
          }}
        >
          <Typography
            component="h3"
            sx={{
              mb: 1.25,
              ml: 1,
              color: "#1755C9",
              fontSize: "0.73rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.01em",
            }}
          >
            Antibiotic Therapy Record
          </Typography>

          <Box
            sx={{
              width: "100%",
              minWidth: 0,
              containerType: "inline-size",
            }}
          >
            <Paper
              variant="outlined"
              sx={{
                borderColor: "#DCE6F3",
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "none",
              }}
            >
              <TableContainer
                sx={{
                  width: "100%",
                  overflowX: "hidden",
                }}
              >
                <Table
                  size="small"
                  aria-label="Antibiotic therapy record"
                  sx={treatmentTableSx}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: "27%" }}>Medication</TableCell>

                      <TableCell sx={{ width: "26%" }}>
                        Administration route
                      </TableCell>

                      <TableCell sx={{ width: "20%" }}>Start date</TableCell>

                      <TableCell sx={{ width: "20%" }}>End date</TableCell>

                      <TableCell
                        sx={{
                          width: "7%",
                          textAlign: "center",
                        }}
                        aria-label="Remove record"
                      />
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {antibioticRows.map((row, index) => (
                      <MedicationRow
                        key={row.id}
                        row={row}
                        index={index}
                        rows={antibioticRows}
                      />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>

          <FieldError id={IDS.antibioticRows} message={recordsError} />

          {steroidsSelected && (
            <Typography
              variant="caption"
              sx={{
                display: "block",
                mt: 0.5,
                color: "warning.dark",
                fontSize: "0.71rem",
                lineHeight: 1.5,
              }}
            >
              Clinical review: Steroids is included in the requested medication
              list but is not an antibiotic.
            </Typography>
          )}

          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 1,
              color: "#718096",
              fontSize: "0.71rem",
              lineHeight: 1.5,
            }}
          >
            A new empty row appears automatically when you begin entering
            another medication record.
          </Typography>
        </Box>
      )}
    </Box>
  );
}
