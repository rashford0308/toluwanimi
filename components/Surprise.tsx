"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

function Countdown({ it }: { it: any }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { const t = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(t); }, []);
  const ms = Math.max(0, new Date(it.date).getTime() - now);
  const d = Math.floor(ms / 864e5), h = Math.floor(ms / 36e5) % 24, m = Math.floor(ms / 6e4) % 60, s = Math.floor(ms / 1e3) % 60;
  return (
    <div className="card text-center">
      <p className="font-serif text-xl text-burgundy">{it.label}</p>
      <p className="mt-2 font-serif text-4xl text-burgundy">{ms ? `${d}d ${h}h ${m}m ${s}s` : it.doneText || "It's today."}</p>
    </div>
  );
}

function Reveal({ it }: { it: any }) {
  const [open, setOpen] = useState(false);
  return (
    <button className="card w-full text-left" onClick={() => setOpen(!open)}>
      <p className="font-serif text-xl text-burgundy">{it.prompt || "Tap to reveal"}</p>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            {it.image && <img src={it.image} alt="" className="mt-3 max-h-72 rounded" />}
            <p className="mt-3 font-script text-3xl text-burgundy">{it.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

export default function Surprise({ c, title }: { c: any; title: string }) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-ivory to-blush/30 px-4 py-14">
      <h1 className="mb-8 text-center font-script text-5xl text-burgundy">{title}</h1>
      <div className="mx-auto flex max-w-xl flex-col gap-4">
        {(c.items || []).map((it: any, n: number) =>
          it.kind === "countdown" ? <Countdown key={n} it={it} /> : <Reveal key={n} it={it} />)}
      </div>
    </main>
  );
}
