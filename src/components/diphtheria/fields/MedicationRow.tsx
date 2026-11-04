import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import {
  Autocomplete,
  Box,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  TableCell,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";

import { FieldError } from "../components/FieldParts";
import {
  ANTIBIOTIC_MEDICATION_OPTIONS,
  ANTIBIOTIC_ROUTE_OPTIONS,
  OTHER_MEDICATION,
  antibioticFieldId,
} from "../constants/treatment.constants";
import { useDiphtheriaForm } from "../context/DiphtheriaFormContext";
import {
  hasAntibioticContent,
  normalizeMedicationName,
} from "../utils/form.utils";
import DateField from "./DateField";

import type {
  AdministrationRoute,
  AntibioticRow,
} from "../types/diphtheria.types";

interface MedicationRowProps {
  row: AntibioticRow;
  index: number;
  rows: readonly AntibioticRow[];
}

const inputSx = {
  width: "100%",
  minWidth: 0,
  "& .MuiOutlinedInput-root": {
    bgcolor: "#FFFFFF",
    borderRadius: "6px",
    minHeight: 39,
  },
  "& .MuiOutlinedInput-notchedOutline": {
    borderColor: "#C9D9EF",
  },
  "& .MuiInputBase-input": {
    minWidth: 0,
    fontSize: "0.75rem",
  },
} as const;

function MobileCellLabel({ children }: { children: string }) {
  return (
    <Typography
      sx={{
        display: "block",
        mb: 0.5,
        color: "#17365F",
        fontSize: "0.73rem",
        fontWeight: 600,
        "@container (min-width: 900px)": {
          display: "none",
        },
      }}
    >
      {children}
    </Typography>
  );
}

export default function MedicationRow({
  row,
  index,
  rows,
}: MedicationRowProps) {
  const {
    readOnly,
    updateAntibioticRow,
    removeAntibioticRow,
    markTouched,
    fieldError,
  } = useDiphtheriaForm();

  const medicationId = antibioticFieldId(row.id, "medication");
  const routeId = antibioticFieldId(row.id, "administrationRoute");
  const startId = antibioticFieldId(row.id, "startDate");
  const endId = antibioticFieldId(row.id, "endDate");

  const customMode = row.medicationOrigin === "custom";

  // In custom mode, the medication error targets
  // the actual custom text input, not the dropdown.
  const selectionId = customMode ? `${medicationId}-choice` : medicationId;

  const medicationError = fieldError(medicationId);
  const routeError = fieldError(routeId);

  const updateRow = (patch: Partial<Omit<AntibioticRow, "id">>) => {
    updateAntibioticRow(row.id, patch);
  };

  const selectedElsewhere = new Set(
    rows
      .filter(
        (other) => other.id !== row.id && other.medication.trim().length > 0,
      )
      .map((other) => normalizeMedicationName(other.medication)),
  );

  const availableMedications = ANTIBIOTIC_MEDICATION_OPTIONS.filter(
    (medication) =>
      medication === OTHER_MEDICATION ||
      (row.medicationOrigin === "predefined" &&
        medication === row.medication) ||
      !selectedElsewhere.has(normalizeMedicationName(medication)),
  );

  const selectedMedication = customMode
    ? OTHER_MEDICATION
    : row.medicationOrigin === "predefined"
      ? row.medication || null
      : null;

  const canRemove = !readOnly && hasAntibioticContent(row);

  return (
    <TableRow>
      {/* MEDICATION */}
      <TableCell>
        <Box sx={{ minWidth: 0 }}>
          <MobileCellLabel>
            {`Medication — Record ${index + 1}`}
          </MobileCellLabel>

          <Autocomplete<string, false, false, false>
            id={selectionId}
            options={availableMedications}
            value={selectedMedication}
            readOnly={readOnly}
            size="small"
            fullWidth
            onChange={(_, selected) => {
              if (selected === OTHER_MEDICATION) {
                updateRow({
                  medication: "",
                  medicationOrigin: "custom",
                });
              } else if (selected === null) {
                updateRow({
                  medication: "",
                  medicationOrigin: null,
                });
              } else {
                updateRow({
                  medication: selected,
                  medicationOrigin: "predefined",
                });
              }

              markTouched(medicationId);
            }}
            noOptionsText="No medications available"
            renderInput={(params) => (
              <TextField
                {...params}
                id={selectionId}
                size="small"
                placeholder="Medications"
                error={Boolean(medicationError)}
                onBlur={() => markTouched(medicationId)}
                slotProps={{
                  ...params.slotProps,
                  htmlInput: {
                    ...params.slotProps.htmlInput,
                    "aria-label": `Medication selection for record ${index + 1}`,
                    "aria-describedby": `${medicationId}-helper`,
                  },
                }}
                sx={inputSx}
              />
            )}
          />

          {customMode && (
            <TextField
              id={medicationId}
              value={row.medication}
              onChange={(event) =>
                updateRow({
                  medication: event.target.value,
                  medicationOrigin: "custom",
                })
              }
              onBlur={() => markTouched(medicationId)}
              placeholder="Enter medication name"
              size="small"
              fullWidth
              error={Boolean(medicationError)}
              slotProps={{
                htmlInput: {
                  readOnly,
                  "aria-label": `Custom medication for record ${index + 1}`,
                  "aria-describedby": `${medicationId}-helper`,
                },
              }}
              sx={{
                ...inputSx,
                mt: 0.75,
              }}
            />
          )}

          <FieldError id={medicationId} message={medicationError} />
        </Box>
      </TableCell>

      {/* ADMINISTRATION ROUTE */}
      <TableCell>
        <Box sx={{ minWidth: 0 }}>
          <MobileCellLabel>Administration route</MobileCellLabel>

          <FormControl fullWidth size="small" error={Boolean(routeError)}>
            <Select<AdministrationRoute | "">
              id={routeId}
              value={row.administrationRoute ?? ""}
              displayEmpty
              disabled={readOnly}
              onChange={(event) =>
                updateRow({
                  administrationRoute: event.target.value || null,
                })
              }
              onBlur={() => markTouched(routeId)}
              aria-label={`Administration route for record ${index + 1}`}
              aria-describedby={`${routeId}-helper`}
              renderValue={(selected) => {
                if (selected === "") {
                  return (
                    <Typography
                      component="span"
                      sx={{
                        color: "#8C9DB1",
                        fontSize: "0.75rem",
                      }}
                    >
                      Route
                    </Typography>
                  );
                }

                return (
                  ANTIBIOTIC_ROUTE_OPTIONS.find(
                    (option) => option.value === selected,
                  )?.label ?? selected
                );
              }}
              sx={{
                bgcolor: "#FFFFFF",
                borderRadius: "6px",
                minHeight: 39,
                fontSize: "0.75rem",
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#C9D9EF",
                },
              }}
            >
              <MenuItem value="">
                <em>Select route</em>
              </MenuItem>

              {ANTIBIOTIC_ROUTE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FieldError id={routeId} message={routeError} />
        </Box>
      </TableCell>

      {/* START DATE */}
      <TableCell>
        <Box sx={inputSx}>
          <MobileCellLabel>Start date</MobileCellLabel>

          <DateField
            id={startId}
            label={`Start date for record ${index + 1}`}
            hideLabel
            value={row.startDate}
            onChange={(startDate) => updateRow({ startDate })}
            onBlur={() => markTouched(startId)}
            error={fieldError(startId)}
            readOnly={readOnly}
            noFuture
          />
        </Box>
      </TableCell>

      {/* END DATE */}
      <TableCell>
        <Box sx={inputSx}>
          <MobileCellLabel>End date</MobileCellLabel>

          <DateField
            id={endId}
            label={`End date for record ${index + 1}`}
            hideLabel
            value={row.endDate}
            onChange={(endDate) => updateRow({ endDate })}
            onBlur={() => markTouched(endId)}
            error={fieldError(endId)}
            readOnly={readOnly}
            minDate={row.startDate || undefined}
            noFuture
          />
        </Box>
      </TableCell>

      {/* REMOVE RECORD */}
      <TableCell
        sx={{
          textAlign: "center",
          verticalAlign: "middle",
        }}
      >
        <Tooltip title="Remove medication record">
          <span>
            <IconButton
              size="small"
              color="error"
              disabled={!canRemove}
              onClick={() => removeAntibioticRow(row.id)}
              aria-label={`Remove medication record ${index + 1}`}
            >
              <DeleteOutlinedIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}
