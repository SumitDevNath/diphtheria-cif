import type {
  ClinicalDetails,
  ClinicalGroupKey,
} from "../types/diphtheria.types";

interface ClinicalGroupDefinition {
  key: ClinicalGroupKey;
  number: string;
  title: string;
  options: readonly string[];
}

export const CLINICAL_GROUPS = [
  {
    key: "symptoms",
    number: "01",
    title: "Symptoms",
    options: [
      "Fever",
      "Sore throat",
      "Difficulty swallowing",
      "Difficulty breathing",
      "Nasal regurgitation",
      "Bloody nasal discharge",
      "Ear discharge",
      "Drooling of saliva",
      "Change in voice",
      "Swollen neck",
      "Skin ulcers",
    ],
  },
  {
    key: "signs",
    number: "02",
    title: "Signs",
    options: [
      "Pseudomembrane",
      "Gross cervical lymphadenopathy",
      "Chest indrawing",
      "Fast breathing rate",
      "Stridor",
      "Central cyanosis",
      "Fast heart rate",
      "Decreased capillary refill (>3 s)",
      "Weakness",
      "Lethargy",
      "Restlessness",
    ],
  },
  {
    key: "complications",
    number: "03",
    title: "Complications",
    options: [
      "Respiratory distress",
      "Shock",
      "Irregular heart rate",
      "Peripheral neuritis/neuropathy",
      "Kidney failure",
      "Cutaneous necrotic lesions",
    ],
  },
  {
    key: "comorbidConditions",
    number: "04",
    title: "Comorbid conditions",
    options: [
      "Malnutrition",
      "Measles",
      "Acute watery diarrhoea",
      "HIV suspected",
      "Tuberculosis suspected",
      "Jaundice",
      "Pregnancy",
    ],
  },
] as const satisfies readonly ClinicalGroupDefinition[];

export const CLINICAL_FIELD_IDS = {
  onsetDate: "clinical-onsetDate",
  symptoms: "clinical-symptoms",
  signs: "clinical-signs",
  complications: "clinical-complications",
  comorbidConditions: "clinical-comorbidConditions",
  hospital: "clinical-hospital",
  visitDate: "clinical-visitDate",
  admissionDate: "clinical-admissionDate",
  hospitalRecordNumber: "clinical-hospitalRecordNumber",
} as const satisfies Record<keyof ClinicalDetails, string>;

/**
 * The Figma does not mark these fields mandatory.
 * Update after confirmation from NDSS/clinical stakeholders.
 *
 * Clinical checkbox groups are not required to contain
 * a selection unless the official form rules specify it.
 */
export const CLINICAL_REQUIRED = {
  onsetDate: false,
  hospital: false,
  visitDate: false,
  admissionDate: false,
  hospitalRecordNumber: false,
} as const satisfies Record<
  Exclude<keyof ClinicalDetails, ClinicalGroupKey>,
  boolean
>;
