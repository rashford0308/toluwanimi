"use client";
import { useEffect, useRef } from "react";

export default function Petals({ density = 28, burst = 0 }: { density?: number; burst?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const burstRef = useRef(burst);
  burstRef.current = burst;
  useEffect(() => {
    const c = ref.current!; const ctx = c.getContext("2d")!;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let w = 0, h = 0, raf = 0;
    const size = () => { w = c.width = innerWidth; h = c.height = innerHeight; };
    size(); addEventListener("resize", size);
    const mk = (y?: number) => ({
      x: Math.random() * w, y: y ?? -20, r: 5 + Math.random() * 9, vy: 0.3 + Math.random() * 0.8,
      vx: -0.3 + Math.random() * 0.6, a: Math.random() * 6, va: (Math.random() - 0.5) * 0.03,
      col: ["#F2D4D0", "#E9D8B4", "#C99A8E", "#fff"][(Math.random() * 4) | 0], o: 0.35 + Math.random() * 0.4,
    });
    const ps = Array.from({ length: density }, () => mk(Math.random() * h));
    let lastBurst = 0;
    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      if (burstRef.current !== lastBurst) { lastBurst = burstRef.current; for (let i = 0; i < 40; i++) ps.push(mk(h * Math.random() * 0.3)); }
      for (let i = ps.length - 1; i >= 0; i--) {
        const p = ps[i]; p.y += p.vy; p.x += p.vx + Math.sin(p.y / 60) * 0.4; p.a += p.va;
        if (p.y > h + 20) { if (i >= density) ps.splice(i, 1); else Object.assign(p, mk()); continue; }
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.globalAlpha = p.o; ctx.fillStyle = p.col;
        ctx.beginPath(); ctx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", size); };
  }, [density]);
  return <canvas ref={ref} className="pointer-events-none fixed inset-0 z-0" aria-hidden />;
}
