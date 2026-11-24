"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import Opening from "./Opening";
import Petals from "./Petals";
import type { OpeningSettings } from "@/lib/types";

const LABEL: Record<string, string> = { letter: "Letter", gallery: "Gallery", slideshow: "Slideshow", video: "Film", surprise: "Surprise" };

export default function Home({ opening, items }: { opening: OpeningSettings; items: { slug: string; title: string; type: string }[] }) {
  const [opened, setOpened] = useState(true);
  useEffect(() => { if (!sessionStorage.getItem("opened")) setOpened(false); }, []);
  const done = () => { sessionStorage.setItem("opened", "1"); setOpened(true); };
  return (
    <>
      <AnimatePresence>{!opened && <Opening s={opening} onOpen={done} />}</AnimatePresence>
      <main className="relative min-h-screen bg-ivory px-5 py-16">
        <Petals density={12} />
        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <motion.h1 className="font-script text-6xl text-burgundy sm:text-7xl" initial={{ opacity: 0 }} animate={{ opacity: opened ? 1 : 0 }} transition={{ delay: 0.4, duration: 1.4 }}>
            For Toluwanimi
          </motion.h1>
          {opening.closing && <p className="mt-4 font-serif text-xl italic text-ink/70">{opening.closing}</p>}
          <div className="mt-12 grid gap-4 text-left sm:grid-cols-2">
            {items.length === 0 && <p className="col-span-full text-center text-ink/60">Something is on its way.</p>}
            {items.map((e) => (
              <Link key={e.slug} href={`/toluwanimi/${e.slug}`} className="card transition hover:-translate-y-1 hover:shadow-lg">
                <p className="text-xs text-rose">{LABEL[e.type]}</p>
                <p className="mt-1 font-serif text-2xl text-burgundy">{e.title}</p>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
