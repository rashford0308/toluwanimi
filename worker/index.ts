/**
 * Render worker. Run it on a machine with enough CPU/RAM (your PC, or a small VPS):
 *   npm run worker
 * It polls Supabase for queued render_jobs, renders them with Remotion, uploads the MP4
 * to the "media" bucket under renders/, and updates the job row.
 */
import { config } from "dotenv";
import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

config({ path: ".env.local" }); config();
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
const MAX_ATTEMPTS = 2;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let bundled: string | null = null;

async function getBundle() {
  if (!bundled) {
    console.log("Bundling Remotion project…");
    bundled = await bundle({ entryPoint: path.resolve("remotion/index.ts") });
  }
  return bundled;
}

async function claim() {
  const { data: next } = await db.from("render_jobs").select("id").eq("status", "queued").order("created_at").limit(1).maybeSingle();
  if (!next) return null;
  // Conditional update = atomic claim, safe if you ever run two workers.
  const { data } = await db.from("render_jobs").update({ status: "rendering", progress: 0, error: null }).eq("id", next.id).eq("status", "queued").select("*").maybeSingle();
  return data;
}

async function run(job: any) {
  console.log(`Rendering ${job.id} (${job.settings.aspect} ${job.settings.quality})`);
  const out = path.join(os.tmpdir(), `${job.id}.mp4`);
  try {
    const serveUrl = await getBundle();
    const inputProps = { ...job.props, aspect: job.settings.aspect, quality: job.settings.quality };
    const comp = await selectComposition({ serveUrl, id: "Film", inputProps });
    let last = -1;
    await renderMedia({
      composition: comp, serveUrl, codec: "h264", outputLocation: out, inputProps,
      crf: job.settings.quality === "1080p" ? 18 : 22, pixelFormat: "yuv420p", audioCodec: "aac",
      concurrency: Number(process.env.RENDER_CONCURRENCY) || undefined,
      onProgress: async ({ progress }) => {
        const pct = Math.floor(progress * 95);
        if (pct >= last + 3) { last = pct; await db.from("render_jobs").update({ progress: pct }).eq("id", job.id); }
      },
    });
    const file = await fs.readFile(out);
    const key = `renders/${job.owner_id}/${job.id}.mp4`;
    const up = await db.storage.from("media").upload(key, file, { contentType: "video/mp4", upsert: true });
    if (up.error) throw new Error(`Upload failed: ${up.error.message}`);
    const url = db.storage.from("media").getPublicUrl(key).data.publicUrl;
    await db.from("render_jobs").update({ status: "done", progress: 100, output_url: url }).eq("id", job.id);
    console.log("Done", job.id);
  } catch (e: any) {
    const attempts = job.attempts + 1;
    console.error("Render failed:", e);
    await db.from("render_jobs").update({
      status: attempts < MAX_ATTEMPTS ? "queued" : "failed", attempts, error: String(e?.message || e).slice(0, 500),
    }).eq("id", job.id);
  } finally { await fs.rm(out, { force: true }); }
}

(async () => {
  // Crash recovery: anything left "rendering" by a dead worker goes back in the queue.
  await db.from("render_jobs").update({ status: "queued" }).eq("status", "rendering");
  console.log("Worker ready. Waiting for jobs…");
  for (;;) {
    try { const job = await claim(); if (job) await run(job); else await sleep(3000); }
    catch (e) { console.error(e); await sleep(5000); }
  }
})();
