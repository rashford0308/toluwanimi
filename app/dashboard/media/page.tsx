"use client";
import { useCallback, useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { MediaRow } from "@/lib/types";

const LIMITS = { photo: 25, video: 500, audio: 50 } as const; // MB per file
const TOTAL_MB = 900; // soft cap; Supabase free tier is 1 GB
const kindOf = (f: File): MediaRow["kind"] | null =>
  f.type.startsWith("image/") ? "photo" : f.type.startsWith("video/") ? "video" : f.type.startsWith("audio/") ? "audio" : null;

export default function Media() {
  const sb = supabaseBrowser();
  const [rows, setRows] = useState<MediaRow[]>([]); const [tab, setTab] = useState<MediaRow["kind"]>("photo");
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false);
  const load = useCallback(async () => { const { data } = await sb.from("media").select("*").order("created_at", { ascending: false }); setRows((data as any) || []); }, []); // eslint-disable-line
  useEffect(() => { load(); }, [load]);
  const used = rows.reduce((a, r) => a + r.size, 0) / 1048576;

  const upload = async (files: FileList | null) => {
    if (!files) return; setBusy(true); setMsg("");
    const { data: { user } } = await sb.auth.getUser();
    for (const f of Array.from(files)) {
      const k = kindOf(f);
      if (!k) { setMsg(`${f.name}: unsupported file type.`); continue; }
      if (f.size > LIMITS[k] * 1048576) { setMsg(`${f.name}: over the ${LIMITS[k]} MB limit for ${k}s.`); continue; }
      if (used + f.size / 1048576 > TOTAL_MB) { setMsg("Storage is nearly full. Delete some media first."); break; }
      const path = `${user!.id}/${crypto.randomUUID()}-${f.name.replace(/[^\w.\-]/g, "_")}`;
      const up = await sb.storage.from("media").upload(path, f, { contentType: f.type, upsert: false });
      if (up.error) { setMsg(`${f.name}: ${up.error.message}`); continue; }
      const url = sb.storage.from("media").getPublicUrl(path).data.publicUrl;
      await sb.from("media").insert({ kind: k, path, url, name: f.name, size: f.size });
    }
    setBusy(false); load();
  };
  const del = async (m: MediaRow) => { if (!confirm(`Delete ${m.name}?`)) return; await sb.storage.from("media").remove([m.path]); await sb.from("media").delete().eq("id", m.id); load(); };

  return (
    <div className="space-y-4">
      <h1 className="font-serif text-3xl text-burgundy">Media library</h1>
      <div className="card">
        <p className="text-sm">Storage: {used.toFixed(1)} MB of {TOTAL_MB} MB</p>
        <div className="mt-2 h-2 rounded bg-blush/50"><div className="h-2 rounded bg-burgundy" style={{ width: `${Math.min(100, (used / TOTAL_MB) * 100)}%` }} /></div>
        <label className="btn-primary mt-4 cursor-pointer">{busy ? "Uploading…" : "Upload photos, videos or music"}
          <input type="file" multiple accept="image/*,video/*,audio/*" className="hidden" onChange={(e) => upload(e.target.files)} disabled={busy} />
        </label>
        {msg && <p className="mt-2 text-sm text-burgundy">{msg}</p>}
      </div>
      <div className="flex gap-2">{(["photo", "video", "audio"] as const).map((k) => <button key={k} className={tab === k ? "btn-primary" : "btn-ghost"} onClick={() => setTab(k)}>{k === "photo" ? "Photos" : k === "video" ? "Videos" : "Music"}</button>)}</div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        {rows.filter((r) => r.kind === tab).map((m) => (
          <div key={m.id} className="card !p-2">
            {m.kind === "photo" ? <img src={m.url} alt="" className="aspect-square w-full rounded object-cover" />
              : m.kind === "video" ? <video src={m.url} controls className="aspect-square w-full rounded object-cover" preload="metadata" />
              : <audio src={m.url} controls className="w-full" />}
            <p className="mt-1 truncate text-xs">{m.name}</p>
            <button className="text-xs text-burgundy" onClick={() => del(m)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
