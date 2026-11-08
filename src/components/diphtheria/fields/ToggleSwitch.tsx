import { Switch } from "@mui/material";

interface ToggleSwitchProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  ariaLabel: string;
}

export default function ToggleSwitch({
  id,
  checked,
  onChange,
  disabled = false,
  ariaLabel,
}: ToggleSwitchProps) {
  return (
    <Switch
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      disabled={disabled}
      slotProps={{
        input: {
          id,
          "aria-label": ariaLabel,
        },
      }}
      size="small"
      sx={{
        width: 46,
        height: 26,
        p: 0,
        "& .MuiSwitch-switchBase": {
          p: "3px",
          transitionDuration: "180ms",
          "&.Mui-checked": {
            transform: "translateX(20px)",
            color: "#ffffff",
            "& + .MuiSwitch-track": {
              backgroundColor: "#2563eb",
              opacity: 1,
            },
          },
        },
        "& .MuiSwitch-thumb": {
          width: 20,
          height: 20,
          boxShadow: "0 1px 2px rgba(15, 23, 42, 0.2)",
        },
        "& .MuiSwitch-track": {
          borderRadius: 13,
          backgroundColor: "#b6c3d3",
          opacity: 1,
        },
      }}
    />
  );
}
