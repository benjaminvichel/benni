"use client";
import { useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MorphSVGPlugin } from "gsap/MorphSVGPlugin";

const NAV = [
  { label: "Process", href: "/process" },
  { label: "Contact", href: "/contact" },
];

const SOCIAL = [
  { label: "Instagram", href: "https://instagram.com/v_benny__"              },
  { label: "LinkedIn",  href: "https://www.linkedin.com/in/benjaminvichel"   },
  { label: "GitHub",    href: "https://github.com/benjaminvichel"            },
];

// same structure as the codepen reference — viewBox 0 0 2278 683
const WAVE = "M0-0.3C0-0.3,464,156,1139,156S2278-0.3,2278-0.3V683H0V-0.3z";
const FLAT = "M0-0.3C0-0.3,464,0,1139,0s1139-0.3,1139-0.3V683H0V-0.3z";

export default function Footer() {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger, MorphSVGPlugin);

    gsap.set("#fw", { morphSVG: WAVE });

    ScrollTrigger.create({
      trigger: "#site-footer",
      start: "top 60%",
      toggleActions: "play pause resume reverse",
      onEnter(self) {
        const velocity  = self.getVelocity();
        const variation = velocity / 10000;

        gsap.fromTo("#fw",
          { morphSVG: WAVE },
          {
            morphSVG: FLAT,
            duration: 2,
            ease: `elastic.out(${1 + variation}, ${1 - variation})`,
            overwrite: true,
          }
        );
      },
      onLeaveBack() {
        gsap.killTweensOf("#fw");
        gsap.set("#fw", { morphSVG: WAVE });
      },
    });
  }, []);

  return (
    <footer id="site-footer" style={{ position: "relative", zIndex: 45, background: "#0a0a0a", color: "white" }}>

      {/* wave — container tem fundo branco para criar contraste com o SVG preto */}
      <div style={{ background: "var(--background)", display: "block", lineHeight: 0 }}>
        <svg
          viewBox="0 0 2278 683"
          preserveAspectRatio="none"
          style={{ display: "block", width: "100%", height: "clamp(80px, 12vw, 160px)" }}
        >
          <path id="fw" fill="#0a0a0a" d={WAVE} />
        </svg>
      </div>

      {/* content */}
      <div className="px-6 md:px-14" style={{ paddingTop: "3.5rem", paddingBottom: "2.5rem" }}>
        <div className="flex flex-col gap-10 md:flex-row md:justify-between md:items-start">

          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            <Link href="/" style={{
              fontFamily: "var(--font-bebas)",
              fontSize: "clamp(24px, 3vw, 44px)",
              letterSpacing: "0.05em",
              color: "white",
              lineHeight: 1,
              marginBottom: "1.2rem",
              display: "block",
              textDecoration: "none",
            }}>
              BENNI
            </Link>
            {NAV.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none", fontSize: "1.05rem", fontWeight: 500, letterSpacing: "0.07em" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col gap-2 md:items-end">
            {SOCIAL.map((s) => (
              <a
                key={s.href}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none", fontSize: "1.05rem", fontWeight: 500, letterSpacing: "0.07em" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "white")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.35)")}
              >
                {s.label}
              </a>
            ))}
          </div>

        </div>

        <div style={{
          marginTop: "4rem",
          paddingTop: "1.2rem",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          justifyContent: "space-between",
        }}>
          <span style={{ color: "rgba(255,255,255,0.18)", fontSize: "0.82rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            © {new Date().getFullYear()} Benjamin Vichel
          </span>
          <span style={{ color: "rgba(255,255,255,0.18)", fontSize: "0.82rem", letterSpacing: "0.15em", textTransform: "uppercase" }}>
            Design &amp; Development
          </span>
        </div>
      </div>

    </footer>
  );
}
