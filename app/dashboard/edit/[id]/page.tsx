"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import MediaPicker from "@/components/MediaPicker";
import SortableList, { uid, withIds } from "@/components/SortableList";
import Viewer from "@/components/Viewer";
import { slugify, ASPECTS, type Experience } from "@/lib/types";

type Setter = (patch: any) => void;
const Label = ({ t, children }: { t: string; children: React.ReactNode }) => <label className="block text-sm">{t}<div className="mt-1">{children}</div></label>;

/* ---------- Letter ---------- */
function LetterEditor({ c, set }: { c: any; set: Setter }) {
  const [pick, setPick] = useState<null | "audio" | "photo">(null);
  return (
    <div className="space-y-3">
      <Label t="Envelope text"><input className="field" value={c.to || ""} placeholder="To Toluwanimi, with love." onChange={(e) => set({ to: e.target.value })} /></Label>
      <Label t="Title"><input className="field" value={c.title || ""} onChange={(e) => set({ title: e.target.value })} /></Label>
      <Label t="Subtitle"><input className="field" value={c.subtitle || ""} onChange={(e) => set({ subtitle: e.target.value })} /></Label>
      <Label t="Letter"><textarea className="field min-h-64" value={c.body || ""} onChange={(e) => set({ body: e.target.value })} /></Label>
      <Label t="Sign-off"><input className="field" value={c.signoff || ""} onChange={(e) => set({ signoff: e.target.value })} /></Label>
      <Label t="Closing message"><input className="field" value={c.closing || ""} onChange={(e) => set({ closing: e.target.value })} /></Label>
      <div className="grid grid-cols-2 gap-3">
        <Label t="Handwriting"><select className="field" value={c.font || "pinyon"} onChange={(e) => set({ font: e.target.value })}><option value="pinyon">Pinyon</option><option value="vibes">Great Vibes</option><option value="dancing">Dancing</option><option value="serif">Serif</option></select></Label>
        <Label t="Envelope"><select className="field" value={c.envelope || "classic"} onChange={(e) => set({ envelope: e.target.value })}><option value="classic">Champagne</option><option value="wax">Burgundy</option></select></Label>
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="btn-ghost" onClick={() => setPick("audio")}>{c.music ? "Change music" : "Add music"}</button>
        {c.music && <button className="btn-ghost" onClick={() => set({ music: undefined })}>Remove music</button>}
        <button className="btn-ghost" onClick={() => setPick("photo")}>Add photo</button>
      </div>
      <div className="flex gap-2 overflow-x-auto">{(c.photos || []).map((p: string) => <div key={p} className="relative"><img src={p} alt="" className="h-20 rounded" /><button className="absolute right-0 top-0 rounded bg-ivory px-1 text-xs" onClick={() => set({ photos: c.photos.filter((x: string) => x !== p) })}>×</button></div>)}</div>
      {pick && <MediaPicker kind={pick} onClose={() => setPick(null)} onPick={(m) => { pick === "audio" ? set({ music: m.url }) : set({ photos: [...(c.photos || []), m.url] }); setPick(null); }} />}
    </div>
  );
}

/* ---------- Gallery ---------- */
function GalleryEditor({ c, set }: { c: any; set: Setter }) {
  const [pick, setPick] = useState<null | "audio" | "photo">(null);
  const items = withIds(c.items);
  return (
    <div className="space-y-3">
      <Label t="Description"><textarea className="field" value={c.description || ""} onChange={(e) => set({ description: e.target.value })} /></Label>
      <div className="flex gap-2"><button className="btn-primary" onClick={() => setPick("photo")}>Add photo</button><button className="btn-ghost" onClick={() => setPick("audio")}>{c.music ? "Change music" : "Add music"}</button></div>
      <SortableList items={items} onChange={(n) => set({ items: n })} render={(it: any) => (
        <div className="flex gap-3"><img src={it.url} alt="" className="h-20 w-20 rounded object-cover" />
          <div className="flex-1 space-y-1"><input className="field" placeholder="Caption" value={it.caption || ""} onChange={(e) => set({ items: items.map((x) => x._id === it._id ? { ...x, caption: e.target.value } : x) })} />
            <input className="field" placeholder="Description" value={it.desc || ""} onChange={(e) => set({ items: items.map((x) => x._id === it._id ? { ...x, desc: e.target.value } : x) })} />
            <button className="text-xs text-burgundy" onClick={() => set({ items: items.filter((x) => x._id !== it._id) })}>Remove</button></div></div>
      )} />
      {pick && <MediaPicker kind={pick} onClose={() => setPick(null)} onPick={(m) => { pick === "audio" ? set({ music: m.url }) : set({ items: [...items, { _id: uid(), url: m.url }] }); if (pick === "audio") setPick(null); }} />}
    </div>
  );
}

