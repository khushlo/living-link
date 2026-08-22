"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, CheckCircle, AlertCircle, ChevronRight, Users } from "lucide-react";
import Link from "next/link";

const LANGUAGES = ["English", "Spanish", "French", "Mandarin", "Cantonese", "Arabic", "Hindi", "Tagalog", "Vietnamese", "Korean", "Portuguese", "Other"];
const SPECIALTIES = [
  "Non-directed (altruistic) donation",
  "Paired/chain exchange",
  "Directed donation to family member",
  "Directed donation to friend",
  "Donation after previous hesitation",
  "Donation as a parent",
  "Returning to work quickly",
  "Laparoscopic (minimally invasive) surgery",
  "Managing financial impact",
  "Emotional recovery",
  "Single kidney living (long-term)",
];

const STEPS = ["Your story", "Availability", "Verify & submit"];

export default function BecomeMentorPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState({
    donationYear: "",
    donationType: "",
    bio: "",
    languages: [] as string[],
    specialties: [] as string[],
    maxMentees: "2",
    availableHours: "1-2",
    agreeTerms: false,
    agreeHipaa: false,
  });

  function toggle<T>(arr: T[], val: T): T[] {
    return arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val];
  }

  function set(field: string, value: unknown) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const step0Valid =
    form.donationYear.length === 4 &&
    form.donationType.length > 0 &&
    form.bio.length >= 50;

  const step1Valid =
    form.languages.length > 0 && form.specialties.length > 0;

  const step2Valid = form.agreeTerms && form.agreeHipaa;

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError("");
    try {
      const res = await fetch("/api/mentor-match/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setSubmitError(typeof data?.error === "string" ? data.error : "We could not submit your application. Please check your details and try again.");
        return;
      }
      setDone(true);
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Application submitted!</h2>
        <p className="text-gray-500 text-sm mb-6">
          Our team will review your profile within 2-3 business days. You'll receive an email once approved. Thank you for giving back.
        </p>
        <Link href="/mentor-match" className="inline-block rounded-md bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-700">
          Back to Mentor Match
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <Link href="/mentor-match" className="text-sm text-violet-600 hover:underline">&larr; Back to Mentor Match</Link>
        <h1 className="mt-2 text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Heart className="h-6 w-6 text-violet-600" fill="currentColor" aria-hidden="true" />
          Become a Peer Mentor
        </h1>
        <p className="mt-1 text-gray-600 text-sm">
          Share your lived experience to guide someone through their donation journey. Mentors are verified prior living donors.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {STEPS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
              i < step ? "bg-violet-600 text-white" : i === step ? "bg-violet-100 text-violet-700 border-2 border-violet-600" : "bg-gray-100 text-gray-400"
            }`}>
              {i < step ? <CheckCircle className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-sm hidden sm:block ${i === step ? "font-medium text-gray-900" : "text-gray-400"}`}>{label}</span>
            {i < STEPS.length - 1 && <ChevronRight className="h-4 w-4 text-gray-300 mx-1" />}
          </div>
        ))}
      </div>

      {/* Step 0 - Your story */}
      {step === 0 && (
        <div className="rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Tell us about your donation</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year you donated *</label>
              <input
                type="number" min="1990" max={new Date().getFullYear()}
                placeholder="e.g. 2021"
                value={form.donationYear}
                onChange={(e) => set("donationYear", e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Donation type *</label>
              <select
                value={form.donationType}
                onChange={(e) => set("donationType", e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white"
              >
                <option value="">Select...</option>
                <option>Non-directed (altruistic)</option>
                <option>Directed to family member</option>
                <option>Directed to friend</option>
                <option>Paired/chain exchange</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Your donor story * <span className="font-normal text-gray-400">(min 50 characters - this appears on your public profile)</span>
            </label>
            <textarea
              rows={5}
              placeholder="Share what led you to donate, what the experience was like, and what you wish you had known beforehand..."
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm resize-none"
            />
            <p className={`text-xs mt-1 ${form.bio.length < 50 ? "text-gray-400" : "text-emerald-600"}`}>
              {form.bio.length} / 50 min characters
            </p>
          </div>

          <button
            disabled={!step0Valid}
            onClick={() => setStep(1)}
            className="w-full rounded-md bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-40"
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 1 - Availability */}
      {step === 1 && (
        <div className="rounded-xl border border-gray-200 p-6 space-y-6">
          <h2 className="font-semibold text-gray-900">Languages & specialties</h2>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Languages you can mentor in *</p>
            <div className="flex flex-wrap gap-2">
              {LANGUAGES.map((lang) => (
                <button key={lang} type="button"
                  onClick={() => set("languages", toggle(form.languages, lang))}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    form.languages.includes(lang)
                      ? "bg-violet-600 text-white border-violet-600"
                      : "border-gray-300 text-gray-600 hover:border-violet-400"
                  }`}>
                  {lang}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Topics you can best help with * <span className="font-normal text-gray-400">(select all that apply)</span></p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SPECIALTIES.map((s) => (
                <label key={s} className="flex items-start gap-2 cursor-pointer group">
                  <input type="checkbox"
                    checked={form.specialties.includes(s)}
                    onChange={() => set("specialties", toggle(form.specialties, s))}
                    className="mt-0.5 accent-violet-600"
                  />
                  <span className="text-sm text-gray-700">{s}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max active mentees</label>
              <select value={form.maxMentees} onChange={(e) => set("maxMentees", e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white">
                {["1", "2", "3", "5"].map((v) => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hours/week available</label>
              <select value={form.availableHours} onChange={(e) => set("availableHours", e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white">
                {["<1", "1-2", "2-4", "4+"].map((v) => <option key={v}>{v}</option>)}
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(0)}
              className="flex-1 rounded-md border border-gray-300 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
              Back
            </button>
            <button disabled={!step1Valid} onClick={() => setStep(2)}
              className="flex-1 rounded-md bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-40">
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 2 - Verify & submit */}
      {step === 2 && (
        <div className="rounded-xl border border-gray-200 p-6 space-y-5">
          <h2 className="font-semibold text-gray-900">Review & agree</h2>

          {submitError && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{submitError}</span>
            </div>
          )}

          <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 flex gap-3 text-sm text-amber-800">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-amber-500" />
            <div>
              <strong>Verification required.</strong> After submitting, our team will verify your donation history
              (typically within 2-3 business days) before your profile goes live. You may be asked to provide
              a brief confirmation from your transplant center.
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={form.agreeTerms} onChange={(e) => set("agreeTerms", e.target.checked)}
                className="mt-0.5 accent-violet-600" />
              <span className="text-sm text-gray-700">
                I agree to the <strong>Mentor Code of Conduct</strong>: I will not provide medical advice, will maintain
                mentee confidentiality, and will notify LivingLink if I am no longer able to serve as a mentor.
              </span>
            </label>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={form.agreeHipaa} onChange={(e) => set("agreeHipaa", e.target.checked)}
                className="mt-0.5 accent-violet-600" />
              <span className="text-sm text-gray-700">
                I understand that all mentee communications on this platform are <strong>HIPAA-aware</strong> and
                I will not share any mentee personal health information outside of LivingLink.
              </span>
            </label>
          </div>

          {/* Summary */}
          <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 text-sm space-y-1 text-gray-700">
            <p><strong>Donated:</strong> {form.donationYear} - {form.donationType}</p>
            <p><strong>Languages:</strong> {form.languages.join(", ") || "None selected"}</p>
            <p><strong>Specialties:</strong> {form.specialties.length} selected</p>
            <p><strong>Capacity:</strong> up to {form.maxMentees} mentees, {form.availableHours} hrs/week</p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)}
              className="flex-1 rounded-md border border-gray-300 py-2.5 text-sm text-gray-700 hover:bg-gray-50">
              Back
            </button>
            <button disabled={!step2Valid || submitting} onClick={handleSubmit}
              className="flex-1 rounded-md bg-violet-600 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-40">
              {submitting ? "Submitting..." : "Submit application"}
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Users className="h-4 w-4" />
        <span>Joining 140+ verified peer mentors in the LivingLink network.</span>
      </div>
    </div>
  );
}
