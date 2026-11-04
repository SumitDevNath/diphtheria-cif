import type { FacilityOption } from "../types/diphtheria.types";

/**
 * Development-only fixtures.
 * These are NOT official DGHS facility identifiers.
 *
 * Replace this data at the application boundary when the
 * approved DGHS facility provider becomes available.
 */
export const MOCK_FACILITIES: readonly FacilityOption[] = [
  {
    id: "mock-facility-001",
    name: "Demo Healthcare Facility A",
  },
  {
    id: "mock-facility-002",
    name: "Demo Healthcare Facility B",
  },
  {
    id: "mock-facility-003",
    name: "Demo Healthcare Facility C",
  },
];
