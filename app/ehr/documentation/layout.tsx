import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "EHR integration documentation",
  description: "Vendor-neutral LivingLink integration guide for FHIR R4, SMART App Launch, and CDS Hooks.",
};

export default function EHRDocumentationLayout({ children }: { children: React.ReactNode }) {
  return children;
}
