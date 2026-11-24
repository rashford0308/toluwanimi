"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function Overview() {
  const [d, setD] = useState<any>(null);
  useEffect(() => { (async () => {
    const sb = supabaseBrowser();
    const [e, m, j] = await Promise.all([
      sb.from("experiences").select("id,title,type,status,updated_at").order("updated_at", { ascending: false }).limit(8),
      sb.from("media").select("size"), sb.from("render_jobs").select("id,status").order("created_at", { ascending: false }).limit(5),
    ]);
    setD({ exps: e.data || [], mb: ((m.data || []).reduce((a: number, r: any) => a + r.size, 0) / 1048576).toFixed(1), jobs: j.data || [] });
  })(); }, []);
  if (!d) return <p>Loading…</p>;
  return (
    <div className="space-y-6">
      <h1 className="font-serif text-3xl text-burgundy">Overview</h1>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="card"><p className="text-sm text-ink/60">Storage used</p><p className="font-serif text-3xl text-burgundy">{d.mb} MB</p></div>
        <div className="card"><p className="text-sm text-ink/60">Published</p><p className="font-serif text-3xl text-burgundy">{d.exps.filter((x: any) => x.status === "published").length}</p></div>
        <div className="card"><p className="text-sm text-ink/60">Renders in progress</p><p className="font-serif text-3xl text-burgundy">{d.jobs.filter((x: any) => ["queued", "rendering"].includes(x.status)).length}</p></div>
      </div>
      <div>
        <h2 className="mb-2 font-serif text-2xl text-burgundy">Recent work</h2>
        <div className="space-y-2">
          {d.exps.length === 0 && <p className="text-sm text-ink/60">Nothing yet. Start with a love letter.</p>}
          {d.exps.map((x: any) => (
            <Link key={x.id} href={`/dashboard/edit/${x.id}`} className="card flex justify-between"><span>{x.title}</span><span className="text-sm text-ink/60">{x.type} · {x.status}</span></Link>
          ))}
        </div>
      </div>
    </div>
  );
}
