import type {CSSProperties} from 'react';
import {spring} from 'remotion';
import {FPS} from './tokens';
export type Cfg = {damping: number; stiffness: number};
export const soft: Cfg = {damping: 200, stiffness: 120};
export const firm: Cfg = {damping: 200, stiffness: 220};
export const snap: Cfg = {damping: 20, stiffness: 170};
export const S = (sec: number) => Math.round(sec * FPS);
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const easeIO = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
export const easeOut = (p: number) => 1 - Math.pow(1 - p, 3);
export const sp = (frame: number, startSec: number, cfg: Cfg = soft) =>
  frame <= S(startSec) ? 0 : spring({frame: frame - S(startSec), fps: FPS, config: cfg});
export const track = (frame: number, v0: number, keys: [number, number, Cfg?][]) => {
  let v = v0;
  let cur = v0;
  for (const [t, val, cfg] of keys) {
    v += (val - cur) * sp(frame, t, cfg ?? soft);
    cur = val;
  }
  return v;
};
export const prog = (frame: number, a: number, b: number, ease = easeIO) => ease(clamp01((frame / FPS - a) / (b - a)));
export type Vis = {opacity: number; blur: number; dy: number; e: number; gone: boolean};
export const vis = (frame: number, tin: number, tout?: number, dOut = 0.14, dy = 16): Vis => {
  const e = sp(frame, tin, firm);
  const x = tout == null ? 0 : clamp01((frame - S(tout)) / S(dOut));
  const xo = x * x;
  return {opacity: e * (1 - xo), blur: (1 - e) * 10 + xo * 10, dy: (1 - e) * dy - xo * 10, e, gone: frame < S(tin) || x >= 1};
};
export const visStyle = (v: Vis): CSSProperties => ({
  opacity: v.opacity,
  filter: v.blur > 0.05 ? `blur(${v.blur}px)` : undefined,
  transform: `translateY(${v.dy}px)`,
});
export const typed = (text: string, frame: number, startSec: number, cps = 18) =>
  text.slice(0, Math.max(0, Math.floor(((frame - S(startSec)) / FPS) * cps)));
export const blink = (frame: number) => Math.floor(frame / 30) % 2 === 0;
