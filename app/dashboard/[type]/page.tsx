"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";
import { slugify, type Experience } from "@/lib/types";

const NAMES: Record<string, string> = { letter: "Love letters", gallery: "Memory galleries", slideshow: "Slideshows", video: "Video studio", surprise: "Surprises" };

export default function List() {
  const { type } = useParams<{ type: string }>(); const r = useRouter(); const sb = supabaseBrowser();
  const [rows, setRows] = useState<Experience[]>([]); const [err, setErr] = useState("");
  const load = () => sb.from("experiences").select("*").eq("type", type).order("updated_at", { ascending: false }).then(({ data }) => setRows((data as any) || []));
  useEffect(() => { load(); }, [type]); // eslint-disable-line

  const create = async (from?: Experience) => {
    const title = from ? `${from.title} (copy)` : "Untitled";
    const slug = `${slugify(title)}-${Math.random().toString(36).slice(2, 6)}`;
    const { data, error } = await sb.from("experiences").insert({ type, title, slug, content: from?.content || {} }).select("id").single();
    if (error) return setErr(error.message);
    r.push(`/dashboard/edit/${data.id}`);
  };
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="font-serif text-3xl text-burgundy">{NAMES[type]}</h1><button className="btn-primary" onClick={() => create()}>New</button></div>
      {err && <p className="text-sm text-burgundy">{err}</p>}
      {rows.length === 0 && <p className="text-sm text-ink/60">Nothing here yet.</p>}
      {rows.map((x) => (
        <div key={x.id} className="card flex items-center justify-between gap-2">
          <Link href={`/dashboard/edit/${x.id}`} className="min-w-0 flex-1"><p className="truncate font-serif text-xl">{x.title}</p><p className="text-xs text-ink/60">{x.status} · {x.visibility} · /toluwanimi/{x.slug}</p></Link>
          <button className="btn-ghost !py-1" onClick={() => create(x)}>Duplicate</button>
        </div>
      ))}
    </div>
  );
}
