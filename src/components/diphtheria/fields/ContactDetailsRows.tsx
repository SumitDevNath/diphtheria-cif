import { Box, Button, IconButton, Tooltip } from "@mui/material";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { FieldLabel } from "../components/FieldParts";
import { createEmptyDiphtheriaContact } from "../constants/form.constants";
import { useDiphtheriaForm } from "../context/DiphtheriaFormContext";
import { ValidatedField } from "./ValidatedField";
import type { DiphtheriaContact } from "../types/diphtheria.types";

/** Contact details are optional. Only filled-in age values are checked for validity. */
export default function ContactDetailsRows() {
  const { data, update, readOnly, markTouched, fieldError } =
    useDiphtheriaForm();
  const contacts = data.background.contacts ?? [];

  const setContacts = (next: DiphtheriaContact[]) =>
    update({ section: "background", patch: { contacts: next } });

  const updateContact = (
    id: string,
    patch: Partial<Omit<DiphtheriaContact, "id">>,
  ) =>
    setContacts(
      contacts.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );

  const fields = [
    { key: "name", label: "Name", placeholder: "Contact name" },
    { key: "age", label: "Age", placeholder: "Age in years" },
    { key: "address", label: "Address", placeholder: "Contact address" },
    {
      key: "contactNumber",
      label: "Contact number",
      placeholder: "Contact number",
    },
  ] as const;

  return (
    <Box sx={{ mb: 2, minWidth: 0 }}>
      <FieldLabel id="background-contacts">Contact details</FieldLabel>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
        {contacts.map((row, index) => (
          <Box
            key={row.id}
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "minmax(0, 1fr)",
                sm: "repeat(2, minmax(0, 1fr))",
                lg: "minmax(0, 1.2fr) minmax(90px, 0.55fr) minmax(0, 2fr) minmax(125px, 0.9fr)",
              },
              gap: 1.5,
              alignItems: "start",
              p: { xs: 1.25, sm: 1.5 },
              border: "1px solid #D6E4F5",
              borderRadius: "8px",
              bgcolor: "#FBFDFF",
              minWidth: 0,
            }}
          >
            {fields.map(({ key, label, placeholder }) => {
              const id = `background-contact-${row.id}-${key}`;
              return (
                <Box key={key} sx={{ minWidth: 0 }}>
                  <ValidatedField
                    id={id}
                    label={label}
                    placeholder={placeholder}
                    value={row[key]}
                    inputMode={
                      key === "age"
                        ? "numeric"
                        : key === "contactNumber"
                          ? "text"
                          : "text"
                    }
                    onChange={(value) =>
                      updateContact(row.id, { [key]: value })
                    }
                    onBlur={() => markTouched(id)}
                    error={fieldError(id)}
                    readOnly={readOnly}
                  />
                </Box>
              );
            })}
            {contacts.length > 1 && (
              <Box
                sx={{
                  gridColumn: "1 / -1",
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
                <Tooltip title={`Remove contact ${index + 1}`}>
                  <span>
                    <IconButton
                      size="small"
                      color="error"
                      disabled={readOnly}
                      aria-label={`Remove contact ${index + 1}`}
                      onClick={() =>
                        setContacts(
                          contacts.filter((item) => item.id !== row.id),
                        )
                      }
                    >
                      <DeleteOutlinedIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
              </Box>
            )}
          </Box>
        ))}
      </Box>
      <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 1.25 }}>
        <Button
          type="button"
          size="small"
          variant="outlined"
          disabled={readOnly}
          onClick={() =>
            setContacts([...contacts, createEmptyDiphtheriaContact()])
          }
          sx={{
            textTransform: "none",
            fontSize: "0.8125rem",
            fontWeight: 600,
            borderRadius: "6px",
            color: "#1755C9",
            borderColor: "#2563EB",
          }}
        >
          + Add Contact
        </Button>
      </Box>
    </Box>
  );
}
