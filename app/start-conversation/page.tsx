"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { PublicPageShell } from "@/components/shared/public-page-shell";
import { MessageCircle, Send, RefreshCw, ChevronDown, Info, Heart } from "lucide-react";

type Scenario = {
  id: string;
  label: string;
  icon: string;
  description: string;
  starterMessage: string;
};

const SCENARIOS: Scenario[] = [
  {
    id: "spouse",
    label: "Telling your spouse or partner",
    icon: "💑",
    description: "Practice sharing your decision with a supportive but concerned partner.",
    starterMessage: "Hey, I need to tell you something. I've been thinking seriously about donating a kidney.",
  },
  {
    id: "boss",
    label: "Asking your boss for time off",
    icon: "👔",
    description: "Practice a professional conversation about FMLA leave for your surgery.",
    starterMessage: "Do you have a few minutes? I wanted to talk with you about something personal that will affect my schedule.",
  },
  {
    id: "parents",
    label: "Convincing a worried parent",
    icon: "👪",
    description: "Practice telling an overprotective parent about your decision.",
    starterMessage: "Mom/Dad, I need to talk to you about something important I've decided to do.",
  },
  {
    id: "friend",
    label: "Telling a close friend",
    icon: "🤝",
    description: "Practice sharing with a supportive friend who might have questions.",
    starterMessage: "Hey, I've got some big news. I'm going to donate one of my kidneys.",
  },
  {
    id: "doctor",
    label: "First conversation with your doctor",
    icon: "🩺",
    description: "Practice the initial discussion with your primary care physician.",
    starterMessage: "I wanted to talk with you today about something I've been considering for a while. I'm thinking about becoming a living kidney donor.",
  },
];

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function StartConversationPage() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function selectScenario(scenario: Scenario) {
    setSelectedScenario(scenario);
    setMessages([]);
    setStarted(false);
    setInput(scenario.starterMessage);
  }

  async function callAI(userMessage: string, history: Message[]) {
    const res = await fetch("/api/ai/conversation-practice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: userMessage,
        history: history.slice(-8),
        scenarioId: selectedScenario!.id,
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data.reply as string;
  }

  async function startConversation() {
    if (!selectedScenario || !input.trim()) return;
    const userMessage = input.trim();
    const newMessages: Message[] = [{ role: "user", content: userMessage }];
    setMessages(newMessages);
    setInput("");
    setStarted(true);
    setLoading(true);
    try {
      const reply = await callAI(userMessage, []);
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Sorry, something went wrong. Please try again." }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  async function sendMessage() {
    if (!selectedScenario || !input.trim() || loading) return;
    const userMessage = input.trim();
    const newMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    try {
      const reply = await callAI(userMessage, messages);
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "Sorry, something went wrong." }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      started ? sendMessage() : startConversation();
    }
  }

  function reset() {
    setMessages([]);
    setStarted(false);
    if (selectedScenario) setInput(selectedScenario.starterMessage);
  }

  return (
    <PublicPageShell>
      <div className="mx-auto max-w-3xl px-6 py-12 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Start the Conversation</h1>
          <p className="mt-1 text-gray-600">
            Talking about donation can be hard. Practice here - with an AI playing the person you need to talk to - before the real conversation.
          </p>
        </div>

        {/* Info banner */}
        <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 flex gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-blue-800">
            This is a safe space to rehearse. The AI plays a realistic character based on common reactions.
            What you say here is never saved. Try it as many times as you need. No account required.
          </p>
        </div>

        {/* Scenario selector */}
        <section aria-labelledby="scenario-heading">
          <h2 id="scenario-heading" className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
            Choose who you want to practice talking to
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => selectScenario(scenario)}
                className={`rounded-xl border-2 p-4 text-left transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  selectedScenario?.id === scenario.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
                }`}
                aria-pressed={selectedScenario?.id === scenario.id}
              >
                <div className="text-2xl mb-2" aria-hidden="true">{scenario.icon}</div>
                <p className="text-sm font-semibold text-gray-900">{scenario.label}</p>
                <p className="text-xs text-gray-500 mt-1">{scenario.description}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Chat area */}
        {selectedScenario && (
          <section aria-label="Conversation practice" className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
            {/* Chat header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="text-xl" aria-hidden="true">{selectedScenario.icon}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{selectedScenario.label}</p>
                  <p className="text-xs text-gray-500">AI is playing this role</p>
                </div>
              </div>
              {started && (
                <button
                  onClick={reset}
                  className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400 rounded"
                >
                  <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                  Start over
                </button>
              )}
            </div>

            {/* Messages */}
            <div
              className="min-h-64 max-h-96 overflow-y-auto p-5 space-y-4"
              role="log"
              aria-label="Conversation messages"
              aria-live="polite"
            >
              {!started && (
                <div className="text-center py-8">
                  <MessageCircle className="h-10 w-10 text-gray-200 mx-auto mb-3" aria-hidden="true" />
                  <p className="text-sm text-gray-500">
                    Your opening line is ready below. Hit Send to begin the practice conversation.
                  </p>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-gray-100 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl rounded-bl-none px-4 py-3">
                    <div className="flex gap-1.5 items-center" aria-label="Thinking...">
                      {[0, 150, 300].map((delay) => (
                        <span
                          key={delay}
                          className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
                          style={{ animationDelay: `${delay}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-100 p-4">
              <div className="flex gap-3 items-end">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  placeholder="Type your message... (Enter to send)"
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm resize-none focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  aria-label="Your message"
                />
                <button
                  onClick={started ? sendMessage : startConversation}
                  disabled={loading || !input.trim()}
                  className="flex-shrink-0 rounded-xl bg-blue-600 p-2.5 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label="Send message"
                >
                  <Send className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Tip: Take your time. Try addressing their concerns one by one.
              </p>
            </div>
          </section>
        )}

        {/* Tips */}
        <section className="rounded-xl border border-gray-200 p-5 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
            <Heart className="h-4 w-4 text-red-500 fill-red-500" aria-hidden="true" />
            Conversation tips that actually work
          </h2>
          <ul className="space-y-2 text-sm text-gray-600">
            {[
              "Start with how you feel, not just the facts: \"I've been thinking about this for months.\"",
              "Address safety first - most people's #1 fear is that you'll get hurt.",
              "Mention that the evaluation is free and you can stop at any time.",
              "Have the NLDAC number ready: 1-888-870-5002. Financial fears are real.",
              "Let them have their reaction. Don't rush to reassure. Listen first.",
              "If they need time, give it. This isn't a one-conversation decision for them either.",
            ].map((tip, i) => (
              <li key={i} className="flex gap-2.5">
                <span className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
                  {i + 1}
                </span>
                {tip}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </PublicPageShell>
  );
}