/* ---------- Slideshow ---------- */
function SlideshowEditor({ c, set }: { c: any; set: Setter }) {
  const [pick, setPick] = useState<null | { kind: "audio" | "photo"; id?: string }>(null);
  const slides = withIds(c.slides);
  const up = (id: string, p: any) => set({ slides: slides.map((s: any) => s._id === id ? { ...s, ...p } : s) });
  return (
    <div className="space-y-3">
      <div className="flex gap-2"><button className="btn-primary" onClick={() => set({ slides: [...slides, { _id: uid(), duration: 5, transition: "fade", bg: "#FBF7F0" }] })}>Add slide</button><button className="btn-ghost" onClick={() => setPick({ kind: "audio" })}>{c.music ? "Change music" : "Add music"}</button></div>
      <SortableList items={slides} onChange={(n) => set({ slides: n })} render={(s: any) => (
        <div className="space-y-2">
          <div className="flex gap-2">{s.image && <img src={s.image} alt="" className="h-16 w-16 rounded object-cover" />}<button className="btn-ghost !py-1" onClick={() => setPick({ kind: "photo", id: s._id })}>{s.image ? "Change photo" : "Photo"}</button></div>
          <input className="field" placeholder="Text" value={s.text || ""} onChange={(e) => up(s._id, { text: e.target.value })} />
          <input className="field" placeholder="Subtitle" value={s.subtitle || ""} onChange={(e) => up(s._id, { subtitle: e.target.value })} />
          <div className="grid grid-cols-3 gap-2">
            <input className="field" type="number" min={1} value={s.duration} onChange={(e) => up(s._id, { duration: +e.target.value })} title="Seconds" />
            <select className="field" value={s.transition} onChange={(e) => up(s._id, { transition: e.target.value })}><option>fade</option><option>slide</option><option>zoom</option></select>
            <input type="color" className="h-10 w-full" value={s.bg || "#FBF7F0"} onChange={(e) => up(s._id, { bg: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <label>Brightness<input type="range" min={60} max={140} value={s.filter?.brightness ?? 100} onChange={(e) => up(s._id, { filter: { ...s.filter, brightness: +e.target.value } })} className="w-full" /></label>
            <label>Contrast<input type="range" min={60} max={140} value={s.filter?.contrast ?? 100} onChange={(e) => up(s._id, { filter: { ...s.filter, contrast: +e.target.value } })} className="w-full" /></label>
          </div>
          <div className="flex gap-3 text-xs"><label><input type="checkbox" checked={!!s.border} onChange={(e) => up(s._id, { border: e.target.checked })} /> Border</label><label><input type="checkbox" checked={!!s.shadow} onChange={(e) => up(s._id, { shadow: e.target.checked })} /> Shadow</label><button className="text-burgundy" onClick={() => set({ slides: slides.filter((x: any) => x._id !== s._id) })}>Remove</button></div>
        </div>
      )} />
      {pick && <MediaPicker kind={pick.kind} onClose={() => setPick(null)} onPick={(m) => { pick.kind === "audio" ? set({ music: m.url }) : up(pick.id!, { image: m.url }); setPick(null); }} />}
    </div>
  );
}

/* ---------- Surprises ---------- */
function SurpriseEditor({ c, set }: { c: any; set: Setter }) {
  const items = withIds(c.items);
  const up = (id: string, p: any) => set({ items: items.map((s: any) => s._id === id ? { ...s, ...p } : s) });
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button className="btn-primary" onClick={() => set({ items: [...items, { _id: uid(), kind: "reveal", prompt: "", message: "" }] })}>Add hidden message</button>
        <button className="btn-ghost" onClick={() => set({ items: [...items, { _id: uid(), kind: "countdown", label: "", date: "" }] })}>Add countdown</button>
      </div>
      <SortableList items={items} onChange={(n) => set({ items: n })} render={(s: any) => s.kind === "countdown" ? (
        <div className="space-y-1"><input className="field" placeholder="Label" value={s.label} onChange={(e) => up(s._id, { label: e.target.value })} /><input className="field" type="datetime-local" value={s.date} onChange={(e) => up(s._id, { date: e.target.value })} />
          <input className="field" placeholder="Text when it arrives" value={s.doneText || ""} onChange={(e) => up(s._id, { doneText: e.target.value })} />
          <button className="text-xs text-burgundy" onClick={() => set({ items: items.filter((x: any) => x._id !== s._id) })}>Remove</button></div>
      ) : (
        <div className="space-y-1"><input className="field" placeholder="Prompt or question shown first" value={s.prompt} onChange={(e) => up(s._id, { prompt: e.target.value })} /><textarea className="field" placeholder="Hidden message" value={s.message} onChange={(e) => up(s._id, { message: e.target.value })} />
          <button className="text-xs text-burgundy" onClick={() => set({ items: items.filter((x: any) => x._id !== s._id) })}>Remove</button></div>
      )} />
    </div>
  );
}

/* ---------- Video studio ---------- */
const STYLES = [["cinematic", "Cinematic Memories"], ["photofilm", "Romantic Photo Film"], ["letter", "Animated Love Letter"], ["timeline", "Memory Timeline"], ["collage", "Photo Collage Film"], ["birthday", "Birthday / Occasion"], ["freeform", "Freeform Custom"]];

function VideoEditor({ c, set, expId }: { c: any; set: Setter; expId: string }) {
  const [pick, setPick] = useState<null | { kind: "visual" | "audio"; id?: string }>(null);
  const [job, setJob] = useState<any>(null); const [err, setErr] = useState("");
  const clips = withIds(c.clips);
  const colors = c.colors || { bg: "#FBF7F0", accent: "#6E1F2E", text: "#3A2A2A" };
  const music = c.music;
  const aspect = c.aspect || "16:9", quality = c.quality || "1080p";
  const up = (id: string, p: any) => set({ clips: clips.map((s: any) => s._id === id ? { ...s, ...p } : s) });
  const total = clips.reduce((a: number, x: any) => a + (+x.duration || 0), 0);

  useEffect(() => {
    if (!job || ["done", "failed"].includes(job.status)) return;
    const t = setInterval(async () => { const r = await fetch(`/api/render?id=${job.id}`); if (r.ok) { const j = await r.json(); setJob(j); if (j.status === "done") set({ outputUrl: j.output_url }); } }, 2000);
    return () => clearInterval(t);
  }, [job?.id, job?.status]); // eslint-disable-line

  const render = async () => {
    setErr("");
    const props = { style: c.style || "cinematic", title: c.title || "", subtitle: c.subtitle || "", colors, clips: clips.map(({ _id, ...x }: any) => x), music: music?.src ? music : undefined, textOverlays: c.textOverlays || [] };
    const r = await fetch("/api/render", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ experienceId: expId, props, settings: { aspect, quality } }) });
    const j = await r.json(); if (!r.ok) return setErr(j.error);
    setJob({ id: j.id, status: "queued", progress: 0 });
  };
  const retry = async () => { await fetch("/api/render/retry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: job.id }) }); setJob({ ...job, status: "queued", progress: 0, error: null }); };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Label t="Style"><select className="field" value={c.style || "cinematic"} onChange={(e) => set({ style: e.target.value })}>{STYLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Label>
        <Label t="Title"><input className="field" value={c.title || ""} onChange={(e) => set({ title: e.target.value })} /></Label>
        <Label t="Subtitle"><input className="field" value={c.subtitle || ""} onChange={(e) => set({ subtitle: e.target.value })} /></Label>
        <div className="grid grid-cols-3 gap-2 text-xs">{(["bg", "accent", "text"] as const).map((k) => <label key={k}>{k}<input type="color" className="h-10 w-full" value={colors[k]} onChange={(e) => set({ colors: { ...colors, [k]: e.target.value } })} /></label>)}</div>
      </div>

      <h3 className="font-serif text-xl text-burgundy">Timeline · {total}s</h3>
      <div className="card text-xs text-ink/60">Track 1 (photos and clips) is the list below; drag the handle to reorder. Track 2 is music, further down.</div>
      <div className="flex gap-2"><button className="btn-primary" onClick={() => setPick({ kind: "visual" })}>Add photo or clip</button></div>
      <SortableList items={clips} onChange={(n) => set({ clips: n })} render={(s: any) => (
        <div className="space-y-2">
          <div className="flex gap-2">{s.kind === "video" ? <video src={s.src} className="h-16 w-16 rounded object-cover" muted /> : <img src={s.src} alt="" className="h-16 w-16 rounded object-cover" />}<span className="self-center text-xs">{s.kind}</span></div>
          <input className="field" placeholder="Caption" value={s.caption || ""} onChange={(e) => up(s._id, { caption: e.target.value })} />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <label className="text-xs">Seconds<input className="field" type="number" min={1} step={0.5} value={s.duration} onChange={(e) => up(s._id, { duration: +e.target.value })} /></label>
            {s.kind === "video" && <label className="text-xs">Trim start (s)<input className="field" type="number" min={0} step={0.5} value={s.trimStart || 0} onChange={(e) => up(s._id, { trimStart: +e.target.value })} /></label>}
            <label className="text-xs">Date<input className="field" value={s.date || ""} placeholder="e.g. June 2024" onChange={(e) => up(s._id, { date: e.target.value })} /></label>
            <label className="text-xs">Transition<select className="field" value={s.transition || "fade"} onChange={(e) => up(s._id, { transition: e.target.value })}><option>fade</option><option>slide</option><option>zoom</option></select></label>
          </div>
          {s.kind === "video" && <label className="text-xs"><input type="checkbox" checked={!!s.keepAudio} onChange={(e) => up(s._id, { keepAudio: e.target.checked })} /> Keep original audio</label>}
          <button className="block text-xs text-burgundy" onClick={() => set({ clips: clips.filter((x: any) => x._id !== s._id) })}>Remove</button>
        </div>
      )} />

      <h3 className="font-serif text-xl text-burgundy">Music</h3>
      <div className="card space-y-2">
        <button className="btn-ghost" onClick={() => setPick({ kind: "audio" })}>{music?.src ? "Change track" : "Choose track"}</button>
        {music?.src && <>
          <audio src={music.src} controls className="w-full" />
          <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
            <label>Volume<input type="range" min={0} max={1} step={0.05} value={music.volume} className="w-full" onChange={(e) => set({ music: { ...music, volume: +e.target.value } })} /></label>
            <label>Start at (s)<input className="field" type="number" min={0} value={music.start} onChange={(e) => set({ music: { ...music, start: +e.target.value } })} /></label>
            <label>Fade in (s)<input className="field" type="number" min={0} value={music.fadeIn} onChange={(e) => set({ music: { ...music, fadeIn: +e.target.value } })} /></label>
            <label>Fade out (s)<input className="field" type="number" min={0} value={music.fadeOut} onChange={(e) => set({ music: { ...music, fadeOut: +e.target.value } })} /></label>
          </div>
          <button className="text-xs text-burgundy" onClick={() => set({ music: undefined })}>Remove music</button>
        </>}
      </div>

      <h3 className="font-serif text-xl text-burgundy">Render</h3>
      <div className="card space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <Label t="Aspect ratio"><select className="field" value={aspect} onChange={(e) => set({ aspect: e.target.value })}>{Object.keys(ASPECTS).map((a) => <option key={a}>{a}</option>)}</select></Label>
          <Label t="Quality"><select className="field" value={quality} onChange={(e) => set({ quality: e.target.value })}><option>1080p</option><option>720p</option></select></Label>
        </div>
        <button className="btn-primary w-full" onClick={render} disabled={!!job && ["queued", "rendering"].includes(job.status)}>Render video</button>
        {err && <p className="text-sm text-burgundy">{err}</p>}
        {job && <div className="space-y-2">
          <p className="text-sm">Status: <b>{job.status}</b> {job.status === "rendering" && `· ${job.progress}%`}</p>
          <div className="h-2 rounded bg-blush/50"><div className="h-2 rounded bg-burgundy transition-all" style={{ width: `${job.status === "done" ? 100 : job.progress}%` }} /></div>
          {job.error && <p className="text-sm text-burgundy">{job.error}</p>}
          {job.status === "failed" && <button className="btn-ghost" onClick={retry}>Retry</button>}
          {job.status === "queued" && <p className="text-xs text-ink/60">Waiting for the render worker. Make sure <code>npm run worker</code> is running.</p>}
          {job.output_url && <><video src={job.output_url} controls playsInline className="w-full rounded" /><a className="btn-primary" href={job.output_url} download target="_blank">Download MP4</a></>}
        </div>}
        {c.outputUrl && !job && <video src={c.outputUrl} controls playsInline className="w-full rounded" />}
      </div>
      {pick && <MediaPicker kind={pick.kind} onClose={() => setPick(null)} onPick={(m) => {
        if (pick.kind === "audio") set({ music: { src: m.url, volume: 0.6, fadeIn: 2, fadeOut: 3, start: 0 } });
        else set({ clips: [...clips, { _id: uid(), kind: m.kind, src: m.url, duration: m.kind === "video" ? 6 : 4, transition: "fade" }] });
        setPick(null);
      }} />}
    </div>
  );
}

