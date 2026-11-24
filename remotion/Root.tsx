import React from "react";
import { Composition } from "remotion";
import { Film } from "./Film";
import type { FilmProps } from "../lib/types";

export const FPS = 30;
export const TRANSITION = 18; // frames of overlap between clips
export const INTRO = 90;      // 3s title card

export type Props = FilmProps & { aspect: "16:9" | "9:16" | "1:1"; quality: "720p" | "1080p" };

const defaults: Props = {
  style: "cinematic", title: "For Toluwanimi", subtitle: "", aspect: "16:9", quality: "1080p",
  colors: { bg: "#FBF7F0", accent: "#6E1F2E", text: "#3A2A2A" }, clips: [],
};

export const totalFrames = (p: Props) => {
  const n = p.clips.length;
  const body = p.clips.reduce((a, c) => a + Math.round(c.duration * FPS), 0) - Math.max(0, n - 1) * TRANSITION;
  return Math.max(30, (p.title ? INTRO - TRANSITION : 0) + body);
};

export const Root: React.FC = () => (
  <Composition
    id="Film" component={Film as any} fps={FPS} width={1920} height={1080} durationInFrames={300}
    defaultProps={defaults as any}
    calculateMetadata={({ props }: { props: any }) => {
      const p = props as Props;
      const short = p.quality === "720p" ? 720 : 1080, long = Math.round((short * 16) / 9);
      const [width, height] = p.aspect === "9:16" ? [short, long] : p.aspect === "1:1" ? [short, short] : [long, short];
      return { durationInFrames: totalFrames(p), width, height, fps: FPS };
    }}
  />
);
