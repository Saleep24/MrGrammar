import {interpolate, spring} from 'remotion';
import {FPS} from './tokens';
export const rise = (frame: number, delay = 0) => {
  const s = spring({frame: frame - delay, fps: FPS, config: {damping: 200, stiffness: 120}});
  return {opacity: s, transform: `translateY(${(1 - s) * 28}px)`};
};
export const pop = (frame: number, delay = 0) => {
  const s = spring({frame: frame - delay, fps: FPS, config: {damping: 14, stiffness: 180}});
  return {opacity: Math.min(1, s * 2), transform: `scale(${0.6 + 0.4 * s})`};
};
export const fadeOut = (frame: number, start: number, len = 12) =>
  interpolate(frame, [start, start + len], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
export const typed = (text: string, frame: number, start: number, cps = 2) => {
  const n = Math.max(0, Math.floor((frame - start) / cps));
  return text.slice(0, n);
};
