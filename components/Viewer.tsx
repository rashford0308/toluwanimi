"use client";
import Letter from "./Letter";
import Gallery from "./Gallery";
import Slideshow from "./Slideshow";
import Surprise from "./Surprise";
import type { Experience } from "@/lib/types";

export default function Viewer({ exp }: { exp: Pick<Experience, "type" | "title" | "content"> }) {
  const c = exp.content || {};
  switch (exp.type) {
    case "letter": return <Letter c={c} title={exp.title} />;
    case "gallery": return <Gallery c={c} title={exp.title} />;
    case "slideshow": return <Slideshow c={c} />;
    case "surprise": return <Surprise c={c} title={exp.title} />;
    case "video":
      return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-ink p-4">
          {c.outputUrl ? <video src={c.outputUrl} controls playsInline className="max-h-[85vh] max-w-full rounded-lg" />
            : <p className="text-ivory">This video isn&apos;t ready yet.</p>}
          <h1 className="mt-4 font-serif text-xl text-ivory">{exp.title}</h1>
        </main>
      );
  }
}
