"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Petals from "./Petals";
import MusicButton from "./MusicButton";

const FONTS: Record<string, string> = {
  pinyon: "var(--f-script)", vibes: "var(--f-vibes)", dancing: "var(--f-dancing)", serif: "var(--f-serif)",
};

export default function Letter({ c, title }: { c: any; title: string }) {
  const [stage, setStage] = useState<"closed" | "flap" | "rise" | "read" | "done">("closed");
  const words: string[] = (c.body || "").split(/(\s+)/);
  const [shown, setShown] = useState(0);
  const font = FONTS[c.font || "pinyon"];
  const wax = c.envelope === "wax";

  useEffect(() => {
    if (stage !== "read") return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) { setShown(words.length); return; }
    const id = setInterval(() => setShown((n) => (n >= words.length ? (clearInterval(id), n) : n + 2)), 70);
    return () => clearInterval(id);
  }, [stage]); // eslint-disable-line

  useEffect(() => { if (stage === "read" && shown >= words.length && words.length) { const t = setTimeout(() => setStage("done"), 1800); return () => clearTimeout(t); } }, [shown, stage]); // eslint-disable-line

  const open = () => { setStage("flap"); setTimeout(() => setStage("rise"), 900); setTimeout(() => setStage("read"), 1900); };

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-ivory to-blush/40 px-4 py-10">
      <Petals density={14} burst={stage === "done" ? 1 : 0} />
      <MusicButton src={c.music} />
      {stage !== "read" && stage !== "done" && (
        <div className="relative z-10 flex flex-col items-center">
          <button onClick={open} disabled={stage !== "closed"} aria-label="Open letter" className="relative h-52 w-80 max-w-[88vw] [perspective:900px]">
            <div className="absolute inset-0 rounded-md shadow-2xl" style={{ background: wax ? "#6E1F2E" : "#E9D8B4" }} />
            <motion.div className="absolute inset-x-3 bottom-3 top-3 rounded paper" initial={{ y: 0 }} animate={{ y: stage === "rise" ? -150 : 0 }} transition={{ duration: 0.9 }} />
            <div className="absolute inset-x-0 bottom-0 h-3/4 rounded-b-md" style={{ background: wax ? "#7d2838" : "#F0E2C4", clipPath: "polygon(0 100%,50% 25%,100% 100%)" }} />
            <motion.div className="absolute inset-x-0 top-0 h-1/2 origin-top rounded-t-md" style={{ background: wax ? "#5a1926" : "#E3D0A8", clipPath: "polygon(0 0,100% 0,50% 100%)" }}
              animate={{ rotateX: stage === "closed" ? 0 : 180, zIndex: stage === "closed" ? 3 : 0 }} transition={{ duration: 0.9 }} />
            {stage === "closed" && <span className="absolute left-1/2 top-[44%] z-10 h-9 w-9 -translate-x-1/2 rounded-full bg-burgundy shadow-lg ring-4 ring-rose/40" />}
          </button>
          <p className="mt-8 font-script text-3xl text-burgundy">{c.to || "To Toluwanimi, with love."}</p>
          {stage === "closed" && <p className="mt-2 text-sm text-ink/60">Tap the envelope</p>}
        </div>
      )}
      <AnimatePresence>
        {(stage === "read" || stage === "done") && (
          <motion.article key="paper" className="paper relative z-10 w-full max-w-2xl rounded-lg p-7 sm:p-12"
            initial={{ opacity: 0, scaleY: 0.2, y: 80 }} animate={{ opacity: 1, scaleY: 1, y: 0 }} transition={{ duration: 1.1, ease: "easeOut" }} style={{ transformOrigin: "top" }}>
            {c.title && <h1 className="font-serif text-3xl text-burgundy sm:text-4xl">{c.title}</h1>}
            {c.subtitle && <p className="mt-1 font-serif italic text-rose">{c.subtitle}</p>}
            {c.photos?.length > 0 && (
              <div className="my-6 flex gap-3 overflow-x-auto">
                {c.photos.map((p: string) => <img key={p} src={p} alt="" className="h-40 rounded shadow-md" />)}
              </div>
            )}
            <div className="mt-6 whitespace-pre-wrap text-2xl leading-[1.7] text-ink sm:text-[1.7rem]" style={{ fontFamily: font }}>
              {words.slice(0, shown).join("")}
              {shown < words.length && <span className="opacity-40">|</span>}
            </div>
            {c.signoff && shown >= words.length && <p className="mt-8 text-right text-3xl text-burgundy" style={{ fontFamily: font }}>{c.signoff}</p>}
            {stage === "done" && (
              <motion.p className="mt-10 text-center font-script text-3xl text-burgundy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }}>
                {c.closing || "Read it again whenever you like."}
              </motion.p>
            )}
            {stage === "done" && <button className="btn-ghost mx-auto mt-6 block" onClick={() => { setShown(0); setStage("read"); }}>Read again</button>}
          </motion.article>
        )}
      </AnimatePresence>
    </main>
  );
}
