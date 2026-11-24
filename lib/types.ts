export type ExpType = "letter" | "gallery" | "slideshow" | "video" | "surprise";
export type Experience = {
  id: string; type: ExpType; title: string; slug: string;
  status: "draft" | "published"; visibility: "public" | "unlisted" | "password";
  content: any; updated_at?: string;
};
export type MediaRow = { id: string; kind: "photo" | "video" | "audio"; path: string; url: string; name: string; size: number };
export type OpeningSettings = {
  line1: string; line2: string; button: string; closing: string;
  theme: "petals" | "glow" | "dusk"; musicUrl?: string; bgUrl?: string;
};
export const DEFAULT_OPENING: OpeningSettings = {
  line1: "This is for you, Toluwanimi.",
  line2: "Some things are too beautiful to leave unexpressed.",
  button: "Open Your Surprise",
  closing: "", theme: "petals",
};
export const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60) || "untitled";

export type FilmProps = {
  style: "cinematic" | "photofilm" | "letter" | "timeline" | "collage" | "birthday" | "freeform";
  title: string; subtitle?: string;
  colors: { bg: string; accent: string; text: string };
  clips: { kind: "photo" | "video"; src: string; duration: number; trimStart?: number; caption?: string; date?: string;
           transition?: "fade" | "slide" | "zoom"; keepAudio?: boolean }[];
  music?: { src: string; volume: number; fadeIn: number; fadeOut: number; start: number };
  textOverlays?: { text: string; from: number; duration: number; y: number }[];
};
export const ASPECTS = { "16:9": [1920, 1080], "9:16": [1080, 1920], "1:1": [1080, 1080] } as const;
