"use client";
import { useState, useRef } from "react";
import { FileText, Download, Printer, Info } from "lucide-react";

export default function FMLALetterPage() {
  const [form, setForm] = useState({
    donorName: "",
    employerName: "",
    supervisorName: "",
    hrName: "",
    surgeryDate: "",
    returnDate: "",
    transplantCenter: "",
    donorPhone: "",
  });
  const [generated, setGenerated] = useState(false);
  const letterRef = useRef<HTMLDivElement>(null);

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  const today = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  const surgeryFormatted = form.surgeryDate
    ? new Date(form.surgeryDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "[Surgery Date]";
  const returnFormatted = form.returnDate
    ? new Date(form.returnDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "[Return Date]";

  function handlePrint() {
    const letterEl = letterRef.current;
    if (!letterEl) return;
    const win = window.open("", "_blank", "width=800,height=900");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>FMLA Letter</title>
      <style>
        body { font-family: Georgia, 'Times New Roman', serif; color: #111; padding: 48px; line-height: 1.7; }
        ul { padding-left: 1.5rem; }
        li { margin-bottom: 4px; }
        strong { font-weight: bold; }
        .border-t { border-top: 1px solid #ccc; margin-top: 2rem; padding-top: 1rem; }
        .text-xs { font-size: 0.75rem; color: #555; }
        @media print { body { padding: 32px; } }
      </style>
    </head><body>${letterEl.innerHTML}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
  }

  const allFilled = form.donorName && form.employerName && form.surgeryDate && form.returnDate;

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">FMLA Employer Letter Generator</h1>
        <p className="mt-1 text-gray-600">
          Generate a professional letter to your employer explaining your FMLA rights as a living kidney donor.
          Print or download as PDF.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-xl bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
        <Info className="h-5 w-5 shrink-0 mt-0.5 text-blue-600" aria-hidden="true" />
        <span>
          Under the <strong>Family and Medical Leave Act (FMLA)</strong>, eligible employees at companies with 50+ employees
          are entitled to up to <strong>12 weeks of unpaid, job-protected leave</strong> for an organ donation surgery.
          Your job and health benefits must be maintained during your leave.
        </span>
      </div>

      {/* Form */}
      {!generated ? (
        <form
          onSubmit={(e) => { e.preventDefault(); setGenerated(true); }}
          className="rounded-xl border border-gray-200 p-6 space-y-5"
          aria-label="FMLA letter details"
        >
          <h2 className="text-base font-semibold text-gray-900">Your information</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { id: "donorName",        label: "Your full name *",            placeholder: "Jane Smith" },
              { id: "donorPhone",       label: "Your phone number",           placeholder: "(555) 000-0000" },
              { id: "employerName",     label: "Employer / company name *",   placeholder: "Acme Corporation" },
              { id: "supervisorName",   label: "Supervisor name",             placeholder: "John Doe" },
              { id: "hrName",           label: "HR contact name",             placeholder: "HR Department" },
              { id: "transplantCenter", label: "Transplant center name",      placeholder: "University Medical Center" },
            ].map((f) => (
              <div key={f.id}>
                <label htmlFor={f.id} className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                <input
                  id={f.id}
                  type="text"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  placeholder={f.placeholder}
                  value={(form as any)[f.id]}
                  onChange={(e) => set(f.id, e.target.value)}
                />
              </div>
            ))}
            <div>
              <label htmlFor="surgeryDate" className="block text-sm font-medium text-gray-700 mb-1">Expected surgery date *</label>
              <input id="surgeryDate" type="date" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={form.surgeryDate} onChange={(e) => set("surgeryDate", e.target.value)} />
            </div>
            <div>
              <label htmlFor="returnDate" className="block text-sm font-medium text-gray-700 mb-1">Expected return-to-work date *</label>
              <input id="returnDate" type="date" className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={form.returnDate} onChange={(e) => set("returnDate", e.target.value)} />
            </div>
          </div>

          <button
            type="submit"
            disabled={!allFilled}
            className="w-full rounded-md bg-yellow-500 py-2.5 text-sm font-semibold text-white hover:bg-yellow-600 disabled:opacity-40"
          >
            Generate my FMLA letter
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          {/* Action buttons */}
          <div className="flex gap-3 print:hidden">
            <button onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-600">
              <Printer className="h-4 w-4" aria-hidden="true" /> Print / Save as PDF
            </button>
            <button onClick={() => setGenerated(false)}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
              Edit details
            </button>
          </div>

          {/* Letter */}
          <div
            ref={letterRef}
            className="rounded-xl border border-gray-300 bg-white p-8 font-serif text-gray-900 leading-relaxed print:shadow-none print:border-0"
            style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
          >
            <p className="text-right text-sm mb-6">{today}</p>

            <div className="mb-6">
              <p>{form.hrName || "Human Resources Department"}</p>
              <p>{form.employerName || "[Employer Name]"}</p>
              {form.supervisorName && <p>cc: {form.supervisorName}</p>}
            </div>

            <p className="mb-4 font-bold">Re: FMLA Leave Request - Living Organ Donation Surgery</p>

            <p className="mb-4">Dear {form.hrName || "Human Resources"},</p>

            <p className="mb-4">
              I am writing to formally request a leave of absence under the <strong>Family and Medical Leave Act of 1993 (FMLA), 29 U.S.C. § 2601</strong>, for the purpose of undergoing a scheduled living kidney donation surgery.
            </p>

            <p className="mb-4">
              I, <strong>{form.donorName || "[Your Name]"}</strong>, am a current employee in good standing. I am requesting FMLA-protected medical leave beginning on or around <strong>{surgeryFormatted}</strong>, with an expected return to work on <strong>{returnFormatted}</strong>. This leave is necessary for pre-operative preparation, surgery, and post-operative recovery.
            </p>

            <p className="mb-4">
              Living organ donation constitutes a "serious health condition" under FMLA regulations (29 C.F.R. § 825.114). As a qualifying employee, I am entitled to up to 12 workweeks of unpaid, job-protected leave within a 12-month period. During this leave, I understand that:
            </p>

            <ul className="list-disc list-inside mb-4 space-y-1 text-sm">
              <li>My group health plan benefits will continue on the same terms as if I had not taken leave</li>
              <li>Upon return, I will be restored to my same or equivalent position</li>
              <li>My leave is protected under 29 C.F.R. Part 825</li>
            </ul>

            <p className="mb-4">
              {form.transplantCenter
                ? `This surgery is being coordinated through ${form.transplantCenter}. `
                : ""}
              I am able to provide medical certification from my transplant center confirming the medical necessity of this leave if required under 29 C.F.R. § 825.305.
            </p>

            <p className="mb-4">
              I am committed to making this transition as smooth as possible and will work with my supervisor to ensure proper coverage of my responsibilities during my absence. Please advise on any required FMLA forms (typically WH-380-E or equivalent).
            </p>

            <p className="mb-4">
              Thank you for your understanding and support. Please feel free to contact me at {form.donorPhone || "[your phone number]"} if you need any additional information.
            </p>

            <p className="mb-8">Sincerely,</p>

            <p className="font-bold">{form.donorName || "[Your Name]"}</p>
            {form.donorPhone && <p className="text-sm">{form.donorPhone}</p>}

            <div className="mt-8 pt-4 border-t border-gray-200 text-xs text-gray-500">
              <p><strong>References:</strong> Family and Medical Leave Act of 1993, 29 U.S.C. § 2601–2654; 29 C.F.R. Part 825.</p>
              <p className="mt-1">Generated by LivingLink DonorShield · For informational use only · Consult an employment attorney for legal advice.</p>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media print {
          nav, aside, header, footer, .print\\:hidden { display: none !important; }
          body { background: white; }
        }
      `}</style>
    </div>
  );
}
