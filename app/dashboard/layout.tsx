"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

const NAV = [
  ["/dashboard", "Overview"], ["/dashboard/opening", "Opening"], ["/dashboard/letter", "Love letters"],
  ["/dashboard/gallery", "Memory galleries"], ["/dashboard/slideshow", "Slideshows"], ["/dashboard/video", "Video studio"],
  ["/dashboard/surprise", "Surprises"], ["/dashboard/media", "Media library"], ["/dashboard/renders", "Renders"],
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const p = usePathname(); const r = useRouter(); const [open, setOpen] = useState(false);
  const nav = (
    <nav className="flex flex-col gap-1 p-4">
      {NAV.map(([h, l]) => (
        <Link key={h} href={h} onClick={() => setOpen(false)} className={`rounded-xl px-3 py-2 text-sm ${p === h ? "bg-burgundy text-ivory" : "hover:bg-blush/50"}`}>{l}</Link>
      ))}
      <button className="mt-4 px-3 py-2 text-left text-sm text-burgundy" onClick={async () => { await supabaseBrowser().auth.signOut(); r.push("/login"); }}>Sign out</button>
      <Link href="/" target="_blank" className="px-3 py-2 text-sm text-ink/60">View her site</Link>
    </nav>
  );
  return (
    <div className="min-h-screen bg-cream md:flex">
      <aside className="hidden w-56 shrink-0 border-r border-rose/30 bg-ivory md:block">{nav}</aside>
      <div className="flex items-center justify-between border-b border-rose/30 bg-ivory p-3 md:hidden">
        <span className="font-serif text-xl text-burgundy">Studio</span>
        <button className="btn-ghost !py-2" onClick={() => setOpen(!open)}>Menu</button>
      </div>
      {open && <div className="border-b border-rose/30 bg-ivory md:hidden">{nav}</div>}
      <main className="min-w-0 flex-1 p-4 md:p-8">{children}</main>
    </div>
  );
}