/* ---------- Page ---------- */
export default function Edit() {
  const { id } = useParams<{ id: string }>(); const r = useRouter(); const sb = supabaseBrowser();
  const [e, setE] = useState<Experience | null>(null); const [status, setStatus] = useState("");
  const [pw, setPw] = useState(""); const [preview, setPreview] = useState(false);
  const timer = useRef<any>(null); const latest = useRef<Experience | null>(null);

  useEffect(() => { sb.from("experiences").select("*").eq("id", id).single().then(({ data }) => { setE(data as any); latest.current = data as any; }); }, [id]); // eslint-disable-line

  const save = async (n: Experience) => {
    setStatus("Saving…");
    const { error } = await sb.from("experiences").update({ title: n.title, slug: n.slug, status: n.status, visibility: n.visibility, content: n.content }).eq("id", n.id);
    setStatus(error ? (error.message.includes("duplicate") ? "That link name is already taken." : error.message) : "All changes saved");
  };
  const change = (patch: Partial<Experience>) => {
    const n = { ...latest.current!, ...patch } as Experience; latest.current = n; setE(n);
    clearTimeout(timer.current); timer.current = setTimeout(() => save(n), 1200); setStatus("Unsaved changes");
  };
  const setContent: Setter = (p) => change({ content: { ...latest.current!.content, ...p } });
  useEffect(() => () => { clearTimeout(timer.current); }, []);

  const setPassword = async () => {
    const res = await fetch("/api/password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ experienceId: id, password: pw }) });
    setStatus(res.ok ? "Password set" : (await res.json()).error); setPw("");
  };
  const del = async () => { if (confirm("Delete this permanently?")) { await sb.from("experiences").delete().eq("id", id); r.push(`/dashboard/${e!.type}`); } };

  if (!e) return <p>Loading…</p>;
  const url = typeof window !== "undefined" ? `${location.origin}/toluwanimi/${e.slug}` : "";
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <input className="field !w-auto flex-1 font-serif text-2xl" value={e.title} onChange={(ev) => change({ title: ev.target.value })} />
        <span className="text-xs text-ink/60">{status}</span>
      </div>

      <div className="card space-y-3">
        <h3 className="font-serif text-xl text-burgundy">Publishing</h3>
        <div className="grid gap-2 sm:grid-cols-3">
          <Label t="Link name"><input className="field" value={e.slug} onChange={(ev) => change({ slug: slugify(ev.target.value) })} /></Label>
          <Label t="Who can open it"><select className="field" value={e.visibility} onChange={(ev) => change({ visibility: ev.target.value as any })}><option value="unlisted">Unlisted (link only)</option><option value="public">Public (on her home page)</option><option value="password">Password</option></select></Label>
          <Label t="Status"><select className="field" value={e.status} onChange={(ev) => change({ status: ev.target.value as any })}><option value="draft">Draft</option><option value="published">Published</option></select></Label>
        </div>
        {e.visibility === "password" && <div className="flex gap-2"><input className="field" type="password" placeholder="New password" value={pw} onChange={(ev) => setPw(ev.target.value)} /><button className="btn-ghost" onClick={setPassword}>Set password</button></div>}
        <p className="break-all text-xs text-ink/60">{url}</p>
        <div className="flex flex-wrap gap-2"><button className="btn-ghost" onClick={() => navigator.clipboard.writeText(url)}>Copy link</button><button className="btn-ghost" onClick={() => setPreview(true)}>Preview</button><button className="btn-ghost" onClick={del}>Delete</button></div>
      </div>

      {e.type === "letter" && <LetterEditor c={e.content} set={setContent} />}
      {e.type === "gallery" && <GalleryEditor c={e.content} set={setContent} />}
      {e.type === "slideshow" && <SlideshowEditor c={e.content} set={setContent} />}
      {e.type === "surprise" && <SurpriseEditor c={e.content} set={setContent} />}
      {e.type === "video" && <VideoEditor c={e.content} set={setContent} expId={e.id} />}

      {preview && <div className="fixed inset-0 z-50 overflow-auto bg-ivory"><button className="btn-primary fixed left-4 top-4 z-[60]" onClick={() => setPreview(false)}>Close preview</button><Viewer exp={e} /></div>}
    </div>
  );
}
