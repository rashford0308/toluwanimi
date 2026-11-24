import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const { slug, password } = await req.json();
  const db = supabaseAdmin();
  const { data: e } = await db.from("experiences").select("id,type,title,content").eq("slug", slug).eq("status", "published").eq("visibility", "password").maybeSingle();
  if (!e) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { data: sec } = await db.from("experience_secrets").select("password_hash").eq("experience_id", e.id).maybeSingle();
  if (!sec || !(await bcrypt.compare(String(password || ""), sec.password_hash))) {
    await new Promise((r) => setTimeout(r, 600)); // slow down guessing
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }
  return NextResponse.json({ type: e.type, title: e.title, content: e.content });
}
