"use client";
import { useState } from "react";

const FAQS = [
  {
    question: "How long does a project take?",
    answer:
      "Depends on scope. A focused landing page or portfolio can be done in 2–3 weeks. A full design + development project usually takes 4–8 weeks. Once I understand what you need, I'll give you a clear timeline before we start.",
  },
  {
    question: "Do you handle both design and development?",
    answer:
      "Yes — that's the whole point. I work from the first wireframe in Figma all the way to deployment. No handoff, no lost-in-translation between designer and developer. What gets designed is exactly what goes live.",
  },
  {
    question: "What's your tech stack?",
    answer:
      "Front-end: React, Next.js, TypeScript, GSAP. Back-end when needed: C#, .NET, MySQL. For design I use Figma. I'm comfortable across the full stack and pick the right tool for the job.",
  },
  {
    question: "Do you work with clients outside Brazil?",
    answer:
      "Yes. I work remotely and communicate in Portuguese, English or German — whatever works best for you. Time zones have never been a problem.",
  },
  {
    question: "How does payment work?",
    answer:
      "50% upfront and 50% on delivery. For longer projects we can split into milestones. I accept PIX for Brazilian clients and Wise or PayPal for international payments.",
  },
];

export default function FaqSection() {
  const [open, setOpen] = useState<number | null>(null);

  const toggle = (i: number) => setOpen(open === i ? null : i);

  return (
    <section
      className="relative py-32 px-24"
      style={{ background: "var(--background)", zIndex: 50, boxShadow: "0 -12px 40px rgba(0,0,0,0.06)" }}
    >
      <div className="max-w-4xl mx-auto">
        <span className="block text-xs tracking-[0.3em] uppercase text-neutral-400 mb-6">
          FAQ
        </span>
        <h2 className="text-6xl font-bold leading-tight mb-20">
          Frequently<br />asked.
        </h2>

        <div className="divide-y divide-neutral-200">
          {FAQS.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => toggle(i)}
                className="w-full flex items-center justify-between py-7 text-left group"
              >
                <span className="text-2xl font-semibold pr-8 group-hover:opacity-50 transition-opacity duration-200">
                  {faq.question}
                </span>
                <span
                  className="shrink-0 text-2xl font-light transition-transform duration-300 select-none"
                  style={{ transform: open === i ? "rotate(45deg)" : "rotate(0deg)" }}
                >
                  +
                </span>
              </button>

              <div
                className="overflow-hidden transition-all duration-500"
                style={{
                  maxHeight: open === i ? "300px" : "0px",
                  opacity: open === i ? 1 : 0,
                  transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                <p className="text-neutral-500 text-lg leading-relaxed pb-8 max-w-2xl">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
