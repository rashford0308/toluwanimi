"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import MusicButton from "./MusicButton";

export default function Gallery({ c, title }: { c: any; title: string }) {
  const items: any[] = c.items || [];
  const [i, setI] = useState<number | null>(null);
  const go = (d: number) => setI((v) => (v === null ? v : (v + d + items.length) % items.length));
  useEffect(() => {
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setI(null); if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); };
    addEventListener("keydown", k); return () => removeEventListener("keydown", k);
  }); // eslint-disable-line
  return (
    <main className="min-h-screen bg-ivory px-4 py-14">
      <MusicButton src={c.music} />
      <header className="mx-auto mb-10 max-w-2xl text-center">
        <h1 className="font-script text-5xl text-burgundy sm:text-6xl">{title}</h1>
        {c.description && <p className="mt-4 font-serif text-lg italic text-ink/70">{c.description}</p>}
      </header>
      <div className="mx-auto max-w-6xl columns-2 gap-3 sm:columns-3 lg:columns-4 [&>*]:mb-3">
        {items.map((it, n) => (
          <motion.button key={it.url + n} onClick={() => setI(n)} className="group relative block w-full overflow-hidden rounded-lg shadow-md"
            initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.7 }}>
            <img src={it.url} alt={it.caption || ""} loading="lazy" className="w-full transition duration-700 group-hover:scale-105" />
            {it.caption && <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-burgundy/70 to-transparent p-3 text-left text-sm text-ivory">{it.caption}</span>}
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {i !== null && items[i] && (
          <motion.div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ink/90 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setI(null)}>
            <motion.img key={i} src={items[i].url} alt="" className="max-h-[75vh] max-w-full rounded shadow-2xl" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              drag="x" dragConstraints={{ left: 0, right: 0 }} onDragEnd={(_, info) => { if (info.offset.x < -60) go(1); else if (info.offset.x > 60) go(-1); }} onClick={(e) => e.stopPropagation()} />
            <div className="mt-4 max-w-xl text-center text-ivory" onClick={(e) => e.stopPropagation()}>
              {items[i].caption && <p className="font-serif text-xl">{items[i].caption}</p>}
              {items[i].desc && <p className="mt-1 text-sm opacity-70">{items[i].desc}</p>}
            </div>
            <div className="mt-4 flex gap-3" onClick={(e) => e.stopPropagation()}>
              <button className="btn-ghost !text-ivory" onClick={() => go(-1)}>Previous</button>
              <button className="btn-ghost !text-ivory" onClick={() => setI(null)}>Close</button>
              <button className="btn-ghost !text-ivory" onClick={() => go(1)}>Next</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
