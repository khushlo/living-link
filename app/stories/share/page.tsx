"use client";

import Link from "next/link";
import { useState } from "react";

export default function ShareStoryPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/stories/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form.entries())),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setError(data?.error ?? "Unable to submit your story.");
      return;
    }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900">Thank you for sharing</h1>
        <p className="mt-4 text-gray-600">Your story was submitted for review. It will not be published until it has been reviewed and you have given final approval.</p>
        <Link href="/stories" className="mt-8 inline-block text-blue-600 hover:underline">Back to stories</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/stories" className="text-sm text-blue-600 hover:underline">Back to stories</Link>
      <h1 className="mt-6 text-3xl font-bold text-gray-900">Share your donation story</h1>
      <p className="mt-3 text-gray-600">Stories are reviewed before publication and shown anonymously. Please do not include names, contact information, medical record numbers, or other identifying details.</p>
      <form onSubmit={submit} className="mt-8 space-y-5">
        <label className="block text-sm font-medium text-gray-700">Story<textarea name="body" required minLength={50} maxLength={5000} rows={8} className="mt-1 w-full rounded-lg border border-gray-300 p-3" /></label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="block text-sm font-medium text-gray-700">Donation type<select name="donationType" required className="mt-1 w-full rounded-lg border border-gray-300 p-3"><option value="directed">Directed</option><option value="non-directed">Non-directed</option><option value="paired-exchange">Paired exchange</option></select></label>
          <label className="block text-sm font-medium text-gray-700">Year of donation<input name="donationYear" type="number" min="1900" max={new Date().getFullYear()} required className="mt-1 w-full rounded-lg border border-gray-300 p-3" /></label>
        </div>
        <label className="flex items-start gap-2 text-sm text-gray-700"><input name="consent" type="checkbox" value="true" required className="mt-1" />I consent to LivingLink reviewing and potentially publishing this story anonymously.</label>
        {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700">Submit for review</button>
      </form>
    </main>
  );
}
