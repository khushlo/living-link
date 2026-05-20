// FHIR R4 type stubs for LivingLink
// Maps living donation workflow to HL7 FHIR R4 resources

export interface FHIRPatient {
  resourceType: "Patient";
  id?: string;
  identifier?: FHIRIdentifier[];
  name?: FHIRHumanName[];
  gender?: "male" | "female" | "other" | "unknown";
  birthDate?: string;
  extension?: FHIRExtension[];
}

export interface FHIRObservation {
  resourceType: "Observation";
  id?: string;
  status: "final" | "preliminary" | "amended";
  code: FHIRCodeableConcept;
  subject?: FHIRReference;
  valueQuantity?: FHIRQuantity;
  effectiveDateTime?: string;
}

export interface FHIRGoal {
  resourceType: "Goal";
  id?: string;
  lifecycleStatus: "active" | "completed" | "cancelled";
  description: FHIRCodeableConcept;
  subject: FHIRReference;
  target?: FHIRGoalTarget[];
}

export interface FHIRGoalTarget {
  measure?: FHIRCodeableConcept;
  detailQuantity?: FHIRQuantity;
  dueDate?: string;
}

export interface FHIRCarePlan {
  resourceType: "CarePlan";
  id?: string;
  status: "active" | "completed" | "draft";
  intent: "plan";
  title?: string;
  subject: FHIRReference;
  goal?: FHIRReference[];
}

export interface FHIRQuestionnaireResponse {
  resourceType: "QuestionnaireResponse";
  id?: string;
  status: "completed" | "in-progress";
  subject?: FHIRReference;
  authored?: string;
  item: FHIRResponseItem[];
}

export interface FHIRResponseItem {
  linkId: string;
  text?: string;
  answer?: Array<{ valueInteger?: number; valueString?: string }>;
}

export interface FHIRCoverage {
  resourceType: "Coverage";
  id?: string;
  status: "active" | "cancelled";
  beneficiary: FHIRReference;
  payor: FHIRReference[];
}

export interface FHIRTask {
  resourceType: "Task";
  id?: string;
  status: "requested" | "in-progress" | "completed" | "cancelled";
  intent: "order";
  code?: FHIRCodeableConcept;
  for?: FHIRReference;
  authoredOn?: string;
}

// Primitives
export interface FHIRIdentifier {
  system?: string;
  value?: string;
}

export interface FHIRHumanName {
  use?: string;
  family?: string;
  given?: string[];
}

export interface FHIRCodeableConcept {
  coding?: FHIRCoding[];
  text?: string;
}

export interface FHIRCoding {
  system?: string;
  code?: string;
  display?: string;
}

export interface FHIRQuantity {
  value?: number;
  unit?: string;
  system?: string;
  code?: string;
}

export interface FHIRReference {
  reference?: string;
  display?: string;
}

export interface FHIRExtension {
  url: string;
  valueString?: string;
  valueBoolean?: boolean;
  valueCodeableConcept?: FHIRCodeableConcept;
}
