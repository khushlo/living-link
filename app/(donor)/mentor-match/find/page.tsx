"use client";
import { useState, useEffect } from "react";
import { Users, MessageCircle, Star, Search, Loader2, CheckCircle } from "lucide-react";
import { BackToModule } from "@/components/shared/back-to-module";

type Mentor = {
  id: string;
  donationYear: number | null;
  isVerified: boolean;
  isAvailable: boolean;
  languages: string[];
  specialties: string[];
  bio: string | null;
  user: { firstName: string | null; preferredLang: string | null };
};

const SPECIALTY_LABELS: Record<string, string> = {
  laparoscopic: "Laparoscopic",
  open_surgery: "Open surgery",
  paired_exchange: "Paired exchange",
  altruistic: "Altruistic",
  parent_donor: "Parent donor",
  financial_concerns: "Financial concerns",
  recovery_support: "Recovery support",
};

export default function FindMentorPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [verification, setVerification] = useState("");
  const [requesting, setRequesting] = useState<string | null>(null);
  const [requested, setRequested] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (lang) params.set("lang", lang);
      if (specialty) params.set("specialty", specialty);
      if (verification) params.set("verification", verification);
      const res = await fetch(`/api/mentor-match/profiles?${params}`);
      const data = await res.json();
      setMentors(Array.isArray(data) ? data : []);
    } catch {
      setMentors([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [lang, specialty, verification]);

  async function requestMatch(mentorId: string) {
    setRequesting(mentorId);
    setError("");
    try {
      const res = await fetch("/api/mentor-match/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mentorId }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Failed to send request.");
      } else {
        setRequested((prev) => new Set(prev).add(mentorId));
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setRequesting(null);
    }
  }

  return (
    <div className="max-w-3xl space-y-8">
      <BackToModule href="/mentor-match" label="Back to Mentor Match" />
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find a Mentor</h1>
        <p className="mt-1 text-gray-600">Browse verified living donors who have volunteered to support people exploring donation.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1" htmlFor="lang-filter">Language</label>
          <select
            id="lang-filter"
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            value={lang}
            onChange={(e) => setLang(e.target.value)}
          >
            <option value="">Any</option>
            {[
              "English",
              "Spanish",
              "French",
              "Mandarin",
              "Cantonese",
              "Arabic",
              "Hindi",
              "Tagalog",
              "Vietnamese",
              "Korean",
              "Portuguese",
              "Other",
            ].map((languageOption) => (
              <option key={languageOption} value={languageOption}>{languageOption}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1" htmlFor="specialty-filter">Experience area</label>
          <select
            id="specialty-filter"
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            value={specialty}
            onChange={(e) => setSpecialty(e.target.value)}
          >
            <option value="">Any</option>
            {[
              "Non-directed (altruistic) donation",
              "Paired/chain exchange",
              "Donation as a parent",
              "Laparoscopic (minimally invasive) surgery",
              "Managing financial impact",
              "Emotional recovery",
            ].map((specialtyOption) => (
              <option key={specialtyOption} value={specialtyOption}>{specialtyOption}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1" htmlFor="verification-filter">Verification</label>
          <select
            id="verification-filter"
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm"
            value={verification}
            onChange={(e) => setVerification(e.target.value)}
          >
            <option value="">All donors</option>
            <option value="verified">Verified only</option>
            <option value="unverified">Not verified only</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">{error}</div>
      )}

      {/* Mentor list */}
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading mentors…
        </div>
      ) : mentors.length === 0 ? (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-10 text-center">
          <Users className="mx-auto h-10 w-10 text-gray-300 mb-3" aria-hidden="true" />
          <p className="text-gray-500 text-sm">No mentors found for those filters. Try broadening your search.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {mentors.map((mentor) => {
            const isRequested = requested.has(mentor.id);
            return (
              <div key={mentor.id} className="rounded-xl border border-gray-200 p-5 flex flex-col sm:flex-row gap-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center" aria-hidden="true">
                    <span className="text-purple-700 font-bold text-lg">
                      {mentor.user.firstName?.[0] ?? "M"}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">{mentor.user.firstName ?? "Anonymous"}</span>
                    {mentor.donationYear && (
                      <span className="text-xs text-gray-400">Donated {mentor.donationYear}</span>
                    )}
                    {mentor.isVerified ? (
                      <span className="flex items-center gap-0.5 text-xs text-yellow-600">
                        <Star className="h-3 w-3 fill-current" aria-hidden="true" /> Verified donor
                      </span>
                    ) : (
                      <span className="flex items-center gap-0.5 text-xs text-gray-500">
                        <CheckCircle className="h-3 w-3" aria-hidden="true" /> Verification pending
                      </span>
                    )}
                  </div>
                  {mentor.bio && <p className="text-sm text-gray-600 line-clamp-2">{mentor.bio}</p>}
                  <div className="flex flex-wrap gap-1.5">
                    {mentor.languages.map((l) => (
                      <span key={l} className="rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-xs text-blue-700">{l}</span>
                    ))}
                    {mentor.specialties.map((s) => (
                      <span key={s} className="rounded-full bg-purple-50 border border-purple-200 px-2 py-0.5 text-xs text-purple-700">
                        {SPECIALTY_LABELS[s] ?? s}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center shrink-0">
                  {isRequested ? (
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-green-50 border border-green-200 px-3 py-2 text-sm font-medium text-green-700">
                      <CheckCircle className="h-4 w-4" /> Request sent
                    </span>
                  ) : !mentor.isAvailable ? (
                    <span className="rounded-md bg-gray-100 border border-gray-200 px-3 py-2 text-sm font-medium text-gray-500">
                      Currently unavailable
                    </span>
                  ) : (
                    <button
                      onClick={() => requestMatch(mentor.id)}
                      disabled={requesting === mentor.id}
                      className="inline-flex items-center gap-2 rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-60"
                    >
                      {requesting === mentor.id ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
                      ) : (
                        <><MessageCircle className="h-4 w-4" /> Connect</>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-400">
        All mentors are verified living donors. Messages are private and HIPAA-compliant. Neither party shares PHI unless they choose to.
      </p>
    </div>
  );
}
