"use client";
import { useState, useEffect, useRef, use } from "react";
import { Send, Loader2, ArrowLeft, ShieldCheck } from "lucide-react";
import Link from "next/link";

type Message = {
  id: string;
  content: string;
  sentAt: string;
  sender: { id: string; firstName: string | null; role: string };
};

type Thread = {
  id: string;
  messages: Message[];
  viewerId: string;
};

export default function ThreadPage({ params }: { params: Promise<{ matchId: string }> }) {
  const { matchId } = use(params);
  const [thread, setThread] = useState<Thread | null>(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function load() {
    try {
      const res = await fetch(`/api/mentor-match/thread/${matchId}`);
      if (res.ok) setThread(await res.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [matchId]);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread?.messages.length]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setSending(true);
    try {
      await fetch(`/api/mentor-match/thread/${matchId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      setContent("");
      await load();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="max-w-2xl flex flex-col" style={{ height: "calc(100vh - 8rem)" }}>
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-200 mb-4 shrink-0">
        <Link href="/mentor-match" className="text-gray-400 hover:text-gray-700" aria-label="Back to Mentor Match">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-base font-semibold text-gray-900">Mentor conversation</h1>
          <p className="text-xs text-gray-400">Match ID: {matchId.slice(0, 8)}…</p>
        </div>
        <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 rounded-full px-2 py-0.5">
          <ShieldCheck className="h-3 w-3" aria-hidden="true" /> HIPAA-secured
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1" role="log" aria-live="polite" aria-label="Message history">
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-gray-400 pt-4">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading messages…
          </div>
        ) : !thread ? (
          <p className="text-sm text-red-500">Thread not found. Check the match ID.</p>
        ) : thread.messages.length === 0 ? (
          <div className="text-center pt-8">
            <p className="text-sm text-gray-400">No messages yet. Say hello!</p>
          </div>
        ) : (
          thread.messages.map((msg) => {
            const isMe = msg.sender.id === thread.viewerId;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs sm:max-w-sm rounded-2xl px-4 py-2.5 text-sm ${
                    isMe
                      ? "bg-purple-600 text-white rounded-br-sm"
                      : "bg-gray-100 text-gray-900 rounded-bl-sm"
                  }`}
                >
                  <p className={`text-xs font-medium mb-1 ${isMe ? "text-purple-100" : "text-purple-700"}`}>
                    {isMe ? "You" : msg.sender.firstName ?? "Mentor"}
                  </p>
                  <p>{msg.content}</p>
                  <p className={`text-xs mt-1 ${isMe ? "text-purple-200" : "text-gray-400"}`}>
                    {new Date(msg.sentAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="flex gap-2 pt-4 border-t border-gray-200 shrink-0 mt-4">
        <label htmlFor="message-input" className="sr-only">Message</label>
        <input
          id="message-input"
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          disabled={sending}
        />
        <button
          type="submit"
          disabled={!content.trim() || sending}
          className="rounded-full bg-purple-600 p-2.5 text-white hover:bg-purple-700 disabled:opacity-50"
          aria-label="Send message"
        >
          {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </button>
      </form>
    </div>
  );
}
