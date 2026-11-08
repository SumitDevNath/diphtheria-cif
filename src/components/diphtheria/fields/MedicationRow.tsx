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

import { FieldError, RequiredMark } from "../components/FieldParts";

import {
  ANTIBIOTIC_MEDICATION_OPTIONS,
  ANTIBIOTIC_ROUTE_OPTIONS,
  OTHER_MEDICATION,
  TREATMENT_REQUIRED as REQUIRED,
  antibioticFieldId,
} from "../constants/treatment.constants";

import { useDiphtheriaForm } from "../context/DiphtheriaFormContext";
import { normalizeMedicationName } from "../utils/form.utils";

import DateField from "./DateField";

import type {
  AdministrationRoute,
  AntibioticRow,
} from "../types/diphtheria.types";

interface MedicationRowProps {
  row: AntibioticRow;
  index: number;
  rows: readonly AntibioticRow[];
  showRemove: boolean;
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
    fontSize: "0.8125rem",
  },
} as const;

function MobileCellLabel({
  children,
  required = false,
}: {
  children: string;
  required?: boolean;
}) {
  return (
    <Typography
      sx={{
        display: "block",
        mb: 0.5,
        color: "#17365F",
        fontSize: "0.75rem",
        fontWeight: 600,
        "@container (min-width: 900px)": {
          display: "none",
        },
      }}
    >
      {children}
      {required && <RequiredMark />}
    </Typography>
  );
}

export default function MedicationRow({
  row,
  index,
  rows,
  showRemove,
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

  const selectionId = customMode ? `${medicationId}-choice` : medicationId;

  const medicationError = fieldError(medicationId);
  const routeError = fieldError(routeId);

  const updateRow = (patch: Partial<Omit<AntibioticRow, "id">>) =>
    updateAntibioticRow(row.id, patch);

  const usedMedications = new Set(
    rows
      .filter((other) => other.id !== row.id && other.medication.trim())
      .map((other) => normalizeMedicationName(other.medication)),
  );

  const options = ANTIBIOTIC_MEDICATION_OPTIONS.filter(
    (medication) =>
      medication === OTHER_MEDICATION ||
      (row.medicationOrigin === "predefined" &&
        row.medication === medication) ||
      !usedMedications.has(normalizeMedicationName(medication)),
  );

  const selectedMedication = customMode
    ? OTHER_MEDICATION
    : row.medicationOrigin === "predefined"
      ? row.medication || null
      : null;

  return (
    <TableRow>
      {/* MEDICATION */}
      <TableCell>
        <Box sx={{ minWidth: 0 }}>
          <MobileCellLabel required={REQUIRED.medication}>
            {`Medication — Record ${index + 1}`}
          </MobileCellLabel>

          <Autocomplete<string, false, false, false>
            id={selectionId}
            size="small"
            fullWidth
            readOnly={readOnly}
            options={options}
            value={selectedMedication}
            onChange={(_, selected) => {
              if (selected === OTHER_MEDICATION) {
                updateRow({
                  medication: "",
                  medicationOrigin: "custom",
                });
              } else if (selected) {
                updateRow({
                  medication: selected,
                  medicationOrigin: "predefined",
                });
              } else {
                updateRow({
                  medication: "",
                  medicationOrigin: null,
                });
              }

              markTouched(medicationId);
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                id={selectionId}
                placeholder="Select medication"
                error={Boolean(medicationError)}
                onBlur={() => markTouched(medicationId)}
                slotProps={{
                  ...params.slotProps,
                  htmlInput: {
                    ...params.slotProps.htmlInput,
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
              size="small"
              fullWidth
              value={row.medication}
              onChange={(event) =>
                updateRow({
                  medication: event.target.value,
                  medicationOrigin: "custom",
                })
              }
              onBlur={() => markTouched(medicationId)}
              placeholder="Enter medication name"
              error={Boolean(medicationError)}
              slotProps={{
                htmlInput: {
                  readOnly,
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
          <MobileCellLabel required={REQUIRED.administrationRoute}>
            Administration route
          </MobileCellLabel>

          <FormControl size="small" fullWidth error={Boolean(routeError)}>
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
              aria-label={`Administration route ${index + 1}`}
              aria-describedby={`${routeId}-helper`}
              renderValue={(value) =>
                value
                  ? (ANTIBIOTIC_ROUTE_OPTIONS.find(
                      (option) => option.value === value,
                    )?.label ?? value)
                  : "Select route"
              }
              sx={{
                bgcolor: "#FFFFFF",
                borderRadius: "6px",
                minHeight: 39,
                fontSize: "0.8125rem",
              }}
            >
              <MenuItem value="">Select route</MenuItem>

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
          <MobileCellLabel required={REQUIRED.startDate}>
            Start date
          </MobileCellLabel>

          <DateField
            id={startId}
            label={`Start date for record ${index + 1}`}
            hideLabel
            required={REQUIRED.startDate}
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
          <MobileCellLabel required={REQUIRED.endDate}>
            End date
          </MobileCellLabel>

          <DateField
            id={endId}
            label={`End date for record ${index + 1}`}
            hideLabel
            required={REQUIRED.endDate}
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

      {/* REMOVE BUTTON: MULTIPLE ROWS ONLY */}
      {showRemove && (
        <TableCell
          sx={{
            position: "absolute",
            top: 4,
            right: 4,
            width: "auto",
            textAlign: "center",
            "@container (min-width: 900px)": {
              position: "static",
              width: "7%",
            },
          }}
        >
          <Tooltip title="Remove medication record">
            <span>
              <IconButton
                type="button"
                size="small"
                color="error"
                disabled={readOnly}
                onClick={() => removeAntibioticRow(row.id)}
                aria-label={`Remove medication record ${index + 1}`}
              >
                <DeleteOutlinedIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </TableCell>
      )}
    </TableRow>
  );
}
