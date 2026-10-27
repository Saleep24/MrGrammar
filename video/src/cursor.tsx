import React from 'react';
import {FPS} from './tokens';
import {easeIO} from './anim';
export type Key = [number, number, number];
export const cursorAt = (frame: number, keys: Key[]) => {
  const t = frame / FPS;
  if (t <= keys[0][0]) return {x: keys[0][1], y: keys[0][2]};
  for (let i = 0; i < keys.length - 1; i++) {
    const [t0, x0, y0] = keys[i];
    const [t1, x1, y1] = keys[i + 1];
    if (t >= t0 && t <= t1) {
      const p = easeIO((t - t0) / (t1 - t0));
      const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1;
      const arc = Math.sin(p * Math.PI) * Math.min(22, len * 0.07);
      return {x: x0 + dx * p - (dy / len) * arc, y: y0 + dy * p + (dx / len) * arc};
    }
  }
  const l = keys[keys.length - 1];
  return {x: l[1], y: l[2]};
};
export const Cursor: React.FC<{frame: number; keys: Key[]; presses: number[]; opacity: number; scale?: number}> = ({frame, keys, presses, opacity, scale = 1}) => {
  const {x, y} = cursorAt(frame, keys);
  const t = frame / FPS;
  let press = 0;
  for (const p of presses) press += Math.exp(-Math.pow((t - p) / 0.05, 2));
  const k = (1 - 0.18 * Math.min(1, press)) * scale;
  return (
    <div style={{position: 'absolute', left: x, top: y, opacity, pointerEvents: 'none'}}>
      {presses.map((p) => {
        const u = (t - p) / 0.42;
        if (u < 0 || u > 1) return null;
        const r = 10 + 30 * u;
        return <div key={p} style={{position: 'absolute', left: -r + 2, top: -r + 2, width: 2 * r, height: 2 * r, borderRadius: '50%', border: `2px solid rgba(46,67,240,${0.55 * (1 - u)})`}} />;
      })}
      <svg width={30 * k} height={36 * k} viewBox="0 0 18 22" style={{display: 'block'}}>
        <path d="M1 1l6 18 2.6-6.8L16.5 10 1 1z" fill="#fff" stroke="#1d1d1f" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    </div>
  );
};
