"use client";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Send, Heart } from "lucide-react";

interface QuickAction { label: string; message: string; }
interface ModuleConfig { module: string; accent: string; greeting: string; actions: QuickAction[]; }

const MODULE_CONFIG: Record<string, ModuleConfig> = {
  "ready-check": {
    module: "ready-check", accent: "bg-emerald-600",
    greeting: "Hi! I'm your ReadyCheck coach ðŸ’ª I can explain health metrics, help you understand BMI or eGFR, or talk through your goals.",
    actions: [
      { label: "What is eGFR?", message: "What is eGFR and why does it matter for donation?" },
      { label: "Healthy BMI?", message: "What BMI range is ideal for living kidney donation?" },
      { label: "Lower my BP?", message: "What lifestyle changes help lower blood pressure before donation?" },
      { label: "If I smoke?", message: "Do I need to quit smoking before I can donate a kidney?" },
    ],
  },
  "donor-shield": {
    module: "donor-shield", accent: "bg-blue-600",
    greeting: "Hi! I'm your DonorShield guide ðŸ›¡ï¸ I can help with NLDAC, tax credits, FMLA rights, or insurance issues.",
    actions: [
      { label: "NLDAC eligibility?", message: "Who qualifies for NLDAC lost-wage reimbursement?" },
      { label: "State tax credits", message: "Which states offer tax credits for living donors?" },
      { label: "FMLA rights", message: "What are my FMLA rights as a living kidney donor?" },
      { label: "Insurance denied?", message: "What can I do if my insurer is denying claims related to my donation?" },
    ],
  },
  "mentor-match": {
    module: "mentor-match", accent: "bg-violet-600",
    greeting: "Hi! I'm here to help you find the right mentor ðŸ¤ I can explain what peer mentors do, how messaging works, or what to ask.",
    actions: [
      { label: "What do mentors do?", message: "What kinds of support can a peer mentor provide?" },
      { label: "How matching works", message: "How does the mentor matching process work?" },
      { label: "Questions to ask", message: "What are good questions to ask a living donor mentor?" },
      { label: "Is it confidential?", message: "Are conversations with my mentor private?" },
    ],
  },
  "center-flow": {
    module: "center-flow", accent: "bg-orange-600",
    greeting: "Hello! I support your evaluation workflow ðŸ“‹ I can answer protocol questions, explain timeline stages, or summarize OPTN policies.",
    actions: [
      { label: "Eval timeline", message: "What is the typical evaluation timeline for a living donor?" },
      { label: "OPTN crossmatch", message: "Summarize the OPTN policy on crossmatch requirements for living donors." },
      { label: "Stalled eval?", message: "What are common reasons an evaluation stalls and how to address them?" },
      { label: "Docs required?", message: "What documentation is required before a living donor can proceed to surgery?" },
    ],
  },
  "life-after": {
    module: "life-after", accent: "bg-pink-600",
    greeting: "Hi! I'm your LifeAfter companion ðŸŒ± I can talk through post-donation health, care roles, or mental wellness.",
    actions: [
      { label: "Who manages care?", message: "After I donate, who is my primary doctor for kidney-related issues?" },
      { label: "Feeling sad?", message: "Is it normal to feel sadness or anxiety after donating a kidney?" },
      { label: "Long-term risks", message: "What are the long-term health risks of living kidney donation?" },
      { label: "Lifestyle changes", message: "What lifestyle changes should I make after donating a kidney?" },
    ],
  },
};

function detectModule(pathname: string): string {
  if (pathname.includes("ready-check")) return "ready-check";
  if (pathname.includes("donor-shield")) return "donor-shield";
  if (pathname.includes("mentor-match")) return "mentor-match";
  if (pathname.includes("center-flow")) return "center-flow";
  if (pathname.includes("life-after")) return "life-after";
  return "default";
}

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
    if (olMatch) { if (listType === "ul") flushList(); listType = "ol"; listItems.push(olMatch[1]); }
    else if (ulMatch) { if (listType === "ol") flushList(); listType = "ul"; listItems.push(ulMatch[1]); }
    else { flushList(); if (line.trim()) elements.push(<p key={elements.length}>{renderInline(line)}</p>); }
  }
  flushList();
  return <div className="space-y-1">{elements}</div>;
}

