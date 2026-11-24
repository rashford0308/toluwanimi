import React from "react";
import { AbsoluteFill, Audio, Img, OffthreadVideo, Sequence, interpolate, random, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { loadFont as loadSerif } from "@remotion/google-fonts/CormorantGaramond";
import { loadFont as loadScript } from "@remotion/google-fonts/PinyonScript";
import { FPS, INTRO, TRANSITION, type Props } from "./Root";

const serif = loadSerif().fontFamily;
const script = loadScript().fontFamily;
type Clip = Props["clips"][number];

/* ---------- media with motion ---------- */
const Media: React.FC<{ clip: Clip; kenBurns: number; index: number; fit?: "cover" | "contain" }> = ({ clip, kenBurns, index, fit = "cover" }) => {
  const f = useCurrentFrame(); const { durationInFrames } = useVideoConfig();
  const t = f / durationInFrames;
  const dir = index % 2 ? -1 : 1;
  const style: React.CSSProperties = { width: "100%", height: "100%", objectFit: fit, transform: `scale(${1 + kenBurns * t}) translateX(${dir * kenBurns * 40 * (t - 0.5)}px)` };
  return clip.kind === "video"
    ? <OffthreadVideo src={clip.src} startFrom={Math.round((clip.trimStart || 0) * FPS)} volume={clip.keepAudio ? 1 : 0} style={style} />
    : <Img src={clip.src} style={style} />;
};

/* ---------- entrance transition wrapper ---------- */
const Enter: React.FC<{ kind?: Clip["transition"]; children: React.ReactNode }> = ({ kind = "fade", children }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, TRANSITION], [0, 1], { extrapolateRight: "clamp" });
  const tf = kind === "slide" ? `translateX(${(1 - p) * 12}%)` : kind === "zoom" ? `scale(${1.15 - 0.15 * p})` : undefined;
  return <AbsoluteFill style={{ opacity: p, transform: tf }}>{children}</AbsoluteFill>;
};

const Typed: React.FC<{ text: string; speed?: number }> = ({ text, speed = 2 }) => {
  const f = useCurrentFrame(); return <>{text.slice(0, Math.floor(f / speed))}</>;
};

/* ---------- per-style scenes ---------- */
const Scene: React.FC<{ clip: Clip; i: number; n: number; p: Props }> = ({ clip, i, n, p }) => {
  const { width, height } = { width: useVideoConfig().width, height: useVideoConfig().height };
  const f = useCurrentFrame(); const vertical = height > width; const u = Math.min(width, height) / 1080;
  const C = p.colors;
  const cap = clip.caption ? clip.caption : "";
  const capFade = interpolate(f, [TRANSITION + 6, TRANSITION + 26], [0, 1], { extrapolateRight: "clamp", extrapolateLeft: "clamp" });

  if (p.style === "letter") {
    return (
      <AbsoluteFill style={{ background: "#f7efe2", alignItems: "center", justifyContent: "center", flexDirection: vertical ? "column" : "row", gap: 60 * u, padding: 80 * u }}>
        <div style={{ background: "#fff", padding: 24 * u, paddingBottom: 70 * u, boxShadow: "0 30px 60px rgba(110,31,46,.3)", transform: `rotate(${i % 2 ? 3 : -3}deg)`, width: vertical ? "80%" : "42%", aspectRatio: "1" }}>
          <div style={{ width: "100%", height: "100%", overflow: "hidden" }}><Media clip={clip} kenBurns={0.06} index={i} /></div>
        </div>
        <div style={{ fontFamily: script, fontSize: 70 * u, color: C.accent, maxWidth: vertical ? "90%" : "42%", lineHeight: 1.3 }}><Typed text={cap} /></div>
      </AbsoluteFill>
    );
  }
  if (p.style === "timeline") {
    return (
      <AbsoluteFill style={{ background: C.bg }}>
        <AbsoluteFill style={{ padding: 60 * u, bottom: 230 * u }}><div style={{ width: "100%", height: "100%", borderRadius: 24 * u, overflow: "hidden" }}><Media clip={clip} kenBurns={0.05} index={i} /></div></AbsoluteFill>
        <div style={{ position: "absolute", left: 60 * u, right: 60 * u, bottom: 60 * u, color: C.text, opacity: capFade }}>
          <div style={{ fontFamily: serif, fontSize: 64 * u, color: C.accent }}>{clip.date}</div>
          <div style={{ fontFamily: serif, fontSize: 40 * u, fontStyle: "italic" }}>{cap}</div>
          <div style={{ height: 6 * u, background: `${C.accent}33`, marginTop: 20 * u, position: "relative" }}>
            <div style={{ position: "absolute", height: "100%", width: `${((i + 1) / n) * 100}%`, background: C.accent }} />
          </div>
        </div>
      </AbsoluteFill>
    );
  }
  const bars = p.style === "cinematic" ? 90 * u : 0;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Media clip={clip} kenBurns={p.style === "photofilm" ? 0.18 : 0.08} index={i} />
      <AbsoluteFill style={{ background: "linear-gradient(transparent 55%, rgba(40,10,15,.65))" }} />
      {bars > 0 && <><div style={{ position: "absolute", top: 0, left: 0, right: 0, height: bars, background: "#000" }} /><div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: bars, background: "#000" }} /></>}
      {cap && (
        <div style={{ position: "absolute", left: 60 * u, right: 60 * u, bottom: (bars || 0) + 70 * u, textAlign: p.style === "photofilm" || p.style === "birthday" ? "center" : "left",
          color: "#FBF7F0", fontFamily: p.style === "photofilm" ? script : serif, fontSize: (p.style === "photofilm" ? 90 : 56) * u, opacity: capFade, transform: `translateY(${(1 - capFade) * 20}px)`, textShadow: "0 2px 20px rgba(0,0,0,.5)" }}>{cap}</div>
      )}
      {p.style === "birthday" && <Confetti accent={C.accent} />}
    </AbsoluteFill>
  );
};

