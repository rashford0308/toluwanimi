"use client";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function Renders() {
  const sb = supabaseBrowser(); const [rows, setRows] = useState<any[]>([]);
  const load = () => sb.from("render_jobs").select("id,status,progress,output_url,error,settings,created_at").order("created_at", { ascending: false }).limit(50).then(({ data }) => setRows(data || []));
  useEffect(() => { load(); const t = setInterval(load, 4000); return () => clearInterval(t); }, []); // eslint-disable-line
  return (
    <div className="space-y-3">
      <h1 className="font-serif text-3xl text-burgundy">Render history</h1>
      {rows.map((j) => (
        <div key={j.id} className="card space-y-1">
          <p className="text-sm">{new Date(j.created_at).toLocaleString()} · {j.settings.aspect} · {j.settings.quality} · <b>{j.status}</b> {j.status === "rendering" && `${j.progress}%`}</p>
          {j.error && <p className="text-sm text-burgundy">{j.error}</p>}
          {j.output_url && <a className="btn-primary" href={j.output_url} download target="_blank">Download MP4</a>}
          {j.status === "failed" && <button className="btn-ghost" onClick={async () => { await fetch("/api/render/retry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: j.id }) }); load(); }}>Retry</button>}
        </div>
      ))}
    </div>
  );
}
