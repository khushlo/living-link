"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { Share2, Download, X, Twitter, Heart, Instagram, Copy, Check } from "lucide-react";

const TEMPLATES = [
  {
    id: "awareness",
    label: "Awareness",
    headline: "100,000 people are\nwaiting for a kidney.",
    sub: "One living donor can change that.\nCould it be you?",
    gradient: ["#1e40af", "#7c3aed"],
    accent: "#60a5fa",
  },
  {
    id: "journey",
    label: "My Journey",
    headline: "I'm exploring\nliving kidney donation.",
    sub: "Join me. Learn more at LivingLink.",
    gradient: ["#065f46", "#0369a1"],
    accent: "#34d399",
  },
  {
    id: "facts",
    label: "Did You Know?",
    headline: "You can live a full,\nhealthy life with one kidney.",
    sub: "Living donors are everyday heroes.\nBe the reason someone gets more time.",
    gradient: ["#7c2d12", "#9a1d1d"],
    accent: "#fb923c",
  },
  {
    id: "callout",
    label: "Call to Action",
    headline: "Someone is waiting\nfor your gift of life.",
    sub: "Living kidney donation saves lives.\nFind out if you qualify today.",
    gradient: ["#1f2937", "#111827"],
    accent: "#f472b6",
  },
];

const SHARE_MESSAGES: Record<string, string> = {
  awareness: "100,000 people are waiting for a kidney. One living donor can change that. Learn more about living kidney donation at LivingLink. #KidneyDonation #LivingDonor #SaveALife",
  journey: "I'm exploring living kidney donation with @LivingLink. Join me in learning how one person can change everything. #LivingDonor #KidneyDonation",
  facts: "Did you know? You can live a full, healthy life with one kidney. Living donors are everyday heroes. Learn more. #KidneyDonation #LivingDonor",
  callout: "Someone is waiting for the gift of life. Could you be a living kidney donor? Find out today. #KidneyDonation #BeAHero #LivingDonor",
};

