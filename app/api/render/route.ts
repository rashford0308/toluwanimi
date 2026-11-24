import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";
import { ASPECTS } from "@/lib/types";

export async function POST(req: Request) {
  const sb = supabaseServer();
  const { experienceId, props, settings } = await req.json();

  // 1. Validate the project
  const problems: string[] = [];
  if (!props?.clips?.length) problems.push("Add at least one photo or video clip.");
  if (props?.clips?.some((c: any) => !c.src)) problems.push("A clip has no media selected.");
  if (props?.clips?.some((c: any) => !(c.duration > 0))) problems.push("Every clip needs a duration above 0.");
  if (!(settings?.aspect in ASPECTS)) problems.push("Choose an aspect ratio.");
  if (!["720p", "1080p"].includes(settings?.quality)) problems.push("Choose a quality.");
  if (problems.length) return NextResponse.json({ error: problems.join(" ") }, { status: 400 });

  // 2. Queue the job. The worker snapshot means later edits can't break a running render.
  const { data, error } = await sb.from("render_jobs")
    .insert({ experience_id: experienceId, props, settings: { aspect: settings.aspect, quality: settings.quality, fps: 30 } })
    .select("id").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ id: data.id });
}

export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  const { data, error } = await supabaseServer().from("render_jobs").select("id,status,progress,output_url,error,attempts").eq("id", id!).maybeSingle();
  if (error || !data) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(data);
}
