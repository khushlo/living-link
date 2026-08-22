"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, MessageCircle } from "lucide-react";

type MentorRequest = {
  id: string;
  status: string;
  matchedAt: string;
  candidate: { firstName: string | null };
  thread: { id: string; _count: { messages: number } } | null;
};

export function MentorRequests() {
  const [requests, setRequests] = useState<MentorRequest[]>([]);

  useEffect(() => {
    fetch("/api/mentor-match/requests")
      .then((res) => res.json())
      .then((data) => setRequests(Array.isArray(data) ? data : []))
      .catch(() => setRequests([]));
  }, []);

  if (requests.length === 0) return null;

  return (
    <section aria-labelledby="mentor-requests-heading" className="rounded-xl border border-violet-200 bg-violet-50 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Bell className="h-5 w-5 text-violet-700" aria-hidden="true" />
        <h2 id="mentor-requests-heading" className="font-semibold text-violet-900">Mentor requests</h2>
      </div>
      <div className="space-y-3">
        {requests.map((request) => (
          <div key={request.id} className="flex flex-col items-stretch gap-3 rounded-lg border border-violet-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-gray-900">{request.candidate.firstName ?? "A donor"} would like to connect with you.</p>
                {(request.thread?._count.messages ?? 0) > 0 && (
                  <span className="rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-bold text-white">{request.thread?._count.messages} new</span>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {request.status === "pending" ? "Pending request" : request.status} · {new Date(request.matchedAt).toLocaleDateString()}
              </p>
            </div>
            {request.thread && (
              <Link href={`/mentor-match/thread/${request.id}`} className="inline-flex items-center justify-center gap-1.5 rounded-md bg-violet-600 px-3 py-2 text-xs font-medium text-white hover:bg-violet-700 sm:shrink-0">
                <MessageCircle className="h-4 w-4" aria-hidden="true" /> Open
              </Link>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
