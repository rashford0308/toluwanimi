import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { id } = await req.json();
  const { error } = await supabaseServer().from("render_jobs").update({ status: "queued", progress: 0, error: null }).eq("id", id).eq("status", "failed");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
