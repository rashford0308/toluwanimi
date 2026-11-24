# For Toluwanimi

Romantic website + creator studio + MP4 render pipeline.

**Status: written but not yet run.** The code was produced without the ability to install
packages or run a build, so expect to fix a few type errors or typos on first run. Work through the
test checklist at the bottom before trusting any feature.

## Architecture

- `app/` and `components/`: Next.js 14 (App Router), Tailwind, Framer Motion. Deploys to Vercel.
  - `/` opening sequence, then her home page (public experiences only)
  - `/toluwanimi/[slug]` viewer for letters, galleries, slideshows, films and surprises
  - `/login`, `/dashboard/*` private studio (protected by `middleware.ts` + Supabase Auth + RLS)
- `supabase/schema.sql`: tables, row-level security, storage bucket
- `remotion/`: the video compositions (7 styles, transitions, audio fades)
- `worker/index.ts`: long-running render worker. **This does not run on Vercel.**
  Run it on your PC, or a cheap VPS (2+ vCPU, 4 GB RAM). The web app only queues jobs.

Render flow: Render button → `POST /api/render` validates and inserts a `render_jobs` row → worker claims it,
renders with Remotion (FFmpeg is bundled with Remotion), uploads `renders/<user>/<job>.mp4` → dashboard polls
progress and shows the preview and download link. Failed jobs retry once automatically, then show a Retry button;
projects are never touched by a failed render.

## Setup

1. Create a Supabase project. In the SQL editor, run `supabase/schema.sql`.
2. Auth → Providers → Email: **disable "Allow new users to sign up"**, then Auth → Users → *Add user* (you).
3. `cp .env.example .env.local` and fill in the URL, anon key and service-role key.
4. `npm install`
5. `npm run dev` (site on http://localhost:3000, studio on /dashboard)
6. In a second terminal: `npm run worker` (first run downloads a headless Chrome; on Linux you may need
   `sudo apt install libnss3 libdbus-1-3 libatk1.0-0 libgbm-dev libasound2 libxrandr2 libxkbcommon-dev libxfixes3 libxcomposite1 libxdamage1 libatk-bridge2.0-0 libpango-1.0-0 libcairo2 libcups2`).
7. Optional: `npm run remotion:studio` to design the video styles with a live preview.

Deploy the web app to Vercel with the same env vars. Keep the worker on your own machine/VPS, pointed at the same Supabase project.

## Things to know

- **Media bucket is public-read** with unguessable paths. That's what lets her browser, and the renderer, load files. Don't upload anything you wouldn't want a leaked URL to expose.
- **Password-protected experiences** are not readable by anonymous users at all; content is only returned by `/api/unlock` after a bcrypt check.
- **Autoplay:** music only starts after a click (the "Open Your Surprise" button, or the Play music button).
- **Free tier limits:** Supabase free storage is 1 GB; the library blocks uploads past 900 MB. Video files are capped at 500 MB each (Supabase free caps single uploads at 50 MB, so raise the bucket limit on a paid plan or compress clips first).
- **Music:** only upload tracks you have the rights to use, especially if you publish publicly.

## Known gaps (be realistic)

- The video "timeline" is an ordered clip list with drag-reorder and per-clip trim/duration, plus a music track. It is not a full multi-track NLE with free-form dragging along a time ruler.
- Free-form text overlays render (`textOverlays` in props) but have no dashboard UI yet.
- Video trim sets the start point and duration only. Audio trim sets the start point and fades.
- Image crop/resize is done with `object-fit` and brightness/contrast sliders; there is no crop-box tool yet.
- No live in-browser preview of the Remotion styles; use `npm run remotion:studio` or render a short test.
- Collage and Freeform styles are basic first versions.

## Test checklist (do all of these before trusting it)

- [ ] Log in at /login; /dashboard redirects you out when logged out
- [ ] Upload a photo, a video, an mp3 (and see an oversize file rejected)
- [ ] Customize the opening, preview it, save, see it on `/` in a fresh tab
- [ ] Write a letter, publish it, open `/toluwanimi/<slug>` in a private window: envelope opens, text types in
- [ ] Gallery: add photos, drag to reorder, open lightbox, swipe on a phone
- [ ] Slideshow: add slides, preview, play/pause, full screen
- [ ] Video: add 3 photos + 1 clip + music, render 720p 16:9, watch progress, download and play the MP4 with sound
- [ ] Render 9:16 and 1:1; try each of the 7 styles
- [ ] Kill the worker mid-render, restart it: job requeues and finishes
- [ ] Password-protected experience: wrong password rejected, right one opens
- [ ] Everything above on a real Android phone and an iPhone
