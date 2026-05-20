// Shared TypeScript types across LivingLink apps

export type UserRole = "donor" | "patient" | "coordinator" | "clinician" | "admin";

export type DonationStatus =
  | "EXPLORING"
  | "IN_EVALUATION"
  | "APPROVED"
  | "DONATED"
  | "DECLINED";

export type SmokingStatus = "never" | "former" | "current";

export interface EligibilityCheck {
  bmi?: number;
  bpSystolic?: number;
  bpDiastolic?: number;
  egfr?: number;
  smokingStatus?: SmokingStatus;
  hasDiabetes?: boolean;
  age?: number;
}

export interface EligibilityResult {
  eligible: boolean;
  flags: string[];
  aiSummary: string;
  goals: HealthGoal[];
}

export interface HealthGoal {
  metric: "BMI" | "BLOOD_PRESSURE" | "SMOKING" | "BLOOD_SUGAR" | "WEIGHT";
  targetValue: number;
  currentValue?: number;
  targetDate: string;
  status: "ACTIVE" | "ACHIEVED" | "PAUSED";
}

export interface WageCalculatorInput {
  hourlyRate: number;
  hoursPerWeek: number;
  recoveryWeeks: number;
  annualSalary?: number;
  employmentType: "hourly" | "salaried";
}

export interface WageCalculatorResult {
  totalLostWages: number;
  nldacEstimate: number;
  stateCredits: StateCredit[];
  fmlaEligible: boolean;
}

export interface StateCredit {
  state: string;
  type: string;
  maxAmount: number;
  description: string;
  url: string;
}

export interface MentorProfile {
  id: string;
  donationYear: number;
  languages: string[];
  specialties: string[];
  bio: string;
  matchScore?: number;
}

export interface CheckIn {
  weekNumber: string;
  bpSystolic?: number;
  bpDiastolic?: number;
  weightKg?: number;
  moodScore?: number;
  energyScore?: number;
  notes?: string;
}

export interface PHQ2Result {
  q1Score: number;
  q2Score: number;
  total: number;
  escalated: boolean;
}

export interface FHIRBundle {
  resourceType: "Bundle";
  type: string;
  entry: FHIREntry[];
}

export interface FHIREntry {
  resource: Record<string, unknown>;
}

export * from "./fhir-types";
