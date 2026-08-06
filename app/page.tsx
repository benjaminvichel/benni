"use client";
import { useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";
import { SplitText } from "gsap/SplitText";
import StackedCards from "./components/StackedCards";
import DecayCard from "./components/DecayCard";
import FaqSection from "./components/FaqSection";
import CharAnimation from "./components/CharAnimation";

export default function Home() {
  useEffect(() => {
    if (!document.getElementById("home")) return;

    try { gsap.registerPlugin(ScrollTrigger, TextPlugin, SplitText); } catch { /* HMR/extension cleanup */ }

    // snapshot ScrollTriggers that already exist (e.g. Header's) so cleanup doesn't kill them
    const preExisting = new Set(ScrollTrigger.getAll());

    const panel = document.querySelector("#home");

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: panel,
        start: "bottom bottom",
        end: "bottom top",
        pin: true,
        pinSpacing: false,
        scrub: true,
      },
    });

    tl.fromTo(
      panel,
      { scale: 1, opacity: 1 },
      { scale: 0.9, opacity: 0.1, duration: 0.9 },
    ).to(panel, { opacity: 0, duration: 0.1 });

    // hero subtitle — entrada + hover por linha, velocidade variável por char
    let subtitleCleanup: (() => void) | null = null;
    const subtitleLines =
      document.querySelectorAll<HTMLElement>(".subtitle-line");

    if (subtitleLines.length) {
      const lineCleanups: Array<() => void> = [];

      subtitleLines.forEach((line, lineIdx) => {
        const layerA = line.querySelector<HTMLElement>(".subtitle-layer-a");
        const layerB = line.querySelector<HTMLElement>(".subtitle-layer-b");
        if (!layerA || !layerB) return;

        // lineH é a altura do container — A sai para cima em -lineH, B entra de baixo (+lineH → 0)
        const lineH = line.offsetHeight;

        const splitA = SplitText.create(layerA, { type: "chars" });
        const splitB = SplitText.create(layerB, { type: "chars" });

        // A começa abaixo (entrada), B na posição natural (já abaixo do container via top:full)
        gsap.set(splitA.chars, { y: lineH });
        gsap.set(splitB.chars, { y: 0 });

        // durações pré-calculadas — consistentes a cada hover
        const durA = splitA.chars.map(() => 0.45 + Math.random() * 0.3);
        const durB = splitB.chars.map(() => 0.45 + Math.random() * 0.3);

        // entrada ao carregar — A sobe de baixo
        gsap.to(splitA.chars, {
          y: 0,
          stagger: { amount: 0.7, from: "start" },
          ease: "back.out(1.7)",
          duration: 1,
          delay: 0.2 + lineIdx * 0.12,
        });

        // mouseenter: A sai para cima (-lineH), B sobe de baixo (0 → -lineH dentro de top:full)
        const onEnter = () => {
          splitA.chars.forEach((char, i) => {
            gsap.to(char, {
              y: -lineH,
              duration: durA[i],
              delay: i * 0.05,
              ease: "power2.in",
            });
          });
          splitB.chars.forEach((char, i) => {
            gsap.to(char, {
              y: -lineH,
              duration: durB[i],
              delay: i * 0.05,
              ease: "power2.out",
            });
          });
        };

        // mouseleave: B desce de volta (−lineH → 0), A desce de cima para posição (−lineH → 0)
        const onLeave = () => {
          splitB.chars.forEach((char, i) => {
            gsap.to(char, {
              y: 0,
              duration: durB[i],
              delay: i * 0.05,
              ease: "power2.in",
            });
          });
          splitA.chars.forEach((char, i) => {
            gsap.to(char, {
              y: 0,
              duration: durA[i],
              delay: i * 0.05,
              ease: "power2.out",
            });
          });
        };

        line.addEventListener("mouseenter", onEnter);
        line.addEventListener("mouseleave", onLeave);
        lineCleanups.push(() => {
          line.removeEventListener("mouseenter", onEnter);
          line.removeEventListener("mouseleave", onLeave);
        });
      });

      subtitleCleanup = () => lineCleanups.forEach((fn) => fn());
    }

    // circle reveal — pinado, tela congela enquanto círculo cresce
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const scrubVal = isMobile ? 1 : true;

    const circleEl = document.querySelector<HTMLElement>("#circle-reveal");
    const circlePin = document.querySelector<HTMLElement>("#circle-pin");
    if (circleEl && circlePin) {
      gsap.to(circleEl, {
        clipPath: "circle(200vmax at 50% 100%)",
        ease: "none",
        scrollTrigger: {
          trigger: circlePin,
          start: "top bottom",
          end: "bottom top",
          scrub: scrubVal,
        },
      });

      // "WORKS" — timeline com o mesmo scroll range do círculo
      const worksText = document.querySelector<HTMLElement>("#works-text");
      if (worksText) {
        const worksTl = gsap.timeline({
          scrollTrigger: {
            trigger: circlePin,
            start: "top bottom",
            end: "bottom top",
            scrub: scrubVal,
          },
        });

        const img = (n: string) =>
          document.querySelector<HTMLElement>(`#project-image${n}`);
        const info = (n: string) =>
          document.querySelector<HTMLElement>(`#project-info${n}`);

        gsap.set([info(""), info("-2"), info("-3"), info("-4")], { autoAlpha: 0 });

        worksTl
          .to({}, { duration: 2.5 })
          .fromTo(
            worksText,
            { x: () => window.innerWidth },
            { x: 0, ease: "power2.out", duration: 1 },
          )
          .fromTo(
            "#works-group",
            { y: 0, scale: 1 },
            { y: "-35vh", scale: 0.4, ease: "power2.inOut", duration: 1 },
          )
          .to(
            "#works-subtitle",
            { opacity: 1, ease: "power2.out", duration: 0.6 },
            "<0.4",
          )
          .fromTo(
            img(""),
            { y: "80vh", scale: 0.4, opacity: 0 },
            { y: 0, scale: 1, opacity: 1, ease: "power2.out", duration: 1 },
            "<0.7",
          )
          .fromTo(
            info(""),
            { x: 80, autoAlpha: 0 },
            { x: 0, autoAlpha: 1, ease: "power2.out", duration: 0.8 },
            "<0.4",
          )
          .to([img(""), info("")], {
            autoAlpha: 0,
            y: -40,
            ease: "power2.in",
            duration: 1,
          })
          .fromTo(
            img("-2"),
            { y: "80vh", scale: 0.4, opacity: 0 },
            { y: 0, scale: 1, opacity: 1, ease: "power2.out", duration: 1 },
            "<0.7",
          )
          .fromTo(
            info("-2"),
            { x: -80, autoAlpha: 0 },
            { x: 0, autoAlpha: 1, ease: "power2.out", duration: 0.8 },
            "<0.4",
          )
          .to([img("-2"), info("-2")], {
            autoAlpha: 0,
            y: -40,
            ease: "power2.in",
            duration: 1,
          })
          .fromTo(
            img("-3"),
            { y: "80vh", scale: 0.4, opacity: 0 },
            { y: 0, scale: 1, opacity: 1, ease: "power2.out", duration: 1 },
            "<0.7",
          )
          .fromTo(
            info("-3"),
            { x: 80, autoAlpha: 0 },
            { x: 0, autoAlpha: 1, ease: "power2.out", duration: 0.8 },
            "<0.4",
          )
          .to([img("-3"), info("-3")], {
            autoAlpha: 0,
            y: -40,
            ease: "power2.in",
            duration: 1,
          })
          .fromTo(
            img("-4"),
            { y: "80vh", scale: 0.4, opacity: 0 },
            { y: 0, scale: 1, opacity: 1, ease: "power2.out", duration: 1 },
            "<0.7",
          )
          .fromTo(
            info("-4"),
            { x: -80, autoAlpha: 0 },
            { x: 0, autoAlpha: 1, ease: "power2.out", duration: 0.8 },
            "<0.4",
          )
          .to([img("-4"), info("-4")], {
            autoAlpha: 0,
            y: -40,
            ease: "power2.in",
            duration: 1,
          })
          .to({}, { duration: 0.5 })
          .fromTo(
            "#circle-cta",
            { opacity: 0, y: 40 },
            { opacity: 1, y: 0, ease: "power2.out", duration: 1 },
          );
      }
    }

    // about — imagem sticky, textos por bloco de scroll com SplitText
    gsap.set("#about-image", { opacity: 0, scale: 0.94 });

    ScrollTrigger.create({
      trigger: "#section-4",
      start: "top 80%",
      onEnter: () => gsap.to("#about-image", { opacity: 1, scale: 1, duration: 1.2, ease: "power3.out" }),
      onLeaveBack: () => gsap.to("#about-image", { opacity: 0, scale: 0.94, duration: 0.6, ease: "power3.in" }),
    });

    const makeBlockReveal = (leftId: string, rightId: string) => {
      const trigger = document.querySelector<HTMLElement>(leftId);
      if (!trigger) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let activeSplits: any[] = [];

      const hideBlock = () => {
        activeSplits.forEach(s => s?.revert?.());
        activeSplits = [];
        [leftId, rightId].forEach(id => {
          const el = document.querySelector(id);
          if (el) gsap.set(el.querySelectorAll("h2, p, span, a"), { opacity: 0, y: 0, clearProps: "transform" });
        });
      };

      const revealBlock = () => {
        hideBlock();
        [leftId, rightId].forEach(id => {
          const el = document.querySelector<HTMLElement>(id);
          if (!el) return;
          el.querySelectorAll<HTMLElement>("h2, p").forEach(textEl => {
            gsap.set(textEl, { opacity: 1 });
            SplitText.create(textEl, {
              type: "words,lines",
              mask: "lines",
              onSplit(self) {
                activeSplits.push(self);
                gsap.from(self.lines, { duration: 1.2, yPercent: 100, stagger: 0.14, ease: "power4.out" });
              },
            });
          });
          el.querySelectorAll<HTMLElement>("span, a").forEach((node, i) => {
            gsap.fromTo(node, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out", delay: 0.5 + i * 0.1 });
          });
        });
      };

      ScrollTrigger.create({ trigger, start: "top 65%", onEnter: revealBlock, onLeaveBack: hideBlock });
    };

    // pré-esconde todos os textos do about
    gsap.set(
      "#about-left-1 h2,#about-left-1 p,#about-left-1 span,#about-left-1 a," +
      "#about-right-1 h2,#about-right-1 p,#about-right-1 span,#about-right-1 a," +
      "#about-left-2 h2,#about-left-2 p,#about-left-2 span,#about-left-2 a," +
      "#about-right-2 h2,#about-right-2 p,#about-right-2 span,#about-right-2 a," +
      "#about-left-3 h2,#about-left-3 p,#about-left-3 span,#about-left-3 a," +
      "#about-right-3 h2,#about-right-3 p,#about-right-3 span,#about-right-3 a",
      { opacity: 0 }
    );

    makeBlockReveal("#about-left-1", "#about-right-1");
    makeBlockReveal("#about-left-2", "#about-right-2");
    makeBlockReveal("#about-left-3", "#about-right-3");

    // marquee
    const marqueeInner = document.querySelector<HTMLElement>("#marquee-inner");
    if (marqueeInner) {
      const singleWidth = marqueeInner.scrollWidth / 2;
      gsap.to(marqueeInner, {
        x: -singleWidth,
        duration: 80,
        ease: "none",
        repeat: -1,
      });
    }

    return () => {
      subtitleCleanup?.();

      ScrollTrigger.getAll().filter((t) => !preExisting.has(t)).forEach((t) => t.kill());
      gsap.killTweensOf("#marquee-inner");
    };
  }, []);

  return (
    <div>
      <main>
        <section id="home" className="h-screen relative overflow-hidden z-0">
          <Image
            src="/me/Black_white_moody_atmosphere_pho…_202606301722.jpeg"
            alt="Benjamin Vichel"
            fill
            className="object-cover object-center"
            priority
          />

          {/* subtle overlay so text stays readable */}
          <div className="absolute inset-0 bg-black/30" />

          {/* name + role — top left */}
          <div className="absolute top-20 left-6 md:top-10 md:left-14">
            <span
              id="hero-name"
              className="block text-white text-4xl md:text-7xl font-bold leading-none tracking-tight select-none"
            >
              Benjamin Vichel
            </span>
            <p className="text-white/50 text-sm font-light tracking-widest mt-2 select-none">
              Based in Brazil.
            </p>
            {/* subtitle — desktop only inline */}
            <div id="hero-subtitle-wrap" className="hidden md:block mt-35 select-none">
              {["Developer", "&", "Designer"].map((line, i) => (
                <div
                  key={i}
                  className={`subtitle-line relative overflow-hidden text-white/40 text-[9vw] font-bold leading-none${i === 1 ? " -my-4" : ""}`}
                >
                  <div className="subtitle-layer-a">{line}</div>
                  <div className="subtitle-layer-b absolute top-full left-0" aria-hidden="true">{line}</div>
                </div>
              ))}
            </div>
          </div>

          {/* subtitle — mobile only, anchored to bottom */}
          <div className="absolute bottom-10 left-6 md:hidden select-none">
            {["Developer", "&", "Designer"].map((line, i) => (
              <div
                key={i}
                className={`subtitle-line relative overflow-hidden text-white/40 text-[24vw] font-bold leading-none${i === 1 ? " -my-3" : ""}`}
              >
                <div className="subtitle-layer-a">{line}</div>
                <div className="subtitle-layer-b absolute top-full left-0" aria-hidden="true">{line}</div>
              </div>
            ))}
          </div>

          {/* marquee — bottom of section */}
          {/* <div className="absolute bottom-0 left-0 right-0 overflow-hidden py-1">
            <div
              id="marquee-inner"
              className="flex whitespace-nowrap will-change-transform"
            >
              {[0, 1].map((i) => (
                <span
                  key={i}
                  className="shrink-0 text-white/40 text-[11vw] font-bold select-none bg-black/40 leading-none pt-4"
                >
                  {Array.from({ length: 6 }).map((_, j) => (
                    <span key={j}>
                      THE COMPLETE EXPERIENCE — FROM DESIGN TO CODE, FROM ZERO TO LIVE.&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;
                    </span>
                  ))}
                </span>
              ))}
            </div>
          </div> */}
        </section>

        <StackedCards />

        {/* seção pinada — congela tela enquanto o círculo cresce */}
        <div id="circle-pin" className="h-[400vh] md:h-[800vh]" style={{ background: "var(--background)" }} />

        {/* circle reveal — fixed, cresce sobre fundo branco pinado */}
        <div
          id="circle-reveal"
          className="fixed inset-0 bg-black pointer-events-none"
          style={{ zIndex: 30, clipPath: "circle(0px at 50% 100%)" }}
        >
          {/* SELECTED — entra pela direita, depois sobe com subtítulo */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div id="works-group" className="flex flex-col items-center" style={{ gap: "0.6rem" }}>
              <span
                id="works-text"
                className="text-white font-bold select-none whitespace-nowrap"
                style={{ fontSize: "18vw", letterSpacing: "-0.02em" }}
              >
                SELECTED
              </span>
              <span
                id="works-subtitle"
                className="text-white/50 select-none whitespace-nowrap"
                style={{ fontSize: "3.2rem", fontWeight: 500, letterSpacing: "0.25em", textTransform: "uppercase", opacity: 0 }}
              >
                from simple web pages to complex websites
              </span>
            </div>
          </div>

          {/* card 1 — imagem esquerda/cima, texto direita/baixo */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 md:flex-row md:items-end md:justify-start md:pb-16 md:pl-14 md:gap-10 md:px-0" style={{ pointerEvents: "none" }}>
            <div
              id="project-image"
              className="w-full h-[35vh] shrink-0 rounded-2xl overflow-hidden md:w-[28vw] md:h-[55vh]"
              style={{ backgroundImage: "url('/selected/valotel/Captura de tela 2026-07-24 222734.png')", backgroundSize: "cover", backgroundPosition: "top" }}
            />
            <div id="project-info" className="text-white pb-0 w-full md:max-w-xl md:pb-4">
              <span className="block text-white/40 text-xs tracking-[0.3em] uppercase mb-3">01 — Product</span>
              <h3 className="text-2xl md:text-7xl font-bold leading-tight">Valotel</h3>
              <p className="text-white/50 text-base md:text-xl mt-3 leading-relaxed">Turns a 15-minute quoting process into 30 seconds — designed around how small pousada owners actually work, not how software usually expects them to.</p>
              <a href="https://www.valotel.com.br/" target="_blank" rel="noopener noreferrer" style={{ pointerEvents: "auto" }} className="inline-block mt-5 text-sm font-semibold tracking-widest uppercase text-white/60 hover:text-white transition-colors">See the project →</a>
            </div>
          </div>

          {/* card 2 — imagem direita/cima, texto esquerda/baixo */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 md:flex-row md:items-end md:justify-end md:pb-16 md:pr-14 md:gap-10 md:px-0" style={{ pointerEvents: "none" }}>
            <div id="project-info-2" className="text-white pb-0 w-full order-last md:order-0 md:max-w-xl md:pb-4">
              <span className="block text-white/40 text-xs tracking-[0.3em] uppercase mb-3">02 — Platform</span>
              <h3 className="text-2xl md:text-7xl font-bold leading-tight">EnglishIn<br className="hidden md:block" />Progress</h3>
              <p className="text-white/50 text-base md:text-xl mt-3 leading-relaxed">A full learning platform where students watch lessons, book live classes with teachers, and connect in community forums — built to scale across all of it simultaneously.</p>
              <a href="https://englishinprogress.com.br/" target="_blank" rel="noopener noreferrer" style={{ pointerEvents: "auto" }} className="inline-block mt-5 text-sm font-semibold tracking-widest uppercase text-white/60 hover:text-white transition-colors">See the project →</a>
            </div>
            <div
              id="project-image-2"
              className="w-full h-[35vh] shrink-0 rounded-2xl overflow-hidden order-first md:order-0 md:w-[28vw] md:h-[55vh]"
              style={{ backgroundImage: "url('/selected/english/Captura de tela 2026-07-24 222937.png')", backgroundSize: "cover", backgroundPosition: "left top" }}
            />
          </div>

          {/* card 3 — imagem esquerda/cima, texto direita/baixo */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 md:flex-row md:items-end md:justify-start md:pb-16 md:pl-14 md:gap-10 md:px-0" style={{ pointerEvents: "none" }}>
            <div
              id="project-image-3"
              className="w-full h-[35vh] shrink-0 rounded-2xl overflow-hidden md:w-[28vw] md:h-[55vh]"
              style={{ backgroundImage: "url('/selected/portfolioExample/Captura de tela 2026-07-24 223957.png')", backgroundSize: "cover", backgroundPosition: "top" }}
            />
            <div id="project-info-3" className="text-white pb-0 w-full md:max-w-xl md:pb-4">
              <span className="block text-white/40 text-xs tracking-[0.3em] uppercase mb-3">03 — Web Design</span>
              <h3 className="text-2xl md:text-7xl font-bold leading-tight">Illustration<br className="hidden md:block" />Portfolio</h3>
              <p className="text-white/50 text-base md:text-xl mt-3 leading-relaxed">An illustrator's portfolio — custom branding, handwritten typography, and an animated splash screen, every detail shaped to reflect her visual identity.</p>
              <a href="https://hannavichel.benni.com.br/" target="_blank" rel="noopener noreferrer" style={{ pointerEvents: "auto" }} className="inline-block mt-5 text-sm font-semibold tracking-widest uppercase text-white/60 hover:text-white transition-colors">See the project →</a>
            </div>
          </div>

          {/* card 4 — imagem direita/cima, texto esquerda/baixo */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-6 md:flex-row md:items-end md:justify-end md:pb-16 md:pr-14 md:gap-10 md:px-0" style={{ pointerEvents: "none" }}>
            <div id="project-info-4" className="text-white pb-0 w-full order-last md:order-0 md:max-w-xl md:pb-4">
              <span className="block text-white/40 text-xs tracking-[0.3em] uppercase mb-3">04 — Tool</span>
              <h3 className="text-2xl md:text-7xl font-bold leading-tight">BenTech</h3>
              <p className="text-white/50 text-base md:text-xl mt-3 leading-relaxed">An enterprise-grade tool that automates daily rate calculations for hotel budget quotations — featuring an interactive calendar, admin-controlled custom pricing per date, and a dedicated internal API connecting the frontend to a centralized database.</p>
              <a href="https://github.com/benjaminvichel/BenTech" target="_blank" rel="noopener noreferrer" style={{ pointerEvents: "auto" }} className="inline-block mt-5 text-sm font-semibold tracking-widest uppercase text-white/60 hover:text-white transition-colors">See the project →</a>
            </div>
            <div
              id="project-image-4"
              className="w-full h-[35vh] shrink-0 rounded-2xl overflow-hidden order-first md:order-0 md:w-[28vw] md:h-[55vh]"
              style={{ backgroundImage: "url('/selected/benTech/Captura de tela 2026-07-24 225026.png')", backgroundSize: "cover", backgroundPosition: "left top" }}
            />
          </div>

          {/* CTA — aparece após os cards, ainda dentro do círculo */}
          <div
            id="circle-cta"
            className="absolute inset-0 flex flex-col items-center justify-center gap-8"
            style={{ opacity: 0, pointerEvents: "none" }}
          >
            <p
              className="text-white font-bold text-center leading-tight"
              style={{ fontSize: "clamp(1.8rem, 4vw, 4vw)" }}
            >
              Got a project in mind?
            </p>
            <a
              href="/contact"
              className="char-anim-trigger flex items-center bg-white"
              style={{ pointerEvents: "auto", textDecoration: "none", height: 80, padding: 8, gap: 16 }}
            >
              <div style={{ position: "relative", height: "100%", aspectRatio: "1", flexShrink: 0, background: "#d4d4d4", overflow: "hidden" }}>
                <Image
                  src="/me/letsTalkHeroeSection/sem_fundo_lets_talk.png"
                  alt=""
                  fill
                  className="object-cover object-center"
                  style={{ pointerEvents: "none" }}
                />
              </div>
              <div style={{ display: "flex", alignItems: "center", alignSelf: "stretch", padding: "0 32px" }}>
                <CharAnimation
                  text="Let's talk"
                  style={{ color: "#000", fontSize: "1.4rem", fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase" }}
                />
              </div>
            </a>
          </div>
        </div>

        {/* espaço para o CTA respirar antes da section 4 cobrir */}
        <div className="h-[80vh]" style={{ background: "var(--background)" }} />

        {/* section 4 — about: imagem sticky, textos em blocos separados */}
        <section
          id="section-4"
          className="relative"
          style={{ zIndex: 40, background: "var(--background)" }}
        >
          {/* imagem mobile — só aparece em mobile, antes do conteúdo */}
          <div className="block md:hidden px-6 pt-20 pb-4">
            <div className="relative w-full aspect-3/4 rounded-2xl overflow-hidden">
              <Image
                src="/me/about/WhatsApp_Image_2026-07-03_at_22.11.06.jpeg_202607032223.jpeg"
                alt="Benjamin Vichel"
                fill
                className="object-cover object-center"
              />
            </div>
          </div>

          <div className="grid items-start px-6 md:px-24 gap-0 md:gap-20 grid-cols-1 md:grid-cols-[1fr_auto_1fr]">

            {/* coluna esquerda — 3 blocos de scroll */}
            <div>
              <div id="about-left-1" className="py-14 md:py-0 md:h-screen flex flex-col md:justify-center">
                <span className="block text-xs tracking-[0.3em] uppercase text-neutral-400 mb-5">About</span>
                <h2 className="text-4xl md:text-7xl font-bold leading-tight mb-8">Benjamin<br />Vichel</h2>
                <p className="text-neutral-500 text-lg leading-relaxed">
                  Computer Science graduate and full-stack developer based in Brazil. I design and build web experiences end-to-end — from interface to infrastructure, from Figma to production.
                </p>
              </div>
              <div id="about-left-2" className="py-14 md:py-0 md:h-screen flex flex-col md:justify-center">
                <span className="block text-xs tracking-[0.3em] uppercase text-neutral-400 mb-5">Experience</span>
                <h2 className="text-4xl md:text-7xl font-bold leading-tight mb-8">Real projects,<br />real clients.</h2>
                <p className="text-neutral-500 text-lg leading-relaxed">
                  CS internship coding interfaces at UNISINOS. Freelance websites for independent clients. Academic and personal projects across the full stack. Every project taught me something the classroom didn't.
                </p>
              </div>
              <div id="about-left-3" className="py-14 md:py-0 md:h-screen flex flex-col md:justify-center">
                <span className="block text-xs tracking-[0.3em] uppercase text-neutral-400 mb-5">Availability</span>
                <h2 className="text-4xl md:text-7xl font-bold leading-tight mb-8">Open for<br />projects.</h2>
                <p className="text-neutral-500 text-lg leading-relaxed">
                  Available for freelance projects and long-term collaborations. Based in Brazil, working remotely with clients worldwide.
                </p>
              </div>
            </div>

            {/* imagem sticky — desktop only */}
            <div
              className="hidden md:flex shrink-0 items-center justify-center"
              style={{ position: "sticky", top: 0, height: "100vh", alignSelf: "flex-start" }}
            >
              <div id="about-image">
                <DecayCard
                  width={420}
                  height={560}
                  image="/me/about/WhatsApp_Image_2026-07-03_at_22.11.06.jpeg_202607032223.jpeg"
                  maxDisplacement={80}
                  movementBound={40}
                />
              </div>
            </div>

            {/* coluna direita — 3 blocos de scroll */}
            <div>
              <div id="about-right-1" className="py-14 md:py-0 md:h-screen flex flex-col md:justify-center">
                <span className="block text-xs tracking-[0.3em] uppercase text-neutral-400 mb-5">Languages</span>
                <p className="text-neutral-500 text-lg leading-relaxed">
                  I work with clients in Portuguese, German, and English — which means no miscommunication, no lost nuance. Wherever you are, we can talk directly.
                </p>
              </div>
              <div id="about-right-2" className="py-14 md:py-0 md:h-screen flex flex-col md:justify-center">
                <span className="block text-xs tracking-[0.3em] uppercase text-neutral-400 mb-5">Background</span>
                <p className="text-neutral-500 text-lg leading-relaxed">
                  Bachelor's degree in Computer Science from UNISINOS. Interned as a UI/UX developer, then spent years as a full-stack developer and admin supervisor — building real systems under real pressure. Now focused on design-led web development.
                </p>
              </div>
              <div id="about-right-3" className="py-14 md:py-0 md:h-screen flex flex-col md:justify-center">
                <span className="block text-xs tracking-[0.3em] uppercase text-neutral-400 mb-5">Let&apos;s work</span>
                <p className="text-neutral-500 text-lg leading-relaxed mb-8">
                  Have a project in mind? I&apos;d love to hear about it. Reach out and let&apos;s figure out if we&apos;re a good fit.
                </p>
                <a href="/contact" className="inline-block text-base font-semibold tracking-widest uppercase border-b border-black pb-0.5 hover:opacity-50 transition-opacity">
                  Get in touch →
                </a>
              </div>
            </div>

          </div>
        </section>
      </main>

<FaqSection />
    </div>
  );
}
