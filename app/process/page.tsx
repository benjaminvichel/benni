"use client";
import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

const STEPS = [
  {
    num: "01",
    title: "Brief",
    description:
      'Everything starts with a conversation. I ask about your goals, your audience, what\'s working, what isn\'t, and what "done" looks like to you. No brief, no build.',
  },
  {
    num: "02",
    title: "Design",
    description:
      "Figma stays closed until we agree on structure and content. Once we do, every screen gets designed intentionally — nothing decorative, nothing random. You approve before we move on.",
  },
  {
    num: "03",
    title: "Development",
    description:
      "Next.js, React, TypeScript. Animations with GSAP. Fast, accessible, and yours to keep — clean code, Git-versioned, deployed to Vercel or wherever you host.",
  },
  {
    num: "04",
    title: "Launch",
    description:
      'We test across devices, fix what needs fixing, and ship. I stay available for 30 days after launch — no "good luck" and goodbye.',
  },
];

export default function ProcessPage() {
  useLayoutEffect(() => {
    gsap.registerPlugin(ScrollTrigger, SplitText);

    const preExisting = new Set(ScrollTrigger.getAll());
    let mounted = true;

    // ── 1. Intro fades as it scrolls off (synchronous, no pin) ──
    gsap.to("#proc-intro-inner", {
      autoAlpha: 0,
      y: -40,
      ease: "none",
      scrollTrigger: {
        trigger: "#proc-intro",
        start: "top top",
        end: "bottom top",
        scrub: 1,
      },
    });

    // ── 2 + 3: both pins created together after fonts load ───────
    // Creating them in the same tick guarantees correct DOM order
    // and ScrollTrigger positions.
    document.fonts.ready.then(() => {
      if (!mounted) return;

      // — Steps: pin + SplitText timeline —
      const headingEl = document.querySelector<Element>("#steps-heading");
      const stepEls   = Array.from(document.querySelectorAll<Element>(".step-card .split-el"));

      if (headingEl && stepEls.length) {
        const headingSplit = SplitText.create(headingEl, { type: "words,lines", mask: "lines" });
        const stepSplits   = stepEls.map((el) =>
          SplitText.create(el, { type: "words,lines", mask: "lines" })
        );
        const allStepLines = stepSplits.flatMap((s) => s.lines);

        gsap.set([...headingSplit.lines, ...allStepLines], { yPercent: 120 });

        const stepsTl = gsap.timeline({
          scrollTrigger: {
            trigger: "#steps-section",
            start: "top top",
            end: "+=180%",
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
          },
        });

        stepsTl
          .to(headingSplit.lines, {
            yPercent: 0,
            stagger: 0.06,
            duration: 1,
            ease: "power2.out",
          })
          .to(allStepLines, {
            yPercent: 0,
            stagger: 0.02,
            duration: 1,
            ease: "power2.out",
          }, "<0.15");
      }

      // — Honesty → CTA: pin + crossfade —
      gsap.set("#cta-layer", { autoAlpha: 0, y: 40 });

      const crossTl = gsap.timeline({
        scrollTrigger: {
          trigger: "#honesty-pin",
          start: "top top",
          end: "+=250%",
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
        },
      });

      crossTl
        .to("#honesty-layer", { autoAlpha: 0, y: -40, duration: 1, ease: "power2.in" })
        .to("#cta-layer",     { autoAlpha: 1, y: 0,   duration: 1, ease: "power2.out" }, "-=0.2");
    });

    return () => {
      mounted = false;
      ScrollTrigger.getAll()
        .filter((t) => !preExisting.has(t))
        .forEach((t) => t.kill());
    };
  }, []);

  return (
    <div style={{ background: "var(--background)" }}>

      {/* 1 ── Intro ─────────────────────────────────────────────── */}
      <section id="proc-intro" className="h-screen flex items-center px-14">
        <div id="proc-intro-inner" className="max-w-4xl">
          <h1
            className="font-bold leading-none tracking-tight text-black"
            style={{ fontSize: "clamp(56px, 9.5vw, 150px)" }}
          >
            The Process.
          </h1>
          <p
            className="font-bold leading-none tracking-tight text-black mt-3"
            style={{ fontSize: "clamp(36px, 6.5vw, 104px)" }}
          >
            how i work
          </p>
          <p
            className="text-neutral-700 mt-10 leading-relaxed"
            style={{ fontSize: "clamp(16px, 1.4vw, 22px)", maxWidth: "600px" }}
          >
            I&apos;m a designer and developer — which means I don&apos;t hand off a
            Figma file and disappear. I take your project from the first
            conversation to a live, polished website.
          </p>
        </div>
      </section>

      {/* 2 ── 4 steps (pinned) ──────────────────────────────────── */}
      <section
        id="steps-section"
        className="h-screen flex flex-col overflow-hidden"
      >
        {/* heading row */}
        <div className="px-14 pt-28 pb-10">
          <h2
            id="steps-heading"
            className="font-bold leading-none tracking-tight text-black"
            style={{ fontSize: "clamp(44px, 7.5vw, 110px)" }}
          >
            4 main steps.
          </h2>
        </div>

        {/* table rows */}
        <div className="flex flex-col flex-1 border-t border-neutral-200">

          {/* row 1 — white */}
          <div className="grid grid-cols-2 flex-1 border-b border-neutral-200" style={{ background: "var(--background)" }}>
            {STEPS.slice(0, 2).map((s, i) => (
              <div
                key={s.num}
                className="step-card flex flex-col justify-center px-14 py-8"
                style={{ borderLeft: i === 1 ? "1px solid #e5e5e5" : "none" }}
              >
                <span className="split-el block text-xs font-semibold tracking-[0.3em] uppercase text-neutral-300 mb-4">
                  {s.num}
                </span>
                <h3
                  className="split-el font-bold text-black leading-tight mb-4"
                  style={{ fontSize: "clamp(28px, 3.5vw, 52px)" }}
                >
                  {s.title}
                </h3>
                <p className="split-el text-neutral-500 leading-relaxed" style={{ fontSize: "clamp(14px, 1.2vw, 18px)", maxWidth: "38ch" }}>
                  {s.description}
                </p>
              </div>
            ))}
          </div>

          {/* row 2 — off-white */}
          <div className="grid grid-cols-2 flex-1" style={{ background: "#f7f6f3" }}>
            {STEPS.slice(2).map((s, i) => (
              <div
                key={s.num}
                className="step-card flex flex-col justify-center px-14 py-8"
                style={{ borderLeft: i === 1 ? "1px solid #e0deda" : "none" }}
              >
                <span className="split-el block text-xs font-semibold tracking-[0.3em] uppercase text-neutral-300 mb-4">
                  {s.num}
                </span>
                <h3
                  className="split-el font-bold text-black leading-tight mb-4"
                  style={{ fontSize: "clamp(28px, 3.5vw, 52px)" }}
                >
                  {s.title}
                </h3>
                <p className="split-el text-neutral-500 leading-relaxed" style={{ fontSize: "clamp(14px, 1.2vw, 18px)", maxWidth: "38ch" }}>
                  {s.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 3 ── Honesty → CTA (pinned crossfade) ─────────────────── */}
      <section id="honesty-pin" className="h-screen overflow-hidden relative">

        <div id="honesty-layer" className="absolute inset-0 flex items-center px-14">
          <div className="max-w-3xl">
            <span className="block text-xs font-semibold tracking-[0.3em] uppercase text-neutral-300 mb-8">
              One more thing
            </span>
            <p
              className="font-bold text-black leading-tight"
              style={{ fontSize: "clamp(28px, 4vw, 58px)" }}
            >
              A few things I don&apos;t do: guaranteed overnight results,
              mystery pricing revealed after 3 calls, or designs that look
              good in a presentation and fall apart in a browser.
            </p>
          </div>
        </div>

        <div id="cta-layer" className="absolute inset-0 flex items-center justify-center text-center px-14">
          <div className="max-w-4xl">
            <h2
              className="font-bold leading-none tracking-tight text-black"
              style={{ fontSize: "clamp(56px, 9.5vw, 140px)" }}
            >
              Let&apos;s build it.
            </h2>
            <p
              className="text-neutral-500 mt-6 leading-relaxed"
              style={{ fontSize: "clamp(16px, 1.4vw, 22px)", maxWidth: "520px" }}
            >
              Tell me about your project — one call is all it takes to figure
              out if we&apos;re a good fit.
            </p>
            <a
              href="/contact"
              className="inline-block mt-10 px-10 py-4 bg-black text-white font-semibold tracking-widest uppercase text-sm hover:bg-neutral-800 transition-colors"
            >
              Start a project →
            </a>
          </div>
        </div>

      </section>

    </div>
  );
}
