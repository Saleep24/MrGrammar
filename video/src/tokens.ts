import {loadFont} from '@remotion/google-fonts/Inter';
const inter = loadFont('normal', {weights: ['400', '500', '600', '700'], subsets: ['latin']});
export const font = inter.fontFamily;
export const c = {
  ink: '#1d1d1f', ink2: '#6e6e73', ink3: '#86868b', line: '#e5e5ea', bg: '#fff', card: '#f5f5f7',
  blue: '#2e43f0', blueSoft: '#eef0fe', greenSoft: '#dcf5e3', greenInk: '#146c3a', sel: '#b4d5fe', red: '#e0362e',
};
export const FPS = 60;
// Scene timings were authored at 30 fps; F() converts those frame numbers
export const F = (n: number) => Math.round((n * FPS) / 30);
export const SCENES = {problem: 5 * FPS, demo: 10 * FPS, promise: 4 * FPS, where: 3 * FPS, end: 4 * FPS};
