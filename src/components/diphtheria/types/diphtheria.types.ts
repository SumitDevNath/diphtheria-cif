export type YesNo = "yes" | "no" | null;
export type YesNoUnknown = "yes" | "no" | "unknown" | null;
export type TemperatureUnit = "C" | "F";
export type AVPU = "alert" | "voice" | "pain" | "unresponsive";
export type VaccinationSource = "card" | "history";
export type AdministrationRoute = "oral" | "iv" | "im";

export type Ethnicity = "bengali" | "tribal-national" | "non-national";

export type PregnancyStatus = "pregnant" | "non-pregnant";

export interface Option<T extends string | number = string> {
  value: T;
  label: string;
}

/** The DGHS provider should supply stable IDs and display names. */
export interface FacilityOption {
  id: string;
  name: string;
}

export interface CaseIdentification {
  motherName: string;
  occupation: string | null;
  ethnicity: Ethnicity | null;
  pregnancyStatus: PregnancyStatus | null;
  examinationDate: string;
  schoolName: string;
}

export interface Vitals {
  heartRate: string;
  respiratoryRate: string;
  temperature: string;
  temperatureUnit: TemperatureUnit;
  bloodPressure: string;
  oxygenSaturation: string;
  avpu: AVPU | null;
}

export interface BackgroundInformation<TTravel = unknown> {
  contactKnownCase: YesNoUnknown;
  contactDetails: string;
  householdSize: string;
  caregiversTreated: string | null;
  similarIllnessInFamily: YesNo;
  similarIllnessDetails: string;
  healthcareVisit: YesNo;
  healthcareVisitDate: string;
  healthcareFacility: FacilityOption | null;
  /** Opaque until the external Travel History contract is available. */
  travelHistory: TTravel | null;
}

export interface VaccinationHistory {
  available: boolean;
  source: VaccinationSource | null;
  doses: number | null;
  lastVaccinationDate: string;
}

export interface ClinicalSelection {
  selected: string[];
  customOptions: string[];
  otherSelected: boolean;
  otherDraft: string;
}

export type ClinicalGroupKey =
  | "symptoms"
  | "signs"
  | "complications"
  | "comorbidConditions";

export interface ClinicalDetails {
  onsetDate: string;
  symptoms: ClinicalSelection;
  signs: ClinicalSelection;
  complications: ClinicalSelection;
  comorbidConditions: ClinicalSelection;
  hospital: FacilityOption | null;
  visitDate: string;
  admissionDate: string;
  hospitalRecordNumber: string;
}

export interface AntibioticRow {
  id: string;
  medication: string;
  medicationOrigin: "predefined" | "custom" | null;
  administrationRoute: AdministrationRoute | null;
  startDate: string;
  endDate: string;
}

export interface TreatmentInformation {
  antibioticsAdministered: YesNo;
  antibioticRows: AntibioticRow[];
}

/** Date strings use DD-MM-YYYY; incomplete entries are permitted in state. */
export interface DiphtheriaFormData<TTravel = unknown> {
  identification: CaseIdentification;
  vitals: Vitals;
  background: BackgroundInformation<TTravel>;
  vaccination: VaccinationHistory;
  clinical: ClinicalDetails;
  treatment: TreatmentInformation;
}

export type FormSectionKey = keyof DiphtheriaFormData;
export type FormFieldErrors = Record<string, string>;
