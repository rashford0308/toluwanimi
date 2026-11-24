"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { MediaRow } from "@/lib/types";

export default function MediaPicker({ kind, onPick, onClose }: { kind: MediaRow["kind"] | "visual"; onPick: (m: MediaRow) => void; onClose: () => void }) {
  const [rows, setRows] = useState<MediaRow[]>([]);
  useEffect(() => {
    const q = supabaseBrowser().from("media").select("*").order("created_at", { ascending: false });
    (kind === "visual" ? q.in("kind", ["photo", "video"]) : q.eq("kind", kind)).then(({ data }) => setRows((data as any) || []));
  }, [kind]);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 sm:items-center" onClick={onClose}>
      <div className="max-h-[80vh] w-full max-w-3xl overflow-auto rounded-t-3xl bg-ivory p-4 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex justify-between"><h3 className="font-serif text-2xl text-burgundy">Choose from library</h3><button className="btn-ghost !py-1" onClick={onClose}>Close</button></div>
        {rows.length === 0 && <p className="text-sm text-ink/60">Nothing here yet. Upload files in the Media library first.</p>}
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {rows.map((m) => (
            <button key={m.id} onClick={() => onPick(m)} className="overflow-hidden rounded-lg border border-rose/30 text-left">
              {m.kind === "photo" ? <img src={m.url} alt="" className="aspect-square w-full object-cover" />
                : m.kind === "video" ? <video src={m.url} className="aspect-square w-full object-cover" muted preload="metadata" />
                : <div className="flex aspect-square items-center justify-center p-2 text-xs">{m.name}</div>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
