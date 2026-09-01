"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Handshake, LockKeyhole, Mail } from "lucide-react";
import { PublicPageShell } from "@/components/shared/public-page-shell";

type ContactForm = {
  name: string;
  organization: string;
  email: string;
  phone: string;
  inquiryType: "ehr" | "transplant-center" | "research" | "partnership" | "other";
  message: string;
  secret: string;
};

const initialForm: ContactForm = { name: "", organization: "", email: "", phone: "", inquiryType: "partnership", message: "", secret: "" };
const inputClass = "mt-2 block w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10";

export default function ContactPage() {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  function update(field: keyof ContactForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await response.json().catch(() => null);
    if (response.ok) setSubmitted(true);
    else setError(data?.error ?? "Unable to send your message.");
    setSubmitting(false);
  }

  return (
    <PublicPageShell>
      <div className="overflow-hidden bg-slate-50">
        <section className="relative border-b border-slate-200 bg-slate-950 px-6 py-16 text-white sm:py-24">
          <div className="absolute right-0 top-0 h-80 w-80 translate-x-1/3 -translate-y-1/3 rounded-full bg-teal-500/20 blur-3xl" aria-hidden="true" />
          <div className="relative mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-400/10 px-3 py-1.5 text-sm font-medium text-teal-200"><Handshake className="h-4 w-4" aria-hidden="true" /> Let&apos;s build a better donor journey</div>
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">Bring LivingLink to your organization.</h1>
              <p className="mt-6 text-lg leading-8 text-slate-300">Whether you represent an EHR, transplant center, research team, or mission-aligned partner, tell us what you&apos;re working on. We&apos;ll route your message to the right team.</p>
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-10 px-6 py-12 sm:py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <aside>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-teal-700">Connect with us</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">A thoughtful first conversation starts here.</h2>
            <div className="mt-8 space-y-5">
              {["Explore an EHR or FHIR integration", "Discuss a transplant-center pilot", "Partner on research or implementation", "Learn how LivingLink can support your community"].map((item) => <div key={item} className="flex gap-3 text-sm leading-6 text-slate-600"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" aria-hidden="true" />{item}</div>)}
            </div>
            <div className="mt-5 space-y-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
              <p className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0 text-teal-700" aria-hidden="true" /><span className="font-semibold text-slate-900">Primary email:</span>{" "}<a href="mailto:livingdonorlink@gmail.com" className="text-teal-800 hover:text-teal-600 hover:underline">livingdonorlink@gmail.com</a></p>
              <p className="flex items-center gap-2"><Mail className="h-4 w-4 shrink-0 text-teal-700" aria-hidden="true" /><span className="font-semibold text-slate-900">Secondary email:</span>{" "}<a href="mailto:rhorsley2@gmail.com" className="text-teal-800 hover:text-teal-600 hover:underline">rhorsley2@gmail.com</a></p>
            </div>
            <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><strong>Protect private information.</strong> Please do not include patient identifiers, credentials, access tokens, or protected health information.</div>
            <Link href="/ehr/register" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-teal-800 hover:text-teal-600">Ready to submit technical EHR details? Start registration <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
          </aside>

          {submitted ? <div className="rounded-3xl border border-teal-200 bg-white p-8 shadow-sm sm:p-10" role="status"><CheckCircle2 className="h-10 w-10 text-teal-600" aria-hidden="true" /><h2 className="mt-5 text-2xl font-bold text-slate-950">Message received.</h2><p className="mt-3 leading-7 text-slate-600">Thanks for reaching out. A member of the LivingLink team will review your note and follow up using the contact details you provided.</p><button type="button" onClick={() => { setSubmitted(false); setForm(initialForm); }} className="mt-8 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white hover:bg-teal-800">Send another message</button></div> : <form onSubmit={submit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10"><div className="mb-8"><h2 className="text-2xl font-bold text-slate-950">Tell us how we can help</h2><p className="mt-2 text-sm text-slate-500">We&apos;ll only use these details to respond to your inquiry.</p></div>{error && <p role="alert" className="mb-6 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error}</p>}<div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-700">Your name<input required maxLength={150} value={form.name} onChange={(e) => update("name", e.target.value)} className={inputClass} /></label><label className="text-sm font-semibold text-slate-700">Organization<input required maxLength={200} value={form.organization} onChange={(e) => update("organization", e.target.value)} className={inputClass} /></label><label className="text-sm font-semibold text-slate-700">Work email<input required type="email" maxLength={254} value={form.email} onChange={(e) => update("email", e.target.value)} className={inputClass} /></label><label className="text-sm font-semibold text-slate-700">Phone <span className="font-normal text-slate-400">(optional)</span><input type="tel" maxLength={30} value={form.phone} onChange={(e) => update("phone", e.target.value)} className={inputClass} /></label><label className="text-sm font-semibold text-slate-700 sm:col-span-2">I&apos;m reaching out about<select value={form.inquiryType} onChange={(e) => update("inquiryType", e.target.value)} className={inputClass}><option value="partnership">A partnership</option><option value="ehr">EHR integration</option><option value="transplant-center">A transplant-center pilot</option><option value="research">Research or evaluation</option><option value="other">Something else</option></select></label><label className="text-sm font-semibold text-slate-700 sm:col-span-2">Message<textarea required minLength={10} maxLength={2000} rows={6} placeholder="What would you like to explore together?" value={form.message} onChange={(e) => update("message", e.target.value)} className={inputClass} /></label></div><div className="hidden" aria-hidden="true"><label>Leave this field empty<input tabIndex={-1} autoComplete="off" value={form.secret} onChange={(e) => update("secret", e.target.value)} /></label></div><div className="mt-6 flex items-start gap-2 text-xs leading-5 text-slate-500"><LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" aria-hidden="true" />Your message is handled as an inquiry, not a clinical record. Never send PHI through this form.</div><button type="submit" disabled={submitting} className="mt-7 w-full rounded-xl bg-teal-700 px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60">{submitting ? "Sending message..." : "Send message"}</button></form>}
        </section>
      </div>
    </PublicPageShell>
  );
}
