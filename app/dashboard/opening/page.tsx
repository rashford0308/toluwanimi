"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";
import MediaPicker from "@/components/MediaPicker";
import Opening from "@/components/Opening";
import { DEFAULT_OPENING, type OpeningSettings } from "@/lib/types";

export default function OpeningEditor() {
  const sb = supabaseBrowser();
  const [s, setS] = useState<OpeningSettings>(DEFAULT_OPENING); const [pick, setPick] = useState<null | "audio" | "photo">(null);
  const [saved, setSaved] = useState(""); const [preview, setPreview] = useState(false);
  useEffect(() => { sb.from("site_settings").select("opening").maybeSingle().then(({ data }) => data && setS({ ...DEFAULT_OPENING, ...data.opening })); }, []); // eslint-disable-line
  const save = async () => {
    const { data: { user } } = await sb.auth.getUser();
    const { error } = await sb.from("site_settings").upsert({ owner_id: user!.id, opening: s });
    setSaved(error ? error.message : "Saved"); setTimeout(() => setSaved(""), 2000);
  };
  const set = (k: keyof OpeningSettings, v: any) => setS({ ...s, [k]: v });
  return (
    <div className="max-w-xl space-y-3">
      <h1 className="font-serif text-3xl text-burgundy">Cinematic opening</h1>
      <label className="block text-sm">Main line<input className="field mt-1" value={s.line1} onChange={(e) => set("line1", e.target.value)} /></label>
      <label className="block text-sm">Second line<input className="field mt-1" value={s.line2} onChange={(e) => set("line2", e.target.value)} /></label>
      <label className="block text-sm">Button text<input className="field mt-1" value={s.button} onChange={(e) => set("button", e.target.value)} /></label>
      <label className="block text-sm">Closing message (shown on her home page)<input className="field mt-1" value={s.closing} onChange={(e) => set("closing", e.target.value)} /></label>
      <label className="block text-sm">Theme
        <select className="field mt-1" value={s.theme} onChange={(e) => set("theme", e.target.value)}><option value="petals">Petals on ivory</option><option value="glow">Champagne glow</option><option value="dusk">Burgundy dusk</option></select>
      </label>
      <div className="flex flex-wrap gap-2">
        <button className="btn-ghost" onClick={() => setPick("audio")}>{s.musicUrl ? "Change music" : "Choose music"}</button>
        <button className="btn-ghost" onClick={() => setPick("photo")}>{s.bgUrl ? "Change background photo" : "Choose background photo"}</button>
        {s.musicUrl && <button className="btn-ghost" onClick={() => set("musicUrl", undefined)}>Remove music</button>}
        {s.bgUrl && <button className="btn-ghost" onClick={() => set("bgUrl", undefined)}>Remove background</button>}
      </div>
      <div className="flex gap-2"><button className="btn-primary" onClick={save}>Save</button><button className="btn-ghost" onClick={() => setPreview(true)}>Preview</button><span className="self-center text-sm">{saved}</span></div>
      {pick && <MediaPicker kind={pick} onClose={() => setPick(null)} onPick={(m) => { set(pick === "audio" ? "musicUrl" : "bgUrl", m.url); setPick(null); }} />}
      {preview && <Opening s={s} onOpen={() => setPreview(false)} />}
    </div>
  );
}
