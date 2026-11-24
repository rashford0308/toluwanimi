"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Petals from "./Petals";
import type { OpeningSettings } from "@/lib/types";

const BG: Record<string, string> = {
  petals: "radial-gradient(circle at 50% 30%, #FBF7F0, #F5EDE0 60%, #F2D4D0)",
  glow: "radial-gradient(circle at 50% 50%, #FFF8E8, #E9D8B4 70%, #C99A8E)",
  dusk: "radial-gradient(circle at 50% 20%, #8a3346, #6E1F2E 55%, #3b0f19)",
};

export default function Opening({ s, onOpen }: { s: OpeningSettings; onOpen: () => void }) {
  const [step, setStep] = useState(0); // 0 line1, 1 line2, 2 button, 3 opening
  const audio = useRef<HTMLAudioElement>(null);
  const dark = s.theme === "dusk";

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 2600);
    const t2 = setTimeout(() => setStep(2), 4800);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const open = () => {
    setStep(3);
    audio.current?.play().catch(() => {}); // allowed: triggered by a click
    setTimeout(onOpen, 1500);
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center"
      style={{ background: s.bgUrl ? `url(${s.bgUrl}) center/cover` : BG[s.theme] }}
      exit={{ opacity: 0, scale: 1.06 }} transition={{ duration: 1.1 }}>
      {s.musicUrl && <audio ref={audio} src={s.musicUrl} loop preload="auto" />}
      <Petals density={s.theme === "glow" ? 18 : 30} burst={step === 3 ? 1 : 0} />
      <div className={`relative z-10 max-w-xl ${dark ? "text-ivory" : "text-burgundy"}`}>
        <motion.h1 className="font-script text-5xl sm:text-7xl leading-tight"
          initial={{ opacity: 0, filter: "blur(10px)", y: 10 }} animate={{ opacity: step === 3 ? 0 : 1, filter: "blur(0px)", y: 0 }}
          transition={{ duration: 1.8 }}>{s.line1}</motion.h1>
        <AnimatePresence>
          {step >= 1 && step < 3 && (
            <motion.p key="l2" className="mt-6 font-serif text-lg sm:text-2xl italic opacity-80"
              initial={{ opacity: 0 }} animate={{ opacity: 0.85 }} exit={{ opacity: 0 }} transition={{ duration: 1.6 }}>{s.line2}</motion.p>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {step === 2 && (
            <motion.button key="b" onClick={open} className="mt-12 rounded-full border border-current px-8 py-4 font-sans text-sm tracking-widest backdrop-blur-sm"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 1.4 }}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }} transition={{ duration: 1 }}>
              <motion.span animate={{ opacity: [0.7, 1, 0.7] }} transition={{ repeat: Infinity, duration: 2.6 }}>{s.button}</motion.span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      {step === 3 && <motion.div className="absolute inset-0 z-20 bg-ivory" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 1 }} />}
      {step < 2 && <button onClick={() => setStep(2)} className={`absolute bottom-8 z-10 text-xs opacity-50 ${dark ? "text-ivory" : "text-burgundy"}`}>Skip</button>}
    </motion.div>
  );
}
