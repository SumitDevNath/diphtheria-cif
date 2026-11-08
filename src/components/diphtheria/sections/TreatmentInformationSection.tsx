import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

import { FieldError, RequiredMark } from "../components/FieldParts";
import MedicationRow from "../fields/MedicationRow";
import ToggleSwitch from "../fields/ToggleSwitch";
import {
  TREATMENT_FIELD_IDS as IDS,
  TREATMENT_REQUIRED as REQUIRED,
} from "../constants/treatment.constants";

import { useDiphtheriaForm } from "../context/DiphtheriaFormContext";

export function AntibioticTherapySwitch() {
  const { data, update, readOnly, fieldError } = useDiphtheriaForm();

  const checked = data.treatment.antibioticsAdministered === "yes";

  return (
    <Box sx={{ minWidth: 0 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.25,
          px: 1.25,
          py: 0.5,
          bgcolor: "#DEEBFB",
          borderRadius: "12px",
          maxWidth: "100%",
        }}
      >
        <Typography
          sx={{
            color: "#173B69",
            fontSize: "0.875rem",
            fontWeight: 600,
            lineHeight: 1.4,
          }}
        >
          Administered antibiotic therapy?
        </Typography>

        <ToggleSwitch
          id={IDS.antibioticsAdministered}
          checked={checked}
          disabled={readOnly}
          ariaLabel="Administered antibiotic therapy?"
          onChange={(enabled) =>
            update({
              section: "treatment",
              patch: {
                antibioticsAdministered: enabled ? "yes" : "no",
              },
            })
          }
        />
      </Box>

      <FieldError
        id={IDS.antibioticsAdministered}
        message={fieldError(IDS.antibioticsAdministered)}
      />
    </Box>
  );
}

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

  "& .MuiTableBody-root .MuiTableRow-root": {
    display: "grid",
    position: "relative",
    gridTemplateColumns: "minmax(0, 1fr)",
    gap: 1,
    p: 1.25,
    borderBottom: "1px solid #E2EAF5",

    "@container (min-width: 620px)": {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    },

    "@container (min-width: 900px)": {
      display: "table-row",
      position: "static",
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
      px: 1,
      py: 0.75,
      borderRight: "1px solid #E2EAF5",
      borderBottom: "1px solid #E2EAF5",
    },
  },

  "& .MuiTableHead-root .MuiTableCell-root": {
    bgcolor: "#F3F7FD",
    color: "#22436B",
    fontWeight: 600,
    fontSize: "0.78rem",
    lineHeight: 1.4,
    py: 1.25,
  },

  "& .MuiTableBody-root .MuiTableRow-root:last-child": {
    borderBottom: "none",
  },

  "& .MuiTableCell-root:last-child": {
    borderRight: "none",
  },
} as const;

export default function TreatmentInformationSection() {
  const { data, readOnly, addAntibioticRow, fieldError } = useDiphtheriaForm();

  const { antibioticsAdministered, antibioticRows } = data.treatment;

  // The treatment details are hidden while OFF.
  if (antibioticsAdministered !== "yes") {
    return null;
  }

  const showRemove = antibioticRows.length > 1;

  return (
    <Box
      sx={{
        px: { xs: 1.5, sm: 2 },
        py: 2,
        width: "100%",
        minWidth: 0,
        boxSizing: "border-box",
      }}
    >
      <Box
        id={IDS.antibioticRows}
        tabIndex={-1}
        sx={{ minWidth: 0, outline: "none" }}
      >
        <Typography
          component="h3"
          sx={{
            mb: 1.25,
            ml: 1,
            color: "#1755C9",
            fontSize: "0.875rem",
            fontWeight: 700,
            textTransform: "uppercase",
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
                    <TableCell
                      sx={{
                        width: showRemove ? "27%" : "30%",
                      }}
                    >
                      Medication{REQUIRED.medication && <RequiredMark />}
                    </TableCell>

                    <TableCell
                      sx={{
                        width: showRemove ? "26%" : "30%",
                      }}
                    >
                      Administration route
                      {REQUIRED.administrationRoute && <RequiredMark />}
                    </TableCell>

                    <TableCell sx={{ width: "20%" }}>
                      Start date{REQUIRED.startDate && <RequiredMark />}
                    </TableCell>

                    <TableCell sx={{ width: "20%" }}>
                      End date{REQUIRED.endDate && <RequiredMark />}
                    </TableCell>

                    {showRemove && (
                      <TableCell
                        sx={{
                          width: "7%",
                          textAlign: "center",
                        }}
                        aria-label="Remove record"
                      />
                    )}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {antibioticRows.map((row, index) => (
                    <MedicationRow
                      key={row.id}
                      row={row}
                      index={index}
                      rows={antibioticRows}
                      showRemove={showRemove}
                    />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>

        <FieldError
          id={IDS.antibioticRows}
          message={fieldError(IDS.antibioticRows)}
        />

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            mt: 1.5,
            ml: 1,
          }}
        >
          <Button
            type="button"
            variant="outlined"
            size="small"
            disabled={readOnly}
            onClick={addAntibioticRow}
            sx={{
              px: 2,
              py: 0.75,
              borderRadius: "6px",
              fontSize: "0.8125rem",
              fontWeight: 600,
              textTransform: "none",
              borderColor: "#2563EB",
              color: "#1755C9",
            }}
          >
            + Add Row
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
