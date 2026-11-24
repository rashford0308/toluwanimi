"use client";
import { useRef, useState } from "react";
export default function MusicButton({ src }: { src?: string }) {
  const a = useRef<HTMLAudioElement>(null); const [on, setOn] = useState(false);
  if (!src) return null;
  return (
    <>
      <audio ref={a} src={src} loop />
      <button aria-label={on ? "Pause music" : "Play music"} className="btn-ghost fixed right-4 top-4 z-40 bg-ivory/80 backdrop-blur"
        onClick={() => { if (on) a.current?.pause(); else a.current?.play(); setOn(!on); }}>{on ? "Music on" : "Play music"}</button>
    </>
  );
}
