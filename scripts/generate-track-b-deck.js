const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const pptxgen = require("pptxgenjs");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "submission");
const ARCH = path.join(OUT, "livinglink-architecture.png");
const DECK = path.join(OUT, "LivingLink-KidneyX-TrackB-Slides-5-to-8-v4.pptx");

const C = {
  navy: "123553",
  navy2: "0B2A44",
  cyan: "08AFCB",
  teal: "16877D",
  green: "209A4B",
  ink: "152B3C",
  muted: "526477",
  pale: "F4F8FB",
  paleBlue: "EAF4F8",
  paleTeal: "E8F6F3",
  paleGold: "FFF5DE",
  gold: "C88612",
  white: "FFFFFF",
  line: "CAD7E2",
};

async function generateArchitecture() {
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    *{box-sizing:border-box} body{margin:0;background:#f5f9fc;font-family:Arial,sans-serif;color:#152b3c}
    .canvas{width:1600px;height:820px;padding:30px 40px;background:#f5f9fc;position:relative;overflow:hidden}
    .title{font-size:34px;font-weight:800;color:#123553}.sub{font-size:18px;color:#526477;margin-top:5px}
    svg{position:absolute;left:15px;top:8px;width:1570px;height:800px}
    .node{fill:#fff;stroke:#8eb4c7;stroke-width:2}.stack{fill:#d9edf6;stroke:#08afcb;stroke-width:2}.dashboard{fill:#eef7fb;stroke:#123553;stroke-width:3}.module{fill:#fff;stroke:#08afcb;stroke-width:2}.service{fill:#fff;stroke:#16877d;stroke-width:2}.platform{fill:#edf7fa;stroke:#08afcb;stroke-width:3;stroke-dasharray:12 8}.label{font-size:20px;font-weight:800;fill:#152b3c}.small{font-size:15px;fill:#526477}.tiny{font-size:13px;fill:#526477}.dash{fill:none;stroke:#16877d;stroke-width:3;stroke-dasharray:5 5}.arrow{fill:none;stroke:#08afcb;stroke-width:4;marker-end:url(#arrow)}.caption{font-size:14px;font-weight:700;fill:#16877d}.layer{font-size:15px;font-weight:800;fill:#123553;letter-spacing:.5px}.white{fill:#fff}
  </style></head><body><div class="canvas">
    <svg viewBox="0 0 1520 680">
      <defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#08afcb"/></marker></defs>

      <text class="layer" x="80" y="58">PUBLIC ACCESS</text><rect class="stack" x="98" y="73" width="280" height="135"/><rect class="stack" x="84" y="87" width="280" height="135"/><rect class="node" x="70" y="101" width="280" height="135"/><text class="label" x="210" y="140" text-anchor="middle">No-login experiences</text><text class="small" x="210" y="171" text-anchor="middle">Eligibility • Ripple • Waitlist Map</text><text class="small" x="210" y="199" text-anchor="middle">Stories • Conversation Practice</text>

      <text class="layer" x="1215" y="58">EHR ENVIRONMENT</text><rect class="stack" x="1184" y="73" width="280" height="135"/><rect class="stack" x="1170" y="87" width="280" height="135"/><rect class="node" x="1156" y="101" width="280" height="135"/><text class="label" x="1296" y="140" text-anchor="middle">Clinical workflow</text><text class="small" x="1296" y="171" text-anchor="middle">SMART launch • patient context</text><text class="small" x="1296" y="199" text-anchor="middle">CDS Hooks alert cards</text>

      <rect class="dashboard" x="445" y="65" rx="10" width="630" height="330"/><rect x="445" y="65" width="630" height="48" fill="#123553"/><text x="760" y="97" text-anchor="middle" font-size="22" font-weight="800" fill="#fff">LIVINGLINK WEB APPLICATION</text>
      <rect class="module" x="475" y="135" rx="8" width="570" height="54"/><text class="label" x="760" y="169" text-anchor="middle">Public pages + role-based dashboards</text>
      <rect class="module" x="475" y="213" rx="8" width="170" height="62"/><text class="label" x="560" y="249" text-anchor="middle">ReadyCheck</text>
      <rect class="module" x="675" y="213" rx="8" width="170" height="62"/><text class="label" x="760" y="249" text-anchor="middle">DonorShield</text>
      <rect class="module" x="875" y="213" rx="8" width="170" height="62"/><text class="label" x="960" y="249" text-anchor="middle">MentorMatch</text>
      <rect class="module" x="575" y="297" rx="8" width="170" height="62"/><text class="label" x="660" y="333" text-anchor="middle">CenterFlow</text>
      <rect class="module" x="775" y="297" rx="8" width="170" height="62"/><text class="label" x="860" y="333" text-anchor="middle">LifeAfter</text>

      <path class="dash" d="M350 168 L445 168"/><text class="caption" x="397" y="154" text-anchor="middle">HTTPS</text><path class="dash" d="M1075 168 L1156 168"/><text class="caption" x="1115" y="154" text-anchor="middle">FHIR / OAuth</text>

      <rect class="platform" x="90" y="480" rx="15" width="1340" height="170"/><rect x="115" y="461" rx="14" width="250" height="38" fill="#08afcb"/><text x="240" y="486" text-anchor="middle" font-size="16" font-weight="800" fill="#fff">PLATFORM SERVICES</text>
      <rect class="service" x="125" y="520" rx="8" width="225" height="95"/><text class="label" x="237" y="552" text-anchor="middle">Next.js API Routes</text><text class="small" x="237" y="580" text-anchor="middle">Module CRUD + validation</text><text class="tiny" x="237" y="603" text-anchor="middle">/api/**</text>
      <rect class="service" x="385" y="520" rx="8" width="225" height="95"/><text class="label" x="497" y="552" text-anchor="middle">Clerk Identity</text><text class="small" x="497" y="580" text-anchor="middle">Sign-in • sessions • roles</text><text class="tiny" x="497" y="603" text-anchor="middle">Route access control</text>
      <rect class="service" x="645" y="520" rx="8" width="225" height="95"/><text class="label" x="757" y="552" text-anchor="middle">OpenAI GPT-4o</text><text class="small" x="757" y="580" text-anchor="middle">Role-play + assistant</text><text class="tiny" x="757" y="603" text-anchor="middle">Optional AI service</text>
      <rect class="service" x="905" y="520" rx="8" width="225" height="95"/><text class="label" x="1017" y="552" text-anchor="middle">Prisma + PostgreSQL</text><text class="small" x="1017" y="580" text-anchor="middle">Profiles • goals • workflows</text><text class="tiny" x="1017" y="603" text-anchor="middle">Persistent app data</text>
      <rect class="service" x="1165" y="520" rx="8" width="225" height="95"/><text class="label" x="1277" y="552" text-anchor="middle">FHIR / HAPI</text><text class="small" x="1277" y="580" text-anchor="middle">R4 mapping • SMART • CDS</text><text class="tiny" x="1277" y="603" text-anchor="middle">EHR integration prototype</text>

      <path class="dash" d="M760 395 L760 440 L237 440 L237 515"/><path class="dash" d="M760 440 L497 440 L497 515"/><path class="dash" d="M760 395 L760 515"/><path class="dash" d="M760 440 L1017 440 L1017 515"/><path class="dash" d="M760 440 L1277 440 L1277 515"/>
      <path class="dash" d="M210 236 L210 450 L237 450 L237 515"/><path class="dash" d="M1296 236 L1296 450 L1277 450 L1277 515"/>
      <rect x="505" y="654" rx="12" width="510" height="26" fill="#123553"/><text x="760" y="673" text-anchor="middle" font-size="14" font-weight="700" fill="#fff">Users → LivingLink dashboard → connected platform services</text>
    </svg>
  </div></body></html>`;

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 820, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: "networkidle0" });
  await page.screenshot({ path: ARCH, type: "png" });
  await browser.close();
}

function addHeader(slide, title, kicker) {
  slide.background = { color: C.white };
  slide.addShape("rect", { x: 0, y: 0, w: 13.333, h: 0.08, fill: { color: C.navy }, line: { color: C.navy } });
  slide.addShape("rect", { x: 12.35, y: 0, w: 0.983, h: 0.08, fill: { color: C.cyan }, line: { color: C.cyan } });
  slide.addText(kicker.toUpperCase(), { x: 0.55, y: 0.26, w: 4.3, h: 0.22, fontFace: "Arial", fontSize: 9, bold: true, color: C.teal, charSpacing: 1.3, margin: 0 });
  slide.addText(title, { x: 0.55, y: 0.51, w: 12.15, h: 0.46, fontFace: "Arial", fontSize: 24, bold: true, color: C.navy, margin: 0, breakLine: false, fit: "shrink" });
  slide.addText("LivingLink  |  KidneyX EMPOWER Track B", { x: 9.4, y: 7.17, w: 3.35, h: 0.17, fontFace: "Arial", fontSize: 7.5, color: "7B8A98", align: "right", margin: 0 });
}

function box(slide, x, y, w, h, title, fill = C.pale, accent = C.cyan) {
  slide.addShape("roundRect", { x, y, w, h, rectRadius: 0.08, fill: { color: fill }, line: { color: C.line, width: 0.7 }, radius: 0.08 });
  slide.addShape("rect", { x, y, w: 0.07, h, fill: { color: accent }, line: { color: accent } });
  slide.addText(title.toUpperCase(), { x: x + 0.18, y: y + 0.14, w: w - 0.35, h: 0.22, fontFace: "Arial", fontSize: 10, bold: true, color: accent === C.gold ? "9A6811" : C.navy, charSpacing: 0.7, margin: 0 });
}

function bullets(slide, items, x, y, w, h, size = 11.2, color = C.ink) {
  const runs = [];
  items.forEach((item, i) => {
    runs.push({ text: item, options: { bullet: { indent: size * 1.1 }, hanging: size * 0.35, breakLine: i < items.length - 1 } });
  });
  slide.addText(runs, { x, y, w, h, fontFace: "Arial", fontSize: size, color, margin: 0.03, paraSpaceAfterPt: 7, breakLine: false, valign: "top", fit: "shrink" });
}

function metric(slide, x, y, w, value, label) {
  slide.addShape("roundRect", { x, y, w, h: 0.78, fill: { color: C.navy }, line: { color: C.navy }, radius: 0.06 });
  slide.addText(value, { x: x + 0.08, y: y + 0.11, w: w - 0.16, h: 0.27, fontFace: "Arial", fontSize: 18, bold: true, color: C.white, align: "center", margin: 0 });
  slide.addText(label.toUpperCase(), { x: x + 0.08, y: y + 0.44, w: w - 0.16, h: 0.19, fontFace: "Arial", fontSize: 7.3, bold: true, color: "C7DCE7", align: "center", margin: 0, fit: "shrink" });
}

function addTrackDivider(pptx) {
  const s = pptx.addSlide();
  s.background = { color: C.white };
  s.addShape("rect", { x: 0, y: 0, w: 11.95, h: 0.08, fill: { color: C.navy }, line: { color: C.navy } });
  s.addShape("rect", { x: 11.95, y: 0, w: 1.383, h: 0.08, fill: { color: C.cyan }, line: { color: C.cyan } });
  s.addText("KIDNEY", { x: 0.9, y: 0.72, w: 4.55, h: 0.72, fontFace: "Arial", fontSize: 42, color: C.green, charSpacing: 2, margin: 0 });
  s.addText("X", { x: 5.42, y: 0.68, w: 0.72, h: 0.78, fontFace: "Arial", fontSize: 48, bold: true, color: C.cyan, margin: 0 });
  s.addText("EMPOWER CHALLENGE", { x: 0.92, y: 1.52, w: 5.55, h: 0.42, fontFace: "Arial", fontSize: 23, color: "5A5A5D", charSpacing: 1.7, margin: 0 });
  s.addShape("line", { x: 0.9, y: 2.22, w: 11.55, h: 0, line: { color: C.line, width: 1 } });
  s.addShape("roundRect", { x: 0.9, y: 2.82, w: 11.55, h: 2.58, fill: { color: C.pale }, line: { color: C.line, width: 0.8 }, radius: 0.07 });
  s.addShape("rect", { x: 0.9, y: 2.82, w: 0.1, h: 2.58, fill: { color: C.cyan }, line: { color: C.cyan } });
  s.addText("Track B: Scalable Prototypes", { x: 1.3, y: 3.48, w: 10.0, h: 0.55, fontFace: "Arial", fontSize: 31, bold: true, color: C.navy, align: "center", margin: 0 });
  s.addText("Solutions ready for pilot testing.", { x: 1.3, y: 4.22, w: 10.0, h: 0.34, fontFace: "Arial", fontSize: 18, color: C.teal, align: "center", margin: 0 });
  s.addText("LIVINGLINK", { x: 4.68, y: 5.85, w: 4.0, h: 0.29, fontFace: "Arial", fontSize: 15, bold: true, color: C.navy, align: "center", charSpacing: 2.5, margin: 0 });
  s.addText("Open-source support for the living kidney donor journey", { x: 3.44, y: 6.22, w: 6.45, h: 0.26, fontFace: "Arial", fontSize: 11.5, color: C.muted, align: "center", margin: 0 });
}

function addSlideProblem(pptx) {
  const s = pptx.addSlide();
  addHeader(s, "LivingLink", "Track B: Scalable Prototype");
  s.addText("Open-source support across the entire living kidney donor journey", { x: 0.56, y: 1.02, w: 8.7, h: 0.3, fontFace: "Arial", fontSize: 14, bold: true, color: C.teal, margin: 0 });
  s.addShape("roundRect", { x: 9.86, y: 0.98, w: 2.9, h: 0.42, fill: { color: C.paleGold }, line: { color: "E4BE6D" }, radius: 0.05 });
  s.addText("FUNCTIONAL BETA • PILOT READY", { x: 10.02, y: 1.11, w: 2.58, h: 0.13, fontFace: "Arial", fontSize: 8.3, bold: true, color: "80580A", align: "center", margin: 0 });

  box(s, 0.55, 1.55, 6.05, 2.22, "The Problem & Solution", C.paleBlue, C.cyan);
  s.addText("THE CORE PROBLEM", { x: 0.77, y: 1.99, w: 2.3, h: 0.2, fontFace: "Arial", fontSize: 10.2, bold: true, color: C.navy, margin: 0 });
  s.addText("Willing donors face disconnected information, financial uncertainty, isolation, evaluation delays, and weak long-term follow-up. Each handoff creates another opportunity to withdraw.", { x: 0.77, y: 2.23, w: 5.55, h: 0.58, fontFace: "Arial", fontSize: 11.2, color: C.ink, margin: 0, breakLine: false, fit: "shrink" });
  s.addText("OUR NOVEL APPROACH", { x: 0.77, y: 2.95, w: 2.3, h: 0.2, fontFace: "Arial", fontSize: 10.2, bold: true, color: C.navy, margin: 0 });
  s.addText("One donor-centered platform combines five modules: ReadyCheck, DonorShield, MentorMatch, CenterFlow, and LifeAfter. Five public tools remove the sign-up wall; role-based workflows connect donor and center tasks.", { x: 0.77, y: 3.18, w: 5.55, h: 0.45, fontFace: "Arial", fontSize: 10.7, color: C.ink, margin: 0, fit: "shrink" });

  box(s, 6.82, 1.55, 5.95, 2.22, "Our Team & Capability", C.paleTeal, C.teal);
  bullets(s, [
    "Project lead: Richard Horsley, submission lead and prototype owner.",
    "Repository capability: Next.js/TypeScript, Prisma/PostgreSQL, donor workflows, FHIR integrations, AI-assisted experiences, and cloud deployment.",
    "Pilot partners: two transplant centers to be recruited; no institutional pilot partner is represented as confirmed.",
    "Pilot support model: donor and coordinator onboarding, test-data setup, workflow training, and monthly outcome review."
  ], 7.03, 1.99, 5.47, 1.58, 10.1);

  s.addText("MEASURABLE VALUE • 12-MONTH PILOT TARGETS (NOT YET CLINICALLY VALIDATED)", { x: 0.57, y: 4.05, w: 8.7, h: 0.22, fontFace: "Arial", fontSize: 9.5, bold: true, color: C.navy, charSpacing: 0.5, margin: 0 });
  metric(s, 0.55, 4.39, 2.86, "26% → 75%", "NLDAC completion");
  metric(s, 3.57, 4.39, 2.86, "−20%", "Donor withdrawal");
  metric(s, 6.59, 4.39, 2.86, "−6 weeks", "Evaluation duration");
  metric(s, 9.61, 4.39, 3.16, "59% → 85%", "Two-year follow-up");

  box(s, 0.55, 5.43, 12.22, 1.23, "Why It Can Scale", C.pale, C.green);
  bullets(s, [
    "MIT-licensed code and a single web application reduce deployment complexity and vendor lock-in.",
    "Public education works without an account; authenticated workflows add role, center, consent, and patient-context boundaries.",
    "No specialized hardware. Proposed pilots validate workflow fit, user adoption, interoperability, and measurable outcomes."
  ], 0.79, 5.86, 11.65, 0.65, 10.2);
}

function addSlideEvidence(pptx) {
  const s = pptx.addSlide();
  addHeader(s, "Evidence of Efficacy & Prototype Showcase", "Functional Beta");

  box(s, 0.55, 1.2, 4.0, 5.55, "Evidence of Potential Efficacy", C.paleBlue, C.cyan);
  s.addText("EVIDENCE-BASED DESIGN", { x: 0.79, y: 1.67, w: 2.6, h: 0.2, fontFace: "Arial", fontSize: 10, bold: true, color: C.navy, margin: 0 });
  bullets(s, [
    "Peer education is backed by a submission-cited randomized trial reporting 23% higher donation intent among ambivalent candidates.",
    "DonorShield puts wage estimates and NLDAC guidance before clinical steps, addressing financial uncertainty early.",
    "CenterFlow flags evaluations after 14 days without progress; LifeAfter pairs scheduled check-ins with PHQ-2 escalation at scores ≥3.",
    "Four pilot outcomes are pre-specified: NLDAC completion, withdrawal, evaluation duration, and two-year follow-up."
  ], 0.77, 1.97, 3.53, 2.2, 10.2);
  s.addText("FUNCTIONAL BETA SURFACES", { x: 0.79, y: 4.35, w: 2.8, h: 0.2, fontFace: "Arial", fontSize: 10, bold: true, color: C.navy, margin: 0 });
  bullets(s, [
    "5 public experiences: eligibility pre-screen, ripple calculator, waitlist map, stories, AI conversation practice.",
    "5 authenticated modules plus donor, coordinator, clinician, patient, and administrator views.",
    "Prisma-backed APIs for goals, expenses, NLDAC, mentoring, evaluations, check-ins, consent, privacy, and alerts."
  ], 0.77, 4.65, 3.53, 1.55, 9.9);
  s.addShape("roundRect", { x: 0.79, y: 6.18, w: 3.53, h: 0.35, fill: { color: C.paleGold }, line: { color: "E6C477" }, radius: 0.04 });
  s.addText("No pilot outcome or clinical efficacy is claimed yet.", { x: 0.94, y: 6.29, w: 3.22, h: 0.12, fontFace: "Arial", fontSize: 8.3, bold: true, color: "80580A", align: "center", margin: 0 });

  box(s, 4.79, 1.2, 7.98, 1.05, "Technical Innovation & AI Use", C.paleTeal, C.teal);
  s.addText("FHIR R4 mappings, SMART launch with PKCE, CDS Hooks cards, and structured export are implemented as prototypes. Optional GPT-4o powers public conversation role-play and contextual assistance, while the core donor workflows remain available without AI.", { x: 5.02, y: 1.65, w: 7.5, h: 0.42, fontFace: "Arial", fontSize: 10.4, color: C.ink, margin: 0, fit: "shrink" });

  s.addText("SYSTEM ARCHITECTURE / UX PROTOTYPE", { x: 4.82, y: 2.46, w: 4.2, h: 0.2, fontFace: "Arial", fontSize: 10, bold: true, color: C.navy, charSpacing: 0.5, margin: 0 });
  s.addImage({ path: ARCH, x: 4.79, y: 2.72, w: 7.98, h: 4.03 });
}

function phase(s, x, y, w, label, months, text, color) {
  s.addShape("roundRect", { x, y, w, h: 1.02, fill: { color: C.white }, line: { color, width: 1.2 }, radius: 0.05 });
  s.addShape("roundRect", { x: x + 0.12, y: y + 0.11, w: 0.8, h: 0.24, fill: { color }, line: { color }, radius: 0.04 });
  s.addText(months, { x: x + 0.15, y: y + 0.17, w: 0.74, h: 0.09, fontFace: "Arial", fontSize: 7.2, bold: true, color: C.white, align: "center", margin: 0 });
  s.addText(label, { x: x + 1.02, y: y + 0.12, w: w - 1.15, h: 0.2, fontFace: "Arial", fontSize: 10.1, bold: true, color: C.navy, margin: 0 });
  s.addText(text, { x: x + 0.16, y: y + 0.44, w: w - 0.32, h: 0.42, fontFace: "Arial", fontSize: 8.7, color: C.muted, margin: 0, fit: "shrink" });
}

function addSlideImplementation(pptx) {
  const s = pptx.addSlide();
  addHeader(s, "Path to Pilot Implementation", "Pilot Readiness");

  box(s, 0.55, 1.2, 4.0, 2.23, "Technical Feasibility", C.paleBlue, C.cyan);
  bullets(s, [
    "Single Next.js 15 / TypeScript application with server route handlers.",
    "Prisma + PostgreSQL data layer; Clerk integration and role/center authorization helpers.",
    "Local HAPI FHIR R4 plus FHIR mapping, export, SMART, and CDS Hooks prototypes.",
    "Unit, integration, end-to-end, and accessibility test assets support iterative pilot preparation."
  ], 0.78, 1.67, 3.53, 1.48, 9.7);

  box(s, 0.55, 3.65, 4.0, 2.15, "Interoperability", C.paleTeal, C.teal);
  bullets(s, [
    "FHIR R4 resources: Patient, Observation, Goal, Coverage, Communication, Task, CarePlan, and QuestionnaireResponse.",
    "SMART launch opens the app from an EHR context; CDS Hooks can return readiness and stalled-evaluation cards.",
    "The same standards-based integration pattern can be configured for participating EHR environments during a pilot."
  ], 0.78, 4.11, 3.53, 1.46, 9.5);

  box(s, 4.79, 1.2, 7.98, 3.0, "Development Roadmap", C.pale, C.green);
  phase(s, 5.03, 1.66, 3.55, "Prepare", "M1–M2", "Deploy the pilot environment, finish mobile polish, and configure center roles and workflows.", C.navy);
  phase(s, 8.78, 1.66, 3.73, "Onboard", "M3–M4", "Train Center 1 staff, connect test data, and run donor and coordinator usability sessions.", C.cyan);
  phase(s, 5.03, 2.84, 3.55, "Pilot", "M5–M6", "Launch a limited pilot; monitor engagement, stalled evaluations, NLDAC steps, and follow-up completion.", C.teal);
  phase(s, 8.78, 2.84, 3.73, "Expand", "M7–M12", "Add Center 2, localize key journeys, publish results, and release the deployment playbook.", C.green);

  box(s, 4.79, 4.42, 7.98, 1.94, "Pilot Playbook", C.paleGold, C.gold);
  s.addText("1", { x: 5.08, y: 4.91, w: 0.42, h: 0.42, fontFace: "Arial", fontSize: 17, bold: true, color: C.white, align: "center", valign: "mid", margin: 0, fill: { color: C.navy } });
  s.addText("Configure", { x: 5.62, y: 4.87, w: 1.35, h: 0.22, fontFace: "Arial", fontSize: 10.5, bold: true, color: C.navy, margin: 0 });
  s.addText("Center, user roles, workflows, and outcome baseline.", { x: 5.62, y: 5.13, w: 2.0, h: 0.45, fontFace: "Arial", fontSize: 9.2, color: C.ink, margin: 0, fit: "shrink" });
  s.addText("2", { x: 7.73, y: 4.91, w: 0.42, h: 0.42, fontFace: "Arial", fontSize: 17, bold: true, color: C.white, align: "center", valign: "mid", margin: 0, fill: { color: C.cyan } });
  s.addText("Train", { x: 8.27, y: 4.87, w: 1.25, h: 0.22, fontFace: "Arial", fontSize: 10.5, bold: true, color: C.navy, margin: 0 });
  s.addText("Coordinator walkthrough, quick guide, and donor invitation flow.", { x: 8.27, y: 5.13, w: 2.0, h: 0.45, fontFace: "Arial", fontSize: 9.2, color: C.ink, margin: 0, fit: "shrink" });
  s.addText("3", { x: 10.37, y: 4.91, w: 0.42, h: 0.42, fontFace: "Arial", fontSize: 17, bold: true, color: C.white, align: "center", valign: "mid", margin: 0, fill: { color: C.green } });
  s.addText("Measure", { x: 10.91, y: 4.87, w: 1.25, h: 0.22, fontFace: "Arial", fontSize: 10.5, bold: true, color: C.navy, margin: 0 });
  s.addText("Track four pilot targets monthly and refine the workflow.", { x: 10.91, y: 5.13, w: 1.55, h: 0.45, fontFace: "Arial", fontSize: 9.2, color: C.ink, margin: 0, fit: "shrink" });
  s.addText("DEPLOYMENT MODEL", { x: 5.05, y: 5.82, w: 1.55, h: 0.2, fontFace: "Arial", fontSize: 9.6, bold: true, color: "95650C", margin: 0 });
  s.addText("Cloud-hosted web application • managed PostgreSQL • no specialized hardware • one center configuration at a time", { x: 6.55, y: 5.78, w: 5.92, h: 0.3, fontFace: "Arial", fontSize: 9.3, color: C.ink, margin: 0, fit: "shrink" });

  s.addShape("roundRect", { x: 0.55, y: 6.55, w: 12.22, h: 0.42, fill: { color: C.navy }, line: { color: C.navy }, radius: 0.05 });
  s.addText("12-MONTH GOAL: demonstrate repeatable deployment at two centers and measure donor and workflow outcomes.", { x: 0.82, y: 6.68, w: 11.68, h: 0.14, fontFace: "Arial", fontSize: 9.2, bold: true, color: C.white, align: "center", margin: 0 });
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  await generateArchitecture();

  const deck = new pptxgen();
  deck.layout = "LAYOUT_WIDE";
  deck.author = "LivingLink";
  deck.subject = "KidneyX EMPOWER Track B scalable prototype slides";
  deck.title = "LivingLink - KidneyX EMPOWER Track B";
  deck.company = "LivingLink";
  deck.lang = "en-US";
  deck.theme = {
    headFontFace: "Arial",
    bodyFontFace: "Arial",
    lang: "en-US",
  };
  addTrackDivider(deck);
  addSlideProblem(deck);
  addSlideEvidence(deck);
  addSlideImplementation(deck);
  await deck.writeFile({ fileName: DECK });
  console.log(DECK);
  console.log(ARCH);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
