import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register an EHR integration",
  description: "Submit an EHR tenant for LivingLink SMART on FHIR and CDS Hooks integration review.",
};

export default function EHRRegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
