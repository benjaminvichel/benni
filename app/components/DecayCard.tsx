"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import "./DecayCard.css";

interface DecayCardProps {
  children?: React.ReactNode;
  width?: number;
  height?: number;
  image?: string;
  baseFrequency?: number;
  numOctaves?: number;
  seed?: number;
  maxDisplacement?: number;
  movementBound?: number;
}

export default function DecayCard({
  width = 300,
  height = 400,
  image = "https://picsum.photos/300/400?grayscale",
  baseFrequency = 0.015,
  numOctaves = 5,
  seed = 4,
  maxDisplacement = 80,
  movementBound = 40,
  children,
}: DecayCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const displacementMapRef = useRef<SVGFEDisplacementMapElement>(null);
  const cursor = useRef({ x: 0, y: 0 });
  const cachedCursor = useRef({ x: 0, y: 0 });
  const winsize = useRef({ width: 0, height: 0 });

  useEffect(() => {
    winsize.current = { width: window.innerWidth, height: window.innerHeight };
    cursor.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    cachedCursor.current = { ...cursor.current };

    const lerp = (a: number, b: number, n: number) => (1 - n) * a + n * b;
    const map = (x: number, a: number, b: number, c: number, d: number) =>
      ((x - a) * (d - c)) / (b - a) + c;
    const distance = (x1: number, x2: number, y1: number, y2: number) =>
      Math.hypot(x1 - x2, y1 - y2);

    const handleResize = () => {
      winsize.current = { width: window.innerWidth, height: window.innerHeight };
    };
    const handleMouseMove = (ev: MouseEvent) => {
      cursor.current = { x: ev.clientX, y: ev.clientY };
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    const imgValues = { x: 0, y: 0, rz: 0, displacementScale: 0 };

    let rafId: number;
    const render = () => {
      let tx = lerp(imgValues.x, map(cursor.current.x, 0, winsize.current.width, -120, 120), 0.1);
      let ty = lerp(imgValues.y, map(cursor.current.y, 0, winsize.current.height, -120, 120), 0.1);
      let trz = lerp(imgValues.rz, map(cursor.current.x, 0, winsize.current.width, -10, 10), 0.1);

      if (tx > movementBound) tx = movementBound + (tx - movementBound) * 0.2;
      if (tx < -movementBound) tx = -movementBound + (tx + movementBound) * 0.2;
      if (ty > movementBound) ty = movementBound + (ty - movementBound) * 0.2;
      if (ty < -movementBound) ty = -movementBound + (ty + movementBound) * 0.2;

      imgValues.x = tx;
      imgValues.y = ty;
      imgValues.rz = trz;

      if (containerRef.current) {
        gsap.set(containerRef.current, { x: tx, y: ty, rotateZ: trz });
      }

      const travelled = distance(cachedCursor.current.x, cursor.current.x, cachedCursor.current.y, cursor.current.y);
      imgValues.displacementScale = lerp(
        imgValues.displacementScale,
        map(travelled, 0, 200, 0, maxDisplacement),
        0.06
      );

      if (displacementMapRef.current) {
        gsap.set(displacementMapRef.current, { attr: { scale: imgValues.displacementScale } });
      }

      cachedCursor.current = { ...cursor.current };
      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [maxDisplacement, movementBound]);

  return (
    <div
      ref={containerRef}
      className="decay-polaroid"
      style={{ width: `${width + 32}px` }}
    >
      <div style={{ width: `${width}px`, height: `${height}px`, position: "relative" }}>
        <svg
          viewBox="-60 -75 720 900"
          preserveAspectRatio="xMidYMid slice"
          className="decay-svg"
        >
          <filter id="imgFilter">
            <feTurbulence
              type="turbulence"
              baseFrequency={baseFrequency}
              numOctaves={numOctaves}
              seed={seed}
              stitchTiles="stitch"
              x="0%"
              y="0%"
              width="100%"
              height="100%"
              result="turbulence1"
            />
            <feDisplacementMap
              ref={displacementMapRef}
              in="SourceGraphic"
              in2="turbulence1"
              scale={0}
              xChannelSelector="R"
              yChannelSelector="B"
              x="0%"
              y="0%"
              width="100%"
              height="100%"
              result="displacementMap3"
            />
          </filter>
          <g>
            <image
              href={image}
              x="0"
              y="0"
              width="600"
              height="750"
              filter="url(#imgFilter)"
              preserveAspectRatio="xMidYMid slice"
            />
          </g>
        </svg>
        {children && <div className="decay-card-text">{children}</div>}
      </div>
    </div>
  );
}
