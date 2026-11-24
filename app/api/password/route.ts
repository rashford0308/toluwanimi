import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseServer } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const sb = supabaseServer();
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { experienceId, password } = await req.json();
  if (!password || String(password).length < 4) return NextResponse.json({ error: "Password too short" }, { status: 400 });
  const { data: e } = await sb.from("experiences").select("id").eq("id", experienceId).maybeSingle(); // RLS: owner only
  if (!e) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const hash = await bcrypt.hash(String(password), 10);
  const { error } = await sb.from("experience_secrets").upsert({ experience_id: e.id, password_hash: hash });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
