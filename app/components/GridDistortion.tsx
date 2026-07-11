"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import "./GridDistortion.css";

interface GridDistortionProps {
  imageSrc: string;
  grid?: number;
  mouse?: number;
  strength?: number;
  relaxation?: number;
  className?: string;
}

const vertexShader = `
uniform float time;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

const fragmentShader = `
uniform sampler2D uDataTexture;
uniform sampler2D uTexture;
uniform vec4 resolution;
varying vec2 vUv;
void main() {
  vec2 uv = vUv;
  vec4 offset = texture2D(uDataTexture, vUv);
  gl_FragColor = texture2D(uTexture, uv - 0.02 * offset.rg);
}`;

export default function GridDistortion({
  imageSrc,
  grid = 15,
  mouse = 0.1,
  strength = 0.15,
  relaxation = 0.9,
  className = "",
}: GridDistortionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const size = grid;

    // ── Scene ─────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    const camera = new THREE.OrthographicCamera(0, 0, 0, 0, -1000, 1000);
    camera.position.z = 2;

    // ── Uniforms ──────────────────────────────────────────────────
    const uniforms = {
      time: { value: 0 },
      resolution: { value: new THREE.Vector4() },
      uTexture: { value: null as THREE.Texture | null },
      uDataTexture: { value: null as THREE.DataTexture | null },
    };

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(imageSrc, (texture) => {
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.wrapS = THREE.ClampToEdgeWrapping;
      texture.wrapT = THREE.ClampToEdgeWrapping;
      uniforms.uTexture.value = texture;
      handleResize();
    });

    // Data texture — drives the distortion
    const dataArr = new Float32Array(4 * size * size);
    for (let i = 0; i < size * size; i++) {
      dataArr[i * 4]     = Math.random() * 255 - 125;
      dataArr[i * 4 + 1] = Math.random() * 255 - 125;
    }
    const dataTexture = new THREE.DataTexture(dataArr, size, size, THREE.RGBAFormat, THREE.FloatType);
    dataTexture.needsUpdate = true;
    uniforms.uDataTexture.value = dataTexture;

    // ── Mesh ──────────────────────────────────────────────────────
    const geometry = new THREE.PlaneGeometry(1, 1, size - 1, size - 1);
    const material = new THREE.ShaderMaterial({ side: THREE.DoubleSide, uniforms, vertexShader, fragmentShader, transparent: true });
    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    // ── Resize ────────────────────────────────────────────────────
    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const w = rect.width, h = rect.height;
      if (w === 0 || h === 0) return;
      const aspect = w / h;
      renderer.setSize(w, h);
      plane.scale.set(aspect, 1, 1);
      const fW = aspect, fH = 1;
      camera.left = -fW / 2; camera.right = fW / 2;
      camera.top = fH / 2; camera.bottom = -fH / 2;
      camera.updateProjectionMatrix();
      uniforms.resolution.value.set(w, h, 1, 1);
    };

    let resizeObserver: ResizeObserver | null = null;
    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(container);
    } else {
      window.addEventListener("resize", handleResize);
    }

    // ── Mouse state ───────────────────────────────────────────────
    const ms = { x: 0, y: 0, prevX: 0, prevY: 0, vX: 0, vY: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1 - (e.clientY - rect.top) / rect.height;
      ms.vX = x - ms.prevX;
      ms.vY = y - ms.prevY;
      ms.x = x; ms.y = y; ms.prevX = x; ms.prevY = y;
    };

    const handleMouseLeave = () => {
      ms.x = 0; ms.y = 0; ms.prevX = 0; ms.prevY = 0; ms.vX = 0; ms.vY = 0;
      dataTexture.needsUpdate = true;
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    // ── Animate ───────────────────────────────────────────────────
    let rafId = 0;

    const animate = (_t?: number) => {
      rafId = requestAnimationFrame(animate);
      uniforms.time.value += 0.05;

      // Relax all cells toward zero
      for (let i = 0; i < size * size; i++) {
        dataArr[i * 4]     *= relaxation;
        dataArr[i * 4 + 1] *= relaxation;
      }

      // Apply mouse distortion around cursor
      const gridMouseX = size * ms.x;
      const gridMouseY = size * ms.y;
      const maxDist    = size * mouse;

      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const distSq = (gridMouseX - i) ** 2 + (gridMouseY - j) ** 2;
          if (distSq < maxDist * maxDist) {
            const idx   = 4 * (i + size * j);
            const power = Math.min(maxDist / Math.sqrt(distSq), 10);
            dataArr[idx]     += strength * 100 * ms.vX * power;
            dataArr[idx + 1] -= strength * 100 * ms.vY * power;
          }
        }
      }

      dataTexture.needsUpdate = true;
      renderer.render(scene, camera);
    };

    handleResize();
    animate();

    return () => {
      cancelAnimationFrame(rafId);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      resizeObserver ? resizeObserver.disconnect() : window.removeEventListener("resize", handleResize);
      renderer.dispose();
      renderer.forceContextLoss();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      dataTexture.dispose();
      if (uniforms.uTexture.value) uniforms.uTexture.value.dispose();
    };
  }, [imageSrc, grid, mouse, strength, relaxation]);

  return (
    <div
      ref={containerRef}
      className={`distortion-container ${className}`}
    />
  );
}
