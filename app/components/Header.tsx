"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import CharAnimation from "./CharAnimation";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { TextPlugin } from "gsap/TextPlugin";

gsap.registerPlugin(ScrollTrigger, TextPlugin);

const NAV_LINKS = [
  { label: "Process", href: "/process", num: "01" },
  { label: "Contact", href: "/contact", num: "02" },
];

export default function Header() {
  const hoverEnabledRef = useRef(false);
  const benniRef = useRef<HTMLAnchorElement>(null);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const navColor = isHome ? "rgba(255,255,255,0.75)" : "rgba(0,0,0,0.55)";
  const navHover = isHome ? "#ffffff" : "#000000";

  useEffect(() => {
    gsap.set("#header-island", { y: -12, autoAlpha: 0 });
    gsap.set("#header-menu", { pointerEvents: "none" });

    // ── BENNI hover (native events — avoids Next.js Link prefetch interference) ──
    const benni = benniRef.current;
    // store refs so cleanup can remove the exact same functions
    let benniExpand: (() => void) | null = null;
    let benniCollapse: (() => void) | null = null;
    if (benni) {
      benniExpand = () => {
        if (!hoverEnabledRef.current) return;
        gsap.to(benni, {
          duration: 0.4,
          text: "BENJAMIN VICHEL",
          ease: "none",
        });
      };
      benniCollapse = () => {
        if (!hoverEnabledRef.current) return;
        gsap.to(benni, { duration: 0.25, text: "BENNI", ease: "none" });
      };
      benni.addEventListener("mouseenter", benniExpand);
      benni.addEventListener("mouseleave", benniCollapse);
    }

    // ── Island menu timeline ───────────────────────────────────────
    let menuOpen = false;

    const menuTl = gsap
      .timeline({ paused: true })
      .set("#header-menu", { pointerEvents: "auto" })
      .to(".hm-backdrop", { opacity: 1, duration: 0.3, ease: "power2.out" }, 0)
      .from(
        ".hm-panel",
        {
          autoAlpha: 0,
          yPercent: -10,
          scale: 0.9,
          duration: 0.55,
          transformOrigin: "top center",
          ease: "back.out(2)",
        },
        0.05,
      )
      .from(
        ".hm-link",
        {
          opacity: 0,
          y: 8,
          duration: 0.3,
          ease: "power2.out",
          stagger: 0.06,
        },
        0.2,
      );

    const openMenu = () => {
      menuOpen = true;
      gsap.set("#header-menu", { pointerEvents: "auto" });
      menuTl.timeScale(1).play();
    };

    const closeMenu = () => {
      menuOpen = false;
      menuTl.eventCallback("onReverseComplete", () => {
        gsap.set("#header-menu", { pointerEvents: "none" });
      });
      menuTl.timeScale(1.6).reverse();
    };

    const btn = document.querySelector<HTMLElement>("#island-btn");
    const handleToggle = () => {
      if (menuOpen) closeMenu();
      else openMenu();
    };
    btn?.addEventListener("click", handleToggle);

    const backdrop = document.querySelector<HTMLElement>(".hm-backdrop");
    backdrop?.addEventListener("click", closeMenu);

    // ── Header show/hide via ScrollTrigger ────────────────────────
    const showBarAnim = gsap
      .from("#header-bar", { yPercent: -100, paused: true, duration: 0.25 })
      .progress(1);

    const showIslandAnim = gsap
      .to("#header-island", {
        autoAlpha: 1,
        y: 0,
        paused: true,
        duration: 0.45,
        ease: "back.out(1.4)",
        // only enable hover once the island has fully landed
        onComplete: () => {
          hoverEnabledRef.current = true;
        },
        // disable hover and reset text as island hides
        onReverseComplete: () => {
          hoverEnabledRef.current = false;
          if (benni) {
            gsap.killTweensOf(benni);
            gsap.set(benni, { text: "BENNI" });
          }
        },
      })
      .progress(0);

    ScrollTrigger.create({
      start: "top top",
      end: "max",
      onUpdate(self) {
        const atTop = window.scrollY < 80;
        if (atTop) {
          showBarAnim.play();
          hoverEnabledRef.current = false;
          showIslandAnim.reverse();
          if (menuOpen) closeMenu();
        } else if (self.direction === -1) {
          showBarAnim.reverse();
          showIslandAnim.play();
        } else {
          showBarAnim.reverse();
          hoverEnabledRef.current = false;
          showIslandAnim.reverse();
          if (menuOpen) closeMenu();
        }
      },
    });

    return () => {
      menuTl.kill();
      showBarAnim.kill();
      showIslandAnim.kill();
      btn?.removeEventListener("click", handleToggle);
      backdrop?.removeEventListener("click", closeMenu);
      if (benni && benniExpand)
        benni.removeEventListener("mouseenter", benniExpand);
      if (benni && benniCollapse)
        benni.removeEventListener("mouseleave", benniCollapse);
    };
  }, []);

  return (
    <>
      {/* ── Top header: centered nav ──────────────────────────── */}
      <header
        id="header-bar"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 80,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "2rem 3.5rem",
          pointerEvents: "none",
        }}
      >
        {/* left — BENNI home link (hidden on home page) */}
        <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
          {!isHome && (
            <Link
              href="/"
              style={{
                fontFamily: "var(--font-bebas)",
                fontSize: "1.4rem",
                letterSpacing: "0.1em",
                color: navHover,
                textDecoration: "none",
                lineHeight: 1,
                pointerEvents: "auto",
              }}
            >
              BENNI
            </Link>
          )}
        </div>

        {/* center — nav links */}
        <nav style={{ display: "flex", gap: "3rem", pointerEvents: "auto" }}>
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="char-anim-trigger"
              style={{
                fontSize: "1rem",
                fontWeight: 600,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: navColor,
                textDecoration: "none",
              }}
            >
              <CharAnimation text={l.label} />
            </Link>
          ))}
        </nav>

        {/* right — Let's talk button */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
          <Link
            href="/contact"
            className="char-anim-trigger"
            style={{ textDecoration: "none", pointerEvents: "auto" }}
          >
            {/* pai: linha com imagem + texto */}
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                height: 44,
                overflow: "hidden",
                background: "#fff",
                padding: 5,
                gap: 12,
              }}
            >
              {/* imagem com fundo cinza */}
              <div style={{ height: "100%", aspectRatio: "1", flexShrink: 0, background: "#d4d4d4", overflow: "hidden" }}>
                <img
                  src="/me/letsTalkHeroeSection/sem_fundo_lets_talk.png"
                  alt=""
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </div>
              {/* texto com char animation */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  alignSelf: "stretch",
                  paddingRight: 16,
                }}
              >
                <CharAnimation
                  text="Let's talk"
                  style={{
                    color: "#000",
                    fontSize: "1rem",
                    fontWeight: 600,
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                  }}
                />
              </div>
            </div>
          </Link>
        </div>
      </header>

      {/* ── Floating island ───────────────────────────────────── */}
      <div
        id="header-island"
        style={{
          position: "fixed",
          top: "1.1rem",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 90,
          display: "flex",
          alignItems: "center",
          gap: "1.4rem",
          padding: "0.45rem 0.6rem 0.45rem 1.1rem",
          background: "#171717",
          borderRadius: "99px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.22)",
          userSelect: "none",
          whiteSpace: "nowrap",
        }}
      >
        <Link
          ref={benniRef}
          href="/"
          style={{
            fontFamily: "var(--font-bebas)",
            fontSize: "1.15rem",
            letterSpacing: "0.1em",
            color: "#fff",
            textDecoration: "none",
            lineHeight: 1,
            cursor: "pointer",
          }}
        >
          BENNI
        </Link>

        <button
          id="island-btn"
          aria-label="Toggle menu"
          style={{
            width: 34,
            height: 34,
            background: "rgba(255,255,255,0.1)",
            border: "none",
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            padding: 0,
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <line
              x1="3"
              y1="5"
              x2="13"
              y2="5"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="3"
              y1="8"
              x2="13"
              y2="8"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <line
              x1="3"
              y1="11"
              x2="13"
              y2="11"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      {/* ── Menu overlay ──────────────────────────────────────── */}
      <div
        id="header-menu"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 85,
          pointerEvents: "none",
        }}
      >
        <div
          className="hm-backdrop"
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(14,16,15,0.55)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            opacity: 0,
          }}
        />

        <div
          className="hm-panel"
          style={{
            visibility: "hidden",
            position: "absolute",
            top: "4.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            background: "#fff",
            border: "1px solid #e5e5e5",
            borderRadius: 20,
            padding: "0.4rem",
            width: "clamp(240px, 60vw, 380px)",
            boxShadow: "0 12px 60px rgba(0,0,0,0.14)",
          }}
        >
          {NAV_LINKS.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              className="hm-link"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.9rem 1.1rem",
                textDecoration: "none",
                color: "#171717",
                fontSize: "1.05rem",
                fontWeight: 600,
                letterSpacing: "0.01em",
                borderRadius: 14,
                borderTop: i > 0 ? "1px solid #f0f0f0" : "none",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "#f8f8f8")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <span>{l.label}</span>
              <span
                style={{
                  fontSize: "0.68rem",
                  fontWeight: 500,
                  color: "#aaa",
                  letterSpacing: "0.12em",
                }}
              >
                {l.num}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
