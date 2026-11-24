import Home from "@/components/Home";
import { supabaseServer } from "@/lib/supabase/server";
import { DEFAULT_OPENING } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Page() {
  const sb = supabaseServer();
  const [{ data: s }, { data: items }] = await Promise.all([
    sb.from("site_settings").select("opening").limit(1).maybeSingle(),
    sb.from("experiences").select("slug,title,type").eq("status", "published").eq("visibility", "public").order("updated_at", { ascending: false }),
  ]);
  return <Home opening={{ ...DEFAULT_OPENING, ...(s?.opening || {}) }} items={items || []} />;
}