const Confetti: React.FC<{ accent: string }> = ({ accent }) => {
  const f = useCurrentFrame(); const { width, height } = useVideoConfig();
  const cols = [accent, "#E9D8B4", "#F2D4D0", "#C99A8E"];
  return <AbsoluteFill>{Array.from({ length: 60 }, (_, k) => {
    const x = random(`x${k}`) * width, speed = 2 + random(`s${k}`) * 4, y = ((f * speed + random(`y${k}`) * height) % (height + 40)) - 20;
    return <div key={k} style={{ position: "absolute", left: x + Math.sin(f / 10 + k) * 20, top: y, width: 14, height: 8, background: cols[k % 4], transform: `rotate(${f * 4 + k * 30}deg)`, opacity: 0.85 }} />;
  })}</AbsoluteFill>;
};

/* ---------- collage: 4 photos per scene in an animated grid ---------- */
const Collage: React.FC<{ group: Clip[]; p: Props }> = ({ group, p }) => {
  const f = useCurrentFrame(); const { fps, width, height } = useVideoConfig(); const u = Math.min(width, height) / 1080;
  const cols = width >= height ? 2 : 2;
  return (
    <AbsoluteFill style={{ background: p.colors.bg, padding: 40 * u, display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 24 * u }}>
      {group.map((c, k) => {
        const s = spring({ frame: f - k * 8, fps, config: { damping: 14 } });
        return <div key={k} style={{ overflow: "hidden", borderRadius: 18 * u, transform: `scale(${s}) rotate(${(1 - s) * (k % 2 ? 8 : -8)}deg)`, boxShadow: "0 16px 40px rgba(110,31,46,.25)" }}><Media clip={c} kenBurns={0.06} index={k} /></div>;
      })}
    </AbsoluteFill>
  );
};

/* ---------- title card ---------- */
const Title: React.FC<{ p: Props }> = ({ p }) => {
  const f = useCurrentFrame(); const { width, height } = useVideoConfig(); const u = Math.min(width, height) / 1080;
  const a = interpolate(f, [8, 40, INTRO - 20, INTRO], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ background: p.colors.bg, alignItems: "center", justifyContent: "center", textAlign: "center", opacity: a }}>
      <div style={{ fontFamily: script, fontSize: 150 * u, color: p.colors.accent, padding: 40 * u }}>{p.title}</div>
      {p.subtitle && <div style={{ fontFamily: serif, fontSize: 48 * u, fontStyle: "italic", color: p.colors.text }}>{p.subtitle}</div>}
    </AbsoluteFill>
  );
};

/* ---------- main composition ---------- */
export const Film: React.FC<Props> = (p) => {
  const { durationInFrames } = useVideoConfig();
  const offset = p.title ? INTRO - TRANSITION : 0;

  // Collage groups clips by four; other styles use one scene per clip.
  const scenes: { clips: Clip[]; frames: number }[] = p.style === "collage"
    ? Array.from({ length: Math.ceil(p.clips.length / 4) }, (_, g) => {
        const group = p.clips.slice(g * 4, g * 4 + 4);
        return { clips: group, frames: Math.round(Math.max(...group.map((c) => c.duration)) * FPS) };
      })
    : p.clips.map((c) => ({ clips: [c], frames: Math.round(c.duration * FPS) }));

  let cursor = offset;
  const music = p.music;
  const vol = (fr: number) => {
    if (!music) return 0;
    const inV = music.fadeIn > 0 ? fr / (music.fadeIn * FPS) : 1;
    const outV = music.fadeOut > 0 ? (durationInFrames - fr) / (music.fadeOut * FPS) : 1;
    return Math.max(0, Math.min(1, inV, outV)) * music.volume;
  };

  return (
    <AbsoluteFill style={{ background: p.colors.bg }}>
      {music && <Audio src={music.src} startFrom={Math.round(music.start * FPS)} volume={vol} />}
      {p.title && <Sequence from={0} durationInFrames={INTRO}><Title p={p} /></Sequence>}
      {scenes.map((s, i) => {
        const from = cursor; cursor += s.frames - TRANSITION;
        return (
          <Sequence key={i} from={from} durationInFrames={s.frames + (i < scenes.length - 1 ? 0 : 0)}>
            <Enter kind={s.clips[0].transition}>
              {p.style === "collage" ? <Collage group={s.clips} p={p} /> : <Scene clip={s.clips[0]} i={i} n={scenes.length} p={p} />}
            </Enter>
          </Sequence>
        );
      })}
      {(p.textOverlays || []).map((t, k) => (
        <Sequence key={`t${k}`} from={Math.round(t.from * FPS)} durationInFrames={Math.round(t.duration * FPS)}>
          <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: `${t.y}%`, fontFamily: script, fontSize: 80, color: "#FBF7F0", textShadow: "0 2px 20px rgba(0,0,0,.6)" }}>{t.text}</AbsoluteFill>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
