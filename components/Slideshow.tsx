"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MusicButton from "./MusicButton";

const VARIANTS: Record<string, any> = {
  fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
  slide: { initial: { opacity: 0, x: 80 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -80 } },
  zoom: { initial: { opacity: 0, scale: 1.15 }, animate: { opacity: 1, scale: 1 }, exit: { opacity: 0, scale: 0.95 } },
};

export default function Slideshow({ c }: { c: any }) {
  const slides: any[] = c.slides || [];
  const [i, setI] = useState(0); const [playing, setPlaying] = useState(true);
  const box = useRef<HTMLDivElement>(null);
  const s = slides[i];
  useEffect(() => {
    if (!playing || !s) return;
    const t = setTimeout(() => setI((v) => (v + 1) % slides.length), (s.duration || 5) * 1000);
    return () => clearTimeout(t);
  }, [i, playing, s, slides.length]);
  if (!s) return <p className="p-10 text-center">Nothing here yet.</p>;
  const v = VARIANTS[s.transition || "fade"];
  const f = s.filter || {};
  return (
    <div ref={box} className="relative flex h-screen flex-col" style={{ background: s.bg || "#FBF7F0" }}>
      <MusicButton src={c.music} />
      <div className="relative flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div key={i} {...v} transition={{ duration: 0.9 }} className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
            {s.image && <img src={s.image} alt="" className="max-h-[65%] max-w-full object-contain"
              style={{ filter: `brightness(${f.brightness ?? 100}%) contrast(${f.contrast ?? 100}%) ${f.sepia ? "sepia(.4)" : ""}`,
                border: s.border ? "10px solid #fff" : undefined, boxShadow: s.shadow ? "0 20px 40px rgba(0,0,0,.25)" : undefined }} />}
            {s.text && <p className="max-w-2xl text-3xl text-burgundy" style={{ fontFamily: "var(--f-script)" }}>{s.text}</p>}
            {s.subtitle && <p className="font-serif italic text-ink/70">{s.subtitle}</p>}
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex items-center justify-center gap-2 bg-ivory/90 p-3">
        <button className="btn-ghost" onClick={() => setI((i - 1 + slides.length) % slides.length)}>Previous</button>
        <button className="btn-primary" onClick={() => setPlaying(!playing)}>{playing ? "Pause" : "Play"}</button>
        <button className="btn-ghost" onClick={() => setI((i + 1) % slides.length)}>Next</button>
        <button className="btn-ghost" onClick={() => (document.fullscreenElement ? document.exitFullscreen() : box.current?.requestFullscreen())}>Full screen</button>
        <span className="ml-2 text-xs text-ink/60">{i + 1} / {slides.length}</span>
      </div>
    </div>
  );
}
