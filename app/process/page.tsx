"use client";
import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

const TECHS = ["React", "Next.js", "TypeScript", "GSAP", "Tailwind", "Figma", "Supabase", "GitHub", "Vercel", "C#", ".NET", "MySQL"];
const MARQUEE_ITEMS = [...TECHS, ...TECHS, ...TECHS, ...TECHS];

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
  // ── Hero image spotlight reveal ──────────────────────────────
  const maskLayerRef = useRef<HTMLDivElement>(null);
  const maskState    = useRef({ radius: 0, x: 0, y: 0 });

  const updateMask = useCallback(() => {
    const el = maskLayerRef.current;
    if (!el) return;
    const { radius, x, y } = maskState.current;
    const v = `radial-gradient(circle ${radius}px at ${x}px ${y}px, black 0%, transparent 100%)`;
    el.style.maskImage = v;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (el.style as any).webkitMaskImage = v;
  }, []);

  const onHeroMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    maskState.current.x = e.clientX - rect.left;
    maskState.current.y = e.clientY - rect.top;
    updateMask();
  }, [updateMask]);

  const onHeroMouseEnter = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    maskState.current.x = e.clientX - rect.left;
    maskState.current.y = e.clientY - rect.top;
    gsap.killTweensOf(maskState.current);
    gsap.to(maskState.current, { radius: 500, duration: 0.7, ease: "power2.out", onUpdate: updateMask });
  }, [updateMask]);

  const onHeroMouseLeave = useCallback(() => {
    gsap.killTweensOf(maskState.current);
    gsap.to(maskState.current, { radius: 0, duration: 0.6, ease: "power2.in", onUpdate: updateMask });
  }, [updateMask]);

  useEffect(() => {
    try { gsap.registerPlugin(ScrollTrigger, SplitText); } catch { /* HMR/extension cleanup */ }

    let mounted = true;
    let rafId: number;
    const triggers: ScrollTrigger[] = [];
    const splits: ReturnType<typeof SplitText.create>[] = [];

    rafId = requestAnimationFrame(() => {
      if (!mounted) return;

      const isMobile = window.matchMedia("(max-width: 767px)").matches;

      // ── 1. Intro fades as it scrolls off ──
      triggers.push(
        ScrollTrigger.create({
          trigger: "#proc-intro",
          start: "top top",
          end: "bottom top",
          scrub: 1,
          animation: gsap.to("#proc-intro-inner", { autoAlpha: 0, y: -40, ease: "none" }),
        })
      );

      // ── 2 + 3: pins after fonts load ──────────────────────────────
      document.fonts.ready.then(() => {
        if (!mounted) return;

        // — Steps —
        const headingEl = document.querySelector<Element>("#steps-heading");
        const stepEls   = Array.from(document.querySelectorAll<Element>(".step-card .split-el"));

        if (headingEl && stepEls.length) {
          const headingSplit = SplitText.create(headingEl, { type: "words,lines", mask: "lines" });
          splits.push(headingSplit);
          const stepSplits = stepEls.map((el) => {
            const s = SplitText.create(el, { type: "words,lines", mask: "lines" });
            splits.push(s);
            return s;
          });
          const allStepLines = stepSplits.flatMap((s) => s.lines);
          gsap.set([...headingSplit.lines, ...allStepLines], { yPercent: 120 });

          const stepsTl = gsap.timeline();
          stepsTl
            .to(headingSplit.lines, { yPercent: 0, stagger: 0.06, duration: 1, ease: "power2.out" })
            .to(allStepLines,       { yPercent: 0, stagger: 0.02, duration: 1, ease: "power2.out" }, "<0.15");

          triggers.push(
            ScrollTrigger.create({
              trigger: "#steps-section",
              start: isMobile ? "top 85%" : "top top",
              end: isMobile ? "+=60%" : "+=180%",
              pin: !isMobile,
              scrub: 0.8,
              anticipatePin: isMobile ? 0 : 1,
              animation: stepsTl,
            })
          );
        }

        // — Honesty —
        const crossTl = gsap.timeline();
        if (isMobile) {
          crossTl
            .fromTo("#honesty-layer", { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "power2.out" })
            .to({}, { duration: 1.2 })
            .to("#honesty-layer", { autoAlpha: 0, y: -40, duration: 0.4, ease: "power2.in" });
        } else {
          crossTl.to("#honesty-layer", { autoAlpha: 0, y: -40, duration: 1, ease: "power2.in" });
        }

        triggers.push(
          ScrollTrigger.create({
            trigger: "#honesty-pin",
            start: isMobile ? "top 75%" : "top top",
            end: isMobile ? "+=120%" : "+=150%",
            scrub: 0.8,
            pin: !isMobile,
            anticipatePin: isMobile ? 0 : 1,
            animation: crossTl,
          })
        );

        ScrollTrigger.refresh();
      });
    });

    return () => {
      mounted = false;
      cancelAnimationFrame(rafId);
      triggers.forEach((t) => t.kill());
      splits.forEach((s) => s.revert());
      gsap.set("#proc-intro-inner, #honesty-layer", { clearProps: "all" });
    };
  }, []);

  return (
    <div style={{ background: "var(--background)" }}>

      {/* 1 ── Intro ─────────────────────────────────────────────── */}
      <section
        id="proc-intro"
        className="h-screen flex items-center px-6 md:px-14 relative overflow-hidden"
        onMouseMove={onHeroMouseMove}
        onMouseEnter={onHeroMouseEnter}
        onMouseLeave={onHeroMouseLeave}
      >
        {/* image revealed on hover via spotlight mask */}
        <div
          ref={maskLayerRef}
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            maskImage: "radial-gradient(circle 0px at 0px 0px, black 0%, transparent 100%)",
          }}
        >
          <img
            src="/me/process/code_room.jpeg"
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>

        {/* tech marquee */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 1,
          borderTop: "1px solid rgba(0,0,0,0.07)", overflow: "hidden",
        }}>
          <div style={{ display: "flex", width: "max-content", animation: "marquee 28s linear infinite" }}>
            {MARQUEE_ITEMS.map((t, i) => (
              <span key={i} style={{
                fontFamily: "var(--font-bebas)",
                fontSize: "clamp(20px, 2vw, 36px)",
                letterSpacing: "0.12em",
                color: "#555",
                padding: "1.1rem 0",
                whiteSpace: "nowrap",
              }}>
                {t}
                <span style={{ margin: "0 1.8rem", opacity: 0.4 }}>·</span>
              </span>
            ))}
          </div>
        </div>

        <div id="proc-intro-inner" className="max-w-4xl" style={{ position: "relative", zIndex: 1 }}>
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
            style={{ fontSize: "clamp(17px, 1.6vw, 28px)", maxWidth: "600px" }}
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
        className="md:h-screen flex flex-col overflow-hidden"
      >
        {/* heading row */}
        <div className="px-6 md:px-14 pt-14 pb-6">
          <h2
            id="steps-heading"
            className="font-bold leading-none tracking-tight text-black"
            style={{ fontSize: "clamp(44px, 7.5vw, 130px)" }}
          >
            4 main steps.
          </h2>
        </div>

        {/* table rows */}
        <div className="flex flex-col flex-1 border-t border-neutral-200">

          {/* row 1 — white */}
          <div className="grid grid-cols-1 md:grid-cols-2 flex-1 border-b border-neutral-200" style={{ background: "var(--background)" }}>
            {STEPS.slice(0, 2).map((s, i) => (
              <div
                key={s.num}
                className={`step-card flex flex-col justify-start px-6 md:px-14 pt-7 pb-4${i === 1 ? " step-divider" : ""}`}
              >
                <span className="split-el block text-xs font-semibold tracking-[0.3em] uppercase text-neutral-300 mb-4">
                  {s.num}
                </span>
                <h3
                  className="split-el font-bold text-black leading-tight mb-4"
                  style={{ fontSize: "clamp(28px, 4vw, 64px)" }}
                >
                  {s.title}
                </h3>
                <p className="split-el text-neutral-500 leading-relaxed" style={{ fontSize: "clamp(16px, 1.5vw, 24px)", maxWidth: "38ch" }}>
                  {s.description}
                </p>
              </div>
            ))}
          </div>

          {/* row 2 — off-white */}
          <div className="grid grid-cols-1 md:grid-cols-2 flex-1" style={{ background: "#f7f6f3" }}>
            {STEPS.slice(2).map((s, i) => (
              <div
                key={s.num}
                className={`step-card flex flex-col justify-start px-6 md:px-14 pt-7 pb-4${i === 1 ? " step-divider-warm" : ""}`}
              >
                <span className="split-el block text-xs font-semibold tracking-[0.3em] uppercase text-neutral-300 mb-4">
                  {s.num}
                </span>
                <h3
                  className="split-el font-bold text-black leading-tight mb-4"
                  style={{ fontSize: "clamp(28px, 4vw, 64px)" }}
                >
                  {s.title}
                </h3>
                <p className="split-el text-neutral-500 leading-relaxed" style={{ fontSize: "clamp(16px, 1.5vw, 24px)", maxWidth: "38ch" }}>
                  {s.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 3 ── Honesty (pinned, fades out) ──────────────────────── */}
      <section id="honesty-pin" className="h-screen overflow-hidden relative">
        <div id="honesty-layer" className="absolute inset-0 flex items-center px-6 md:px-14">
          <div className="max-w-3xl">
            <span className="block text-xs font-semibold tracking-[0.3em] uppercase text-neutral-300 mb-8">
              One more thing
            </span>
            <p
              className="font-bold text-black leading-tight"
              style={{ fontSize: "clamp(30px, 4.5vw, 72px)" }}
            >
              A few things I don&apos;t do: guaranteed overnight results,
              mystery pricing revealed after 3 calls, or designs that look
              good in a presentation and fall apart in a browser.
            </p>
          </div>
        </div>
      </section>

      {/* 4 ── Two ways to work together ─────────────────────────── */}
      <section
        className="px-6 md:px-14 py-20 md:py-32"
        style={{ background: "var(--background)", zIndex: 50, position: "relative", borderTop: "1px solid #e5e5e5" }}
      >
        <div className="max-w-7xl mx-auto">
          <span className="block text-xs font-semibold tracking-[0.3em] uppercase text-neutral-300 mb-8">
            Ways to work
          </span>
          <h2
            className="font-bold leading-none tracking-tight text-black mb-16 md:mb-24"
            style={{ fontSize: "clamp(44px, 6.5vw, 110px)" }}
          >
            Two ways to work together.
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0" style={{ borderTop: "1px solid #e5e5e5" }}>
            {/* 01 — Website */}
            <div className="ways-divider pt-10 pb-10 md:pr-20 md:pt-14 md:pb-14">
              <span
                className="block font-bold leading-none tracking-tight select-none mb-8"
                style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(72px, 10vw, 140px)", color: "#e8e7e4" }}
              >
                01
              </span>
              <h3
                className="font-bold text-black leading-tight mb-6"
                style={{ fontSize: "clamp(28px, 3.5vw, 56px)" }}
              >
                Website
              </h3>
              <p
                className="text-neutral-500 leading-relaxed"
                style={{ fontSize: "clamp(16px, 1.5vw, 24px)", maxWidth: "40ch" }}
              >
                You need a presence online. Something clean, fast, and
                intentional — a landing page, a portfolio, a brand site, or a
                multi-page experience. I take it from concept to live.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "2rem" }}>
                {["Landing page", "Portfolio", "Brand site", "Multi-page"].map((tag) => (
                  <span key={tag} style={{
                    fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.14em",
                    textTransform: "uppercase", padding: "0.5rem 1.1rem",
                    border: "1px solid #d4d3d0", color: "#888",
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* 02 — Full System */}
            <div className="pt-10 md:pl-20 md:pt-14 pb-14">
              <span
                className="block font-bold leading-none tracking-tight select-none mb-8"
                style={{ fontFamily: "var(--font-bebas)", fontSize: "clamp(72px, 10vw, 140px)", color: "#e8e7e4" }}
              >
                02
              </span>
              <h3
                className="font-bold text-black leading-tight mb-6"
                style={{ fontSize: "clamp(28px, 3.5vw, 56px)" }}
              >
                Full System
              </h3>
              <p
                className="text-neutral-500 leading-relaxed"
                style={{ fontSize: "clamp(16px, 1.5vw, 24px)", maxWidth: "40ch" }}
              >
                You need something that does more. User authentication,
                third-party integrations, custom dashboards, complex business
                logic. I build the whole thing — front to back.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "2rem" }}>
                {["Authentication", "API integrations", "Dashboards", "Business logic"].map((tag) => (
                  <span key={tag} style={{
                    fontSize: "0.78rem", fontWeight: 600, letterSpacing: "0.14em",
                    textTransform: "uppercase", padding: "0.5rem 1.1rem",
                    border: "1px solid #d4d3d0", color: "#888",
                  }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5 ── Let's build it (CTA final) ──────────────────────── */}
      <section
        className="h-screen flex items-center justify-center text-center px-6 md:px-14"
        style={{ background: "var(--background)", position: "relative", zIndex: 50 }}
      >
        <div className="max-w-4xl">
          <h2
            className="font-bold leading-none tracking-tight text-black"
            style={{ fontSize: "clamp(56px, 9.5vw, 140px)" }}
          >
            Let&apos;s build it.
          </h2>
          <p
            className="text-neutral-500 mt-6 leading-relaxed mx-auto"
            style={{ fontSize: "clamp(17px, 1.6vw, 28px)", maxWidth: "520px" }}
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
      </section>

    </div>
  );
}