function drawCard(
  canvas: HTMLCanvasElement,
  template: (typeof TEMPLATES)[0],
  size = 1080
) {
  const ctx = canvas.getContext("2d")!;
  const s = size;
  canvas.width = s;
  canvas.height = s;

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, s, s);
  bg.addColorStop(0, template.gradient[0]);
  bg.addColorStop(1, template.gradient[1]);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, s, s);

  // Decorative circles
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.arc(s * 0.85, s * 0.15, s * 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(s * 0.1, s * 0.88, s * 0.28, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  // Accent bar
  ctx.fillStyle = template.accent;
  ctx.fillRect(s * 0.08, s * 0.12, s * 0.06, s * 0.003);

  // Heart icon (drawn manually)
  const hx = s * 0.08 + s * 0.03;
  const hy = s * 0.12 - s * 0.055;
  const hr = s * 0.025;
  ctx.fillStyle = template.accent;
  ctx.beginPath();
  ctx.moveTo(hx, hy + hr * 0.8);
  ctx.bezierCurveTo(hx, hy, hx - hr * 1.4, hy, hx - hr * 1.4, hy + hr);
  ctx.bezierCurveTo(hx - hr * 1.4, hy + hr * 2.2, hx, hy + hr * 2.8, hx, hy + hr * 2.8);
  ctx.bezierCurveTo(hx, hy + hr * 2.8, hx + hr * 1.4, hy + hr * 2.2, hx + hr * 1.4, hy + hr);
  ctx.bezierCurveTo(hx + hr * 1.4, hy, hx, hy, hx, hy + hr * 0.8);
  ctx.fill();

  // Brand name
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = `${s * 0.028}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
  ctx.fillText("LivingLink", s * 0.08 + s * 0.065, s * 0.12 - s * 0.008);

  // Headline
  ctx.fillStyle = "#ffffff";
  ctx.font = `bold ${s * 0.088}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
  const lines = template.headline.split("\n");
  lines.forEach((line, i) => {
    ctx.fillText(line, s * 0.08, s * 0.42 + i * s * 0.1);
  });

  // Subtext
  ctx.fillStyle = "rgba(255,255,255,0.82)";
  ctx.font = `${s * 0.038}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
  const subLines = template.sub.split("\n");
  subLines.forEach((line, i) => {
    ctx.fillText(line, s * 0.08, s * 0.66 + i * s * 0.052);
  });

  // Bottom CTA strip
  ctx.fillStyle = template.accent;
  ctx.globalAlpha = 0.15;
  ctx.fillRect(0, s * 0.84, s, s * 0.16);
  ctx.globalAlpha = 1;

  ctx.fillStyle = "#ffffff";
  ctx.font = `600 ${s * 0.032}px -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`;
  ctx.fillText("livinglink.app  |  #LivingDonor", s * 0.08, s * 0.93);

  // Accent line bottom
  ctx.fillStyle = template.accent;
  ctx.fillRect(0, s * 0.997, s, s * 0.003);
}

export function ShareAwarenessCard() {
  const [open, setOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);

  const renderCanvas = useCallback(
    (template: (typeof TEMPLATES)[0]) => {
      if (previewRef.current) drawCard(previewRef.current, template, 540);
    },
    []
  );

  useEffect(() => {
    if (open) renderCanvas(selectedTemplate);
  }, [open, selectedTemplate, renderCanvas]);

  function handleSelectTemplate(t: (typeof TEMPLATES)[0]) {
    setSelectedTemplate(t);
    renderCanvas(t);
  }

  function handleDownload() {
    const offscreen = document.createElement("canvas");
    drawCard(offscreen, selectedTemplate, 1080);
    const link = document.createElement("a");
    link.download = `livinglink-share-${selectedTemplate.id}.png`;
    link.href = offscreen.toDataURL("image/png");
    link.click();
  }

  async function handleShareX() {
    const caption = SHARE_MESSAGES[selectedTemplate.id];
    setSharing(true);
    try {
      // Download the card image first
      const offscreen = document.createElement("canvas");
      drawCard(offscreen, selectedTemplate, 1080);
      const link = document.createElement("a");
      link.download = `livinglink-${selectedTemplate.id}.png`;
      link.href = offscreen.toDataURL("image/png");
      link.click();

      // Then open X with the caption pre-filled
      setTimeout(() => {
        const msg = encodeURIComponent(caption + " #OrganDonation #LivingDonor");
        window.open(
          `https://twitter.com/intent/tweet?text=${msg}`,
          "_blank",
          "width=600,height=400"
        );
        setSharing(false);
      }, 500);
    } catch {
      setSharing(false);
    }
  }

  function handleCopyCaption() {
    navigator.clipboard.writeText(SHARE_MESSAGES[selectedTemplate.id]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="Share awareness post on social media"
      >
        <Share2 className="h-4 w-4" aria-hidden="true" />
        Share &amp; Spread Awareness
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Share awareness card"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4 shrink-0">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 fill-blue-600 text-blue-600" aria-hidden="true" />
                <h2 className="text-lg font-semibold text-gray-900">Share &amp; Spread Awareness</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Close"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>

            <div className="overflow-y-auto flex-1">
              <div className="p-6 space-y-6">
                {/* Preview canvas */}
                <div className="flex justify-center">
                  <canvas
                    ref={previewRef}
                    width={540}
                    height={540}
                    className="rounded-xl shadow-lg w-full max-w-sm aspect-square"
                    aria-label="Shareable awareness card preview"
                  />
                </div>

                {/* Template selector */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">Choose a template</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {TEMPLATES.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => handleSelectTemplate(t)}
                        className={`rounded-xl border-2 px-3 py-2 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          selectedTemplate.id === t.id
                            ? "border-blue-500 bg-blue-50 text-blue-700"
                            : "border-gray-200 bg-white text-gray-600 hover:border-blue-300"
                        }`}
                        aria-pressed={selectedTemplate.id === t.id}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Caption */}
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Caption</p>
                  <div className="relative rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 pr-12">
                    <p className="text-sm text-gray-600 leading-relaxed">{SHARE_MESSAGES[selectedTemplate.id]}</p>
                    <button
                      onClick={handleCopyCaption}
                      className="absolute right-3 top-3 rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                      aria-label="Copy caption"
                    >
                      {copied ? <Check className="h-4 w-4 text-green-600" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
                    </button>
                  </div>
                </div>

                {/* Share buttons */}
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">Share to</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* X / Twitter */}
                    <button
                      onClick={handleShareX}
                      disabled={sharing}
                      className="flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white hover:bg-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-700 disabled:opacity-60"
                    >
                      {sharing ? (
                        <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" aria-hidden="true" />
                      ) : (
                        <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                      )}
                      Post on X
                    </button>

                    {/* Instagram (download + instructions) */}
                    <button
                      onClick={handleDownload}
                      className="flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500"
                      style={{ background: "linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)" }}
                    >
                      <Instagram className="h-4 w-4" aria-hidden="true" />
                      Save for Instagram
                    </button>

                    {/* Download full res */}
                    <button
                      onClick={handleDownload}
                      className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <Download className="h-4 w-4" aria-hidden="true" />
                      Download 1080×1080
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 text-center">
                    "Post on X" downloads your card image and opens the X composer with the caption pre-filled - just attach the downloaded image before posting.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
