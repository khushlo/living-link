"use client";
import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Heart } from "lucide-react";

interface Message { role: "user" | "assistant"; content: string; }

// Lightweight markdown renderer for chat messages
function MarkdownMessage({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let listType: "ol" | "ul" | null = null;

  const flushList = () => {
    if (!listItems.length) return;
    if (listType === "ol") {
      elements.push(
        <ol key={elements.length} className="list-decimal list-outside ml-4 space-y-1 my-1">
          {listItems.map((item, i) => <li key={i}>{renderInline(item)}</li>)}
        </ol>
      );
    } else {
      elements.push(
        <ul key={elements.length} className="list-disc list-outside ml-4 space-y-1 my-1">
          {listItems.map((item, i) => <li key={i}>{renderInline(item)}</li>)}
        </ul>
      );
    }
    listItems = [];
    listType = null;
  };

  const renderInline = (text: string): React.ReactNode => {
    // Handle **bold**
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) =>
      part.startsWith("**") && part.endsWith("**")
        ? <strong key={i}>{part.slice(2, -2)}</strong>
        : part
    );
  };

  for (const line of lines) {
    const olMatch = line.match(/^\d+\.\s+(.*)/);
    const ulMatch = line.match(/^[-*]\s+(.*)/);

    if (olMatch) {
      if (listType === "ul") flushList();
      listType = "ol";
      listItems.push(olMatch[1]);
    } else if (ulMatch) {
      if (listType === "ol") flushList();
      listType = "ul";
      listItems.push(ulMatch[1]);
    } else {
      flushList();
      if (line.trim()) {
        elements.push(<p key={elements.length}>{renderInline(line)}</p>);
      }
    }
  }
  flushList();

  return <div className="space-y-1">{elements}</div>;
}


export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! I'm the LivingLink Assistant 👋 I'm here to help you navigate living kidney donation. What questions do you have today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg.content,
          history: messages.slice(-6), // last 6 messages for context
        }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "I'm having trouble responding right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open LivingLink AI Assistant"
        aria-expanded={open}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-600 transition-transform hover:scale-105"
        style={{ display: open ? "none" : "flex" }}
      >
        <MessageCircle className="h-6 w-6" aria-hidden="true" />
      </button>

      {/* Chat panel */}
      {open && (
        <div
          role="dialog" aria-modal="true" aria-label="LivingLink AI Assistant"
          className="fixed bottom-6 right-6 z-50 flex flex-col w-80 sm:w-96 h-[500px] rounded-2xl shadow-2xl bg-white border border-gray-200 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-blue-600 px-4 py-3">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-white" aria-hidden="true" fill="currentColor" />
              <span className="text-sm font-semibold text-white">LivingLink Assistant</span>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close assistant" className="text-white/80 hover:text-white">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" role="log" aria-live="polite" aria-label="Conversation">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  msg.role === "user" ? "bg-blue-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"
                }`}>
                  {msg.role === "assistant" ? <MarkdownMessage content={msg.content} /> : msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-3 py-2">
                  <span className="flex gap-1" aria-label="Assistant is typing">
                    {[0,1,2].map((i) => <span key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} aria-hidden="true" />)}
                  </span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggested questions */}
          {messages.length === 1 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {["What barriers can I overcome?", "What is NLDAC?", "How long is recovery?"].map((q) => (
                <button key={q} onClick={() => setInput(q)}
                  className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs text-blue-700 hover:bg-blue-100 transition-colors">
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <form onSubmit={send} className="flex items-center gap-2 border-t border-gray-200 px-3 py-3">
            <input
              ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..." maxLength={500} aria-label="Message"
              className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button type="submit" disabled={!input.trim() || loading} aria-label="Send message"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white disabled:opacity-40 hover:bg-blue-700">
              <Send className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
