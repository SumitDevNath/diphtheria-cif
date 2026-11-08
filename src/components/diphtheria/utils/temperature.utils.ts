import type { TemperatureUnit } from "../types/diphtheria.types";

const NUMBER_PATTERN = /^[+-]?(?:\d+(?:\.\d+)?|\.\d+)$/;

export function isValidTemperatureNumber(value: string): boolean {
  const text = value.trim();

  return NUMBER_PATTERN.test(text) && Number.isFinite(Number(text));
}

export function convertTemperature(
  value: string,
  from: TemperatureUnit,
  to: TemperatureUnit,
): string {
  if (from === to || !value.trim()) return value;

  if (!isValidTemperatureNumber(value)) {
    return value;
  }

  const temperature = Number(value);

  const result =
    from === "C" ? (temperature * 9) / 5 + 32 : ((temperature - 32) * 5) / 9;

  // Two decimal places prevent excessive display precision.
  return String(Number(result.toFixed(2)));
}
