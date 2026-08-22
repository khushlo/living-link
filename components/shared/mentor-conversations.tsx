"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MessageCircle } from "lucide-react";

type Conversation = {
  id: string;
  status: string;
  matchedAt: string;
  mentor: { firstName: string | null };
  thread: {
    id: string;
    messages: { content: string; sentAt: string; senderId: string }[];
    _count: { messages: number };
  } | null;
};

export function MentorConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [viewerId, setViewerId] = useState<string | null>(null);

  useEffect(() => {
    const load = () => fetch("/api/mentor-match/conversations")
      .then((res) => res.json())
      .then((data) => {
        setViewerId(typeof data?.viewerId === "string" ? data.viewerId : null);
        setConversations(Array.isArray(data?.conversations) ? data.conversations : []);
      })
      .catch(() => setConversations([]));

    load();
    const timer = window.setInterval(load, 15000);
    return () => window.clearInterval(timer);
  }, []);

  if (conversations.length === 0) return null;

  return (
    <section aria-labelledby="my-conversations-heading" className="rounded-xl border border-blue-200 bg-blue-50 p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageCircle className="h-5 w-5 text-blue-700" aria-hidden="true" />
        <h2 id="my-conversations-heading" className="font-semibold text-blue-900">My mentor conversations</h2>
      </div>
      <div className="space-y-3">
        {conversations.map((conversation) => {
          const latestMessage = conversation.thread?.messages[0];
          const unreadCount = conversation.thread?._count.messages ?? 0;
          return (
            <div key={conversation.id} className="flex flex-col items-stretch gap-3 rounded-lg border border-blue-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900">{conversation.mentor.firstName ?? "Your mentor"}</p>
                  {unreadCount > 0 && <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">{unreadCount} new</span>}
                </div>
                <p className="mt-1 truncate text-xs text-gray-500">
                  {latestMessage ? `${latestMessage.senderId === viewerId ? "You" : "Mentor"}: ${latestMessage.content}` : "Your request is ready for messaging."}
                </p>
              </div>
              <Link href={`/mentor-match/thread/${conversation.id}`} className="inline-flex items-center justify-center gap-1.5 rounded-md bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 sm:shrink-0">
                Open chat
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
