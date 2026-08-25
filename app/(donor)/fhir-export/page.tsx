"use client";

import { useState } from "react";

export default function PersonalFhirExportPage() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  async function download() {
    setLoading(true); setMessage("");
    try {
      const response = await fetch("/api/privacy/fhir-export");
      if (!response.ok) throw new Error("Unable to prepare your FHIR export.");
      const url = URL.createObjectURL(await response.blob()); const link = document.createElement("a"); link.href = url; link.download = "livinglink-personal-fhir.json"; link.click(); URL.revokeObjectURL(url);
      setMessage("Your personal FHIR export was downloaded.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Unable to prepare your FHIR export."); } finally { setLoading(false); }
  }
  return <div className="mx-auto max-w-3xl space-y-6"><div><h1 className="text-3xl font-bold text-gray-900">My FHIR export</h1><p className="mt-2 text-gray-600">Download a FHIR R4 bundle containing your own records. This request cannot access another donor or center.</p></div><div className="rounded-xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-900">This is a personal access export. It is not a bulk export and is not a claim of EHR, OPTN, HRSA, or de-identification compliance.</div><button type="button" onClick={download} disabled={loading} className="rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{loading ? "Preparing export..." : "Download my FHIR data"}</button>{message && <p role="status" className="text-sm text-gray-700">{message}</p>}</div>;
}
