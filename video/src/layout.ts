export type Fmt = 'wide' | 'square' | 'tall';
export const layout = (w: number, h: number) => {
  const r = w / h;
  const fmt: Fmt = r > 1.3 ? 'wide' : r < 0.8 ? 'tall' : 'square';
  const margin = fmt === 'wide' ? 96 : 64;
  const dw = fmt === 'wide' ? 1240 : 1000;
  const cardW = Math.min(1100, dw);
  const winW = Math.min(dw, w - 2 * margin);
  const s = winW / dw;
  const cols = fmt === 'wide' ? 3 : 2;
  const rows = 6 / cols;
  const center: [number, number] = fmt === 'wide' ? [1, 0] : [0, 1];
  const tile = {w: 820, h: 440, gap: 28};
  const cx = w / 2;
  const cy = fmt === 'tall' ? h * 0.46 : h / 2;
  const gridW = (cols * tile.w + (cols - 1) * tile.gap) * s;
  const gridH = (rows * tile.h + (rows - 1) * tile.gap) * s;
  const zoom = Math.min((w - 2 * margin) / gridW, (h - 2 * margin - 180) / gridH, 1);
  return {fmt, w, h, margin, dw, cardW, winW, s, cols, rows, center, tile, cx, cy, gridW, gridH, zoom,
    cap: fmt === 'wide' ? 40 : 34, h2: fmt === 'wide' ? 76 : fmt === 'square' ? 58 : 60, line: fmt === 'wide' ? 58 : 46};
};
export type Layout = ReturnType<typeof layout>;
