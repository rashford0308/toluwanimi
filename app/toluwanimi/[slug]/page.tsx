import { notFound } from "next/navigation";
import Viewer from "@/components/Viewer";
import PasswordGate from "@/components/PasswordGate";
import { supabaseServer, supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: { slug: string } }) {
  // Anon RLS only returns published public/unlisted rows.
  const { data } = await supabaseServer().from("experiences").select("type,title,content").eq("slug", params.slug).maybeSingle();
  if (data) return <Viewer exp={data as any} />;
  // Password-protected experiences aren't readable by anon; check existence with the service role.
  const { data: locked } = await supabaseAdmin().from("experiences").select("id").eq("slug", params.slug).eq("status", "published").eq("visibility", "password").maybeSingle();
  if (locked) return <PasswordGate slug={params.slug} />;
  notFound();
}
