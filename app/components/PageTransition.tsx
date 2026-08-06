"use client";
import { useEffect, useRef, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const FONT: React.CSSProperties = {
  fontFamily: "var(--font-bebas)",
  fontSize: "20vw",
  color: "#ffffff",
  letterSpacing: "-0.02em",
  lineHeight: 1,
  display: "inline-block",
};

export default function PageTransition() {
  const overlayRef  = useRef<HTMLDivElement>(null);
  const bRef        = useRef<HTMLSpanElement>(null);
  const eRef        = useRef<HTMLSpanElement>(null);
  const n1Ref       = useRef<HTMLSpanElement>(null);
  const n2Ref       = useRef<HTMLSpanElement>(null);
  const iRef        = useRef<HTMLSpanElement>(null);
  const tlRef       = useRef<gsap.core.Timeline | null>(null);
  const prevPath    = useRef<string | null>(null);
  const isShowing   = useRef(false);
  const pathname    = usePathname();
  const router      = useRouter();

  const others = () =>
    [eRef.current, n1Ref.current, n2Ref.current, iRef.current] as (HTMLSpanElement | null)[];

  const resetLetters = useCallback(() => {
    const b = bRef.current;
    if (!b) return;
    gsap.set(b, { y: 0 });
    gsap.set(others(), { x: -b.offsetWidth, opacity: 0 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Entra: tela desliza + B pulando → chama onComplete (que faz router.push)
  const playEnter = useCallback((onComplete: () => void) => {
    const overlay = overlayRef.current;
    const b = bRef.current;
    if (!overlay || !b) { onComplete(); return; }

    tlRef.current?.kill();
    isShowing.current = true;
    resetLetters();

    const tl = gsap.timeline();
    tlRef.current = tl;

    tl.fromTo(overlay,
      { yPercent: 100 },
      { yPercent: 0, duration: 0.9, ease: "power3.inOut" }
    );
    tl.to(b, { y: -80, duration: 0.38, ease: "power2.out", yoyo: true, repeat: 5 });
    tl.add(onComplete); // navega após B parar de pular
  }, [resetLetters]);

  // Sai: letras revelam → pausa → tela sobe
  const playExit = useCallback(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    isShowing.current = false;
    tlRef.current?.kill();

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set(overlay, { yPercent: 100 });
        ScrollTrigger.refresh();
      },
    });
    tlRef.current = tl;

    tl.to(others(), { x: 0, opacity: 1, stagger: 0.2, duration: 0.85, ease: "power3.out" });
    tl.to({}, { duration: 0.7 });
    tl.to(overlay, { yPercent: -100, duration: 0.9, ease: "power3.inOut" });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Primeira carga: animação completa sem deslize de entrada
  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

    isShowing.current = true;
    resetLetters();

    const tl = gsap.timeline({
      onComplete: () => {
        isShowing.current = false;
        gsap.set(overlay, { yPercent: 100 });
      },
    });
    tlRef.current = tl;

    tl.to(bRef.current!, { y: -80, duration: 0.38, ease: "power2.out", yoyo: true, repeat: 5 });
    tl.to(others(), { x: 0, opacity: 1, stagger: 0.2, duration: 0.85, ease: "power3.out" }, "+=0.08");
    tl.to({}, { duration: 0.7 });
    tl.to(overlay, { yPercent: -100, duration: 0.9, ease: "power3.inOut" });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Quando pathname muda (nova página carregou) → revelar BENNI e sair
  useEffect(() => {
    if (prevPath.current === null) {
      prevPath.current = pathname;
      return;
    }
    prevPath.current = pathname;
    if (isShowing.current) playExit();
  }, [pathname, playExit]);

  // Intercepta todos os cliques em links internos ANTES da navegação
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const anchor = (e.target as Element).closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("/")) return;
      if (href === pathname) return;
      if (anchor.target === "_blank") return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      e.preventDefault();
      e.stopPropagation();
      playEnter(() => { window.scrollTo(0, 0); router.push(href); });
    };

    document.addEventListener("click", handleClick, true); // capture phase
    return () => document.removeEventListener("click", handleClick, true);
  }, [pathname, playEnter, router]);

  return (
    <div
      ref={overlayRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <div style={{ display: "flex", alignItems: "baseline" }}>
        <span ref={bRef}  style={{ ...FONT, position: "relative", zIndex: 2 }}>B</span>
        <span ref={eRef}  style={{ ...FONT, opacity: 0 }}>E</span>
        <span ref={n1Ref} style={{ ...FONT, opacity: 0 }}>N</span>
        <span ref={n2Ref} style={{ ...FONT, opacity: 0 }}>N</span>
        <span ref={iRef}  style={{ ...FONT, opacity: 0 }}>I</span>
      </div>
    </div>
  );
}
