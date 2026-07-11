"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP);

const ITEMS = [
  { id: 1, label: "E-commerce Platform", image: "https://picsum.photos/seed/proj1/320/420" },
  { id: 2, label: "Brand Identity", image: "https://picsum.photos/seed/proj2/320/420" },
  { id: 3, label: "SaaS Dashboard", image: "https://picsum.photos/seed/proj3/320/420" },
  { id: 4, label: "Mobile App", image: "https://picsum.photos/seed/proj4/320/420" },
  { id: 5, label: "Landing Page", image: "https://picsum.photos/seed/proj5/320/420" },
  { id: 6, label: "Portfolio Site", image: "https://picsum.photos/seed/proj6/320/420" },
];

export default function CursorProjects() {
  const listRef = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      gsap.set(".swipeimage", { yPercent: -50, xPercent: -50 });

      let firstEnter: boolean | undefined;

      const cleanups: Array<() => void> = [];

      gsap.utils.toArray<HTMLElement>(".container", listRef.current).forEach((el) => {
        const image = el.querySelector<HTMLElement>(".swipeimage");
        if (!image) return;

        const setX = gsap.quickTo(image, "x", { duration: 0.4, ease: "power3" });
        const setY = gsap.quickTo(image, "y", { duration: 0.4, ease: "power3" });

        const align = (e: MouseEvent) => {
          if (firstEnter) {
            setX(e.clientX, e.clientX);
            setY(e.clientY, e.clientY);
            firstEnter = false;
          } else {
            setX(e.clientX);
            setY(e.clientY);
          }
        };

        const startFollow = () => document.addEventListener("mousemove", align);
        const stopFollow = () => document.removeEventListener("mousemove", align);

        const fade = gsap.to(image, {
          autoAlpha: 1,
          ease: "none",
          paused: true,
          duration: 0.15,
          onReverseComplete: stopFollow,
        });

        const onEnter = (e: MouseEvent) => {
          firstEnter = true;
          fade.play();
          startFollow();
          align(e);
        };

        const onLeave = () => fade.reverse();

        el.addEventListener("mouseenter", onEnter as EventListener);
        el.addEventListener("mouseleave", onLeave);

        cleanups.push(() => {
          el.removeEventListener("mouseenter", onEnter as EventListener);
          el.removeEventListener("mouseleave", onLeave);
          stopFollow();
        });
      });

      return () => cleanups.forEach((fn) => fn());
    },
    { scope: listRef }
  );

  return (
    <section id="work" className="relative z-10" style={{ background: "var(--background)" }}>
      <div className="px-16 py-20 border-b border-neutral-200">
        <h2 className="text-7xl font-bold text-black">Projects</h2>
      </div>

      <ul ref={listRef} className="cursor-list" role="list">
        {ITEMS.map((item) => (
          <li className="container" key={item.id}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="swipeimage" src={item.image} alt="" />
            <h3 className="text-4xl font-semibold text-black">{item.label}</h3>
          </li>
        ))}
      </ul>
    </section>
  );
}
