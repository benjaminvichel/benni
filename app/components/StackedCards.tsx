"use client";
import { useRef } from "react";
import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const DURACAO_APARECER = 2;
const DURACAO_SUMIR    = 1.5;
const SOBREPOSICAO     = 0.05;

const FADE_TEXTS = [
  `Every decision is intentional. Nothing is decorative, nothing is random. If it's on the screen, it earns its place.`,
  `You get a site that's fast, clean, and genuinely yours — built to work while you focus on what you do best.`,
];

export default function StackedCards() {
  const outerRef = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      try { gsap.registerPlugin(SplitText, ScrollTrigger); } catch { /* HMR/extension cleanup */ }
      const container = outerRef.current!;

      // ── Primeiro texto: entrada NÃO scrubada — dispara ao entrar na tela ──
      const slideEl    = container.querySelector<HTMLElement>("#text-slide")!;
      const slideSplit = SplitText.create(slideEl, {
        type:       "lines,chars",
        linesClass: "line-clip",
      });

      gsap.set(slideSplit.lines, { overflow: "hidden" });
      gsap.set(slideSplit.chars, { yPercent: 130 });

      gsap.to(slideSplit.chars, {
        yPercent:  0,
        stagger:   { amount: 0.8, from: "start" },
        ease:      "back.out(1.7)",
        duration:  1,
        scrollTrigger: {
          trigger: container,
          start:   "top 70%",
          once:    true,
        },
      });

      // ── Timeline scrubada: saída do primeiro texto + textos fade ───────
      const masterTl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top 10%",
          end:   "bottom bottom",
          scrub: true,
        },
      });

      masterTl.to({}, { duration: 2 });
      masterTl.to(slideSplit.chars, {
        autoAlpha: 0,
        stagger:   { amount: DURACAO_SUMIR, from: "start" },
        duration:  DURACAO_SUMIR,
      });

      // ── Textos seguintes: fade letra por letra ────────────────────────
      const fadeEls = gsap.utils.toArray<HTMLElement>(".frase-fade", container);
      gsap.set(fadeEls, { autoAlpha: 0 });

      fadeEls.forEach((el, i) => {
        const split    = SplitText.create(el, { type: "words,chars" });
        const phraseTl = gsap.timeline();

        phraseTl.set(el, { autoAlpha: 1 });
        phraseTl.from(split.chars, {
          autoAlpha: 0,
          stagger:   { amount: DURACAO_APARECER, from: "start" },
          duration:  DURACAO_APARECER,
        });

        if (i < fadeEls.length - 1) {
          phraseTl.to({}, { duration: 2 });
          phraseTl.to(split.chars, {
            autoAlpha: 0,
            stagger:   { amount: DURACAO_SUMIR, from: "start" },
            duration:  DURACAO_SUMIR,
          });
          phraseTl.set(el, { autoAlpha: 0 });
        }

        masterTl.add(phraseTl, `-=${SOBREPOSICAO}`);
      });
    },
    { scope: outerRef },
  );

  return (
    <div
      ref={outerRef}
      id="projects"
      className="relative z-10 h-[240vh] md:h-[450vh]"
      style={{ background: "var(--background)" }}
    >
      <div className="sticky top-0 h-screen flex justify-center items-center px-8">

        {/* Badge topo */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2">
          <span className="px-5 py-2 rounded-full border border-black/20 bg-black/5 text-black/60 text-sm font-medium tracking-widest uppercase">
            What I do.
          </span>
        </div>

        {/* Primeiro texto — slide-up */}
        <h2
          id="text-slide"
          className="absolute text-black font-bold text-center leading-tight"
          style={{ maxWidth: "90vw", fontSize: "clamp(2rem, 7vw, 7rem)" }}
        >
          I design and build — one person,<br />
          one vision, zero handoff. What gets<br />
          designed is exactly what goes live.
        </h2>

        {/* Textos seguintes — fade letra por letra */}
        {FADE_TEXTS.map((text, i) => (
          <h2
            key={i}
            className="frase-fade absolute text-black font-bold text-center leading-tight"
            style={{ maxWidth: "90vw", fontSize: "clamp(2rem, 7vw, 7rem)" }}
          >
            {text}
          </h2>
        ))}

      </div>
    </div>
  );
}
