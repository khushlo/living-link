"use client";

import { FormEvent, useEffect, useState } from "react";

type Profile = {
  firstName: string; lastName: string; email: string; phone: string; dateOfBirth: string;
  donationStatus: string; donationDate: string; donationType: string; recipientRelation: string; transplantCenterName: string;
};

const empty: Profile = { firstName: "", lastName: "", email: "", phone: "", dateOfBirth: "", donationStatus: "EXPLORING", donationDate: "", donationType: "", recipientRelation: "", transplantCenterName: "" };

export default function DonorProfilePage() {
  const [profile, setProfile] = useState(empty);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const update = (field: keyof Profile, value: string) => setProfile((current) => ({ ...current, [field]: value }));
  function updateDateOfBirth(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 8);
    const formatted = digits.length > 4 ? `${digits.slice(0, 2)}-${digits.slice(2, 4)}-${digits.slice(4)}` : digits.length > 2 ? `${digits.slice(0, 2)}-${digits.slice(2)}` : digits;
    update("dateOfBirth", formatted);
  }

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = window.setTimeout(() => controller.abort(), 10000);

    fetch("/api/donor/profile", { cache: "no-store", signal: controller.signal }).then(async (response) => {
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Unable to load your profile");
      if (active) setProfile(data);
    }).catch((reason) => {
      if (!active) return;
      setError(reason instanceof DOMException && reason.name === "AbortError"
        ? "Unable to load your profile."
        : reason instanceof Error ? reason.message : "Unable to load your profile");
    }).finally(() => {
      window.clearTimeout(timeout);
      if (active) setLoading(false);
    });

    return () => {
      active = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setMessage(""); setError("");
    const response = await fetch("/api/donor/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) });
    const data = await response.json().catch(() => null);
    if (response.ok) setMessage("Your donor profile was saved.");
    else setError(data?.error ?? "Unable to save your profile");
    setSaving(false);
  }

  if (loading) return <p className="text-sm text-gray-600">Loading your donor profile...</p>;
  return <div className="mx-auto max-w-3xl space-y-8">
    <div><h1 className="text-2xl font-bold text-gray-900">Donor profile</h1><p className="mt-2 text-gray-600">Keep this information current for authorized transplant-center workflows and EHR linking.</p></div>
    {message && <p role="status" className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-900">{message}</p>}
    {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">{error}</p>}
    <form onSubmit={save} className="space-y-6 rounded-xl border border-gray-200 bg-white p-6">
      <section aria-labelledby="identity-heading"><h2 id="identity-heading" className="text-lg font-semibold">Your information</h2><p className="mt-1 text-sm text-gray-600">Your email comes from your authenticated account.</p><div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">First name<input required value={profile.firstName} onChange={(e) => update("firstName", e.target.value)} maxLength={100} className="mt-1 block w-full rounded-md border p-2.5" /></label>
        <label className="text-sm font-medium">Last name<input required value={profile.lastName} onChange={(e) => update("lastName", e.target.value)} maxLength={100} className="mt-1 block w-full rounded-md border p-2.5" /></label>
        <label className="text-sm font-medium">Account email<input readOnly value={profile.email} className="mt-1 block w-full rounded-md border bg-gray-50 p-2.5 text-gray-600" /></label>
        <label className="text-sm font-medium">Phone (optional)<input type="tel" value={profile.phone} onChange={(e) => update("phone", e.target.value)} maxLength={30} className="mt-1 block w-full rounded-md border p-2.5" /></label>
        <label className="text-sm font-medium">Date of birth (optional)<input type="text" inputMode="numeric" autoComplete="bday" pattern="\d{2}-\d{2}-\d{4}" placeholder="MM-dd-YYYY" value={profile.dateOfBirth} onChange={(e) => updateDateOfBirth(e.target.value)} className="mt-1 block w-full rounded-md border p-2.5" aria-describedby="dob-help" /><span id="dob-help" className="mt-1 block text-xs font-normal text-gray-500">Enter numbers; hyphens are added automatically in MM-dd-YYYY format. Never enter an SSN.</span></label>
      </div></section>
      <section aria-labelledby="donation-heading"><h2 id="donation-heading" className="text-lg font-semibold">Donation information</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">Donation status<select required value={profile.donationStatus} onChange={(e) => update("donationStatus", e.target.value)} className="mt-1 block w-full rounded-md border bg-white p-2.5"><option value="EXPLORING">Exploring donation</option><option value="IN_EVALUATION">In evaluation</option><option value="APPROVED">Approved to donate</option><option value="DONATED">Already donated</option><option value="DECLINED">No longer pursuing donation</option></select></label>
        <label className="text-sm font-medium">Donation date{profile.donationStatus === "DONATED" ? "" : " (optional)"}<input type="date" required={profile.donationStatus === "DONATED"} value={profile.donationDate} onChange={(e) => update("donationDate", e.target.value)} className="mt-1 block w-full rounded-md border p-2.5" /></label>
        <label className="text-sm font-medium">Donation type (optional)<select value={profile.donationType} onChange={(e) => update("donationType", e.target.value)} className="mt-1 block w-full rounded-md border bg-white p-2.5"><option value="">Select type</option><option value="DIRECTED">Directed</option><option value="NON_DIRECTED">Non-directed</option><option value="PAIRED_EXCHANGE">Paired exchange</option><option value="UNKNOWN">Prefer not to say</option></select></label>
        <label className="text-sm font-medium">Recipient relationship (optional)<input value={profile.recipientRelation} onChange={(e) => update("recipientRelation", e.target.value)} maxLength={100} className="mt-1 block w-full rounded-md border p-2.5" /></label>
        <label className="text-sm font-medium sm:col-span-2">Transplant center name (optional)<input value={profile.transplantCenterName} onChange={(e) => update("transplantCenterName", e.target.value)} maxLength={200} className="mt-1 block w-full rounded-md border p-2.5" /></label>
      </div></section>
      <div className="border-t pt-4"><p className="text-xs text-gray-500">Do not enter your Social Security number, insurance member ID, or government identifier.</p><button type="submit" disabled={saving} className="mt-4 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">{saving ? "Saving..." : "Save donor profile"}</button></div>
    </form>
  </div>;
}