export function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionsUsed, setActionsUsed] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  const moduleKey = detectModule(pathname);
  const config = MODULE_CONFIG[moduleKey] ?? {
    module: "", accent: "bg-blue-600",
    greeting: "Hi! I'm the LivingLink Assistant ðŸ‘‹ I guide donors, patients, coordinators, and clinicians through the living kidney donation journey.",
    actions: [
      { label: "Am I eligible?", message: "How do I know if I'm a good candidate to be a living kidney donor?" },
      { label: "Donation process", message: "Can you give me an overview of the living kidney donation process?" },
      { label: "Financial help", message: "What financial support is available for living kidney donors?" },
      { label: "Find a mentor", message: "How can I connect with someone who has already donated a kidney?" },
    ],
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { if (open) inputRef.current?.focus(); }, [open]);
  useEffect(() => { setMessages([]); setActionsUsed(false); }, [moduleKey]);

  async function send(text?: string) {
    const userMessage = (text ?? input).trim();
    if (!userMessage || loading) return;
    setInput("");
    if (text) setActionsUsed(true);

    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          history: newMessages.slice(-10).slice(0, -1),
          module: config.module || undefined,
        }),
      });
      const data = await res.json();
      setMessages([...newMessages, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "I'm having trouble responding right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  }

  function handleFormSubmit(e: React.FormEvent) { e.preventDefault(); send(); }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Open LivingLink AI Assistant"
        aria-expanded={open}
        className={`fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-2 ${config.accent}`}
      >
        {open ? <X className="h-5 w-5" aria-hidden="true" /> : <MessageCircle className="h-6 w-6" aria-hidden="true" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          role="dialog" aria-modal="true" aria-label="LivingLink AI Assistant"
          className="fixed bottom-24 right-6 z-50 flex flex-col w-80 sm:w-96 rounded-2xl shadow-2xl bg-white border border-gray-200 overflow-hidden"
          style={{ maxHeight: "min(560px, 80vh)" }}
        >
          {/* Header */}
          <div className={`flex items-center justify-between ${config.accent} px-4 py-3`}>
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-white" aria-hidden="true" fill="currentColor" />
              <div>
                <p className="text-sm font-semibold text-white leading-tight">LivingLink Assistant</p>
                <p className="text-xs text-white/70 capitalize">
                  {moduleKey !== "default" ? moduleKey.replace("-", " ") + " mode" : "General help"}
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close assistant" className="text-white/80 hover:text-white">
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" role="log" aria-live="polite" aria-label="Conversation">
            {/* Greeting */}
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-3 py-2 max-w-[85%] text-sm text-gray-800 leading-relaxed">
                {config.greeting}
              </div>
            </div>

            {/* Quick actions */}
            {!actionsUsed && messages.length === 0 && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {config.actions.map((a) => (
                  <button key={a.label} onClick={() => send(a.message)}
                    className="rounded-full border border-gray-300 bg-white px-2.5 py-1 text-xs text-gray-700 hover:bg-gray-50 transition-colors">
                    {a.label}
                  </button>
                ))}
              </div>
            )}

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

          {/* Input */}
          <form onSubmit={handleFormSubmit} className="flex items-center gap-2 border-t border-gray-200 px-3 py-3">
            <input
              ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anythingâ€¦" maxLength={500} aria-label="Message"
              className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button type="submit" disabled={!input.trim() || loading} aria-label="Send message"
              className={`flex h-8 w-8 items-center justify-center rounded-full text-white disabled:opacity-40 ${config.accent}`}>
              <Send className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
