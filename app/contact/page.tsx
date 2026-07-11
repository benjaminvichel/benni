"use client";
import { useState } from "react";

const TIMELINE_OPTIONS = ["ASAP", "Within 1 month", "Within 2–3 months", "Not sure yet"];
const BUDGET_OPTIONS   = ["R$150–R$1.000", "R$1.000–R$2.500", "R$2.500–R$5.000", "Above R$5.000", "Custom value"];

export default function ContactPage() {
  const [form, setForm] = useState({
    honeypot: "",
    name: "",
    email: "",
    timeline: "",
    budget: "",
    message: "",
  });
  const [sent, setSent] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (form.honeypot) return;
    console.log(form);
    setSent(true);
  };

  return (
    <main className="min-h-screen flex flex-col items-center px-8 pt-44 pb-32" style={{ background: "var(--background)" }}>
      {/* Honeypot */}
      <div style={{ display: "none" }} aria-hidden="true">
        <input name="honeypot" tabIndex={-1} autoComplete="off" value={form.honeypot}
          onChange={(e) => setForm((p) => ({ ...p, honeypot: e.target.value }))} />
      </div>

      {/* Heading */}
      <h1
        className="font-bold leading-none tracking-tight text-black select-none text-center w-full"
        style={{ fontSize: "clamp(64px, 11vw, 180px)" }}
      >
        Contact.
      </h1>
      <p className="text-neutral-600 text-2xl text-center mt-6 mb-24 max-w-xl leading-relaxed">
        Tell me about your project and I&apos;ll get back to you soon.
      </p>

      {sent ? (
        <div className="text-center max-w-lg">
          <p className="text-5xl font-bold mb-6">Sent.</p>
          <p className="text-neutral-500 text-xl leading-relaxed">Thank you — I&apos;ll get back to you soon.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="w-full max-w-3xl space-y-16">

          {/* Name + Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            <Field label="Name">
              <input type="text" required placeholder="Your name"
                value={form.name} onChange={set("name")} className="fi" />
            </Field>
            <Field label="Email">
              <input type="email" required placeholder="hello@you.com"
                value={form.email} onChange={set("email")} className="fi" />
            </Field>
          </div>

          {/* Timeline */}
          <Field label="Timeline">
            <div className="flex flex-wrap gap-3 mt-4">
              {TIMELINE_OPTIONS.map((opt) => (
                <Pill key={opt} name="timeline" value={opt}
                  checked={form.timeline === opt}
                  onChange={() => setForm((p) => ({ ...p, timeline: opt }))} />
              ))}
            </div>
          </Field>

          {/* Budget */}
          <Field label="Budget">
            <div className="flex flex-wrap gap-3 mt-4">
              {BUDGET_OPTIONS.map((opt) => (
                <Pill key={opt} name="budget" value={opt}
                  checked={form.budget === opt}
                  onChange={() => setForm((p) => ({ ...p, budget: opt }))} />
              ))}
            </div>
          </Field>

          {/* Message */}
          <Field label="Message">
            <textarea required rows={6}
              placeholder="Hi Benjamin, I'd like to talk about..."
              value={form.message} onChange={set("message")}
              className="fi resize-none mt-2" />
          </Field>

          <div className="border-t border-neutral-200 pt-10">
            <button
              type="submit"
              className="w-full py-5 bg-black text-white text-base font-semibold tracking-widest uppercase hover:bg-neutral-800 transition-colors duration-200"
            >
              Send message →
            </button>
          </div>
        </form>
      )}

      <style>{`
        .fi {
          display: block;
          width: 100%;
          border: none;
          border-bottom: 1.5px solid #d4d4d4;
          outline: none;
          padding: 16px 0;
          font-size: 1.15rem;
          background: transparent;
          color: #000;
          transition: border-color 0.2s;
          font-family: inherit;
        }
        .fi::placeholder { color: #a3a3a3; }
        .fi:focus { border-bottom-color: #000; }
        textarea.fi {
          border: 1.5px solid #d4d4d4;
          border-radius: 4px;
          padding: 16px;
          background: #fafafa;
        }
        textarea.fi:focus { border-color: #000; background: #fff; }
      `}</style>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <span className="block text-xs font-semibold tracking-[0.25em] uppercase text-neutral-700 mb-1">
        {label}
      </span>
      {children}
    </div>
  );
}

function Pill({ name, value, checked, onChange }: {
  name: string; value: string; checked: boolean; onChange: () => void;
}) {
  return (
    <label className={`cursor-pointer px-5 py-3 text-base font-medium border transition-all duration-150 select-none ${
      checked
        ? "bg-black text-white border-black"
        : "bg-white text-neutral-800 border-neutral-300 hover:border-black hover:text-black"
    }`}>
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
      {value}
    </label>
  );
}
