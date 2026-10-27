import React from 'react';
import {AbsoluteFill, Audio, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {c, font} from './tokens';
import {S, sp, track, vis, visStyle, prog, snap, soft, firm, clamp01} from './anim';
import {layout} from './layout';
import {Cursor, Key} from './cursor';
import {Gmail, Menu, Rewrite, Slack, Tile, Pill, G, TILES} from './scenes/content';

export const AUDIO: string | null = null;

const T = {
  cursorIn: 0.3, selStart: 1.0, selEnd: 1.9, rclick: 2.0, menuIn: 2.05, hover: 2.75, click: 2.9, menuOut: 3.0,
  pill1: 3.05, swap1: 3.6, done1: 3.75, pill1Out: 5.0, cap1: 4.2, cap1Out: 7.3,
  card: 7.4, cardContent: 7.36, head2: 7.9, strikeFrom: 8.2, strikeTo: 9.6, badge: 9.9, head2Out: 11.8, cardOut: 11.98,
  slack: 12.0, slackContent: 11.96, type: 12.4, sel2: 14.5, keys: 14.95, cap2: 15.0, pill2: 15.3, swap2: 16.0, pill2Out: 17.2, cap2Out: 18.3, slackOut: 18.48,
  grid: 18.5, tileContent: 18.46, cap3: 19.4, cap3Out: 22.8, worldOut: 22.9,
  promise: 23.2, promiseOut: 26.3, end: 26.5,
};
const morph = {damping: 200, stiffness: 170};

export const Launch: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const L = layout(width, height);
  const s = L.s;

  const states = {
    gmail: {w: L.dw * s, h: 600 * s, r: 20, x: L.cx, y: L.cy - 20 * s},
    card: {w: L.cardW * s, h: 460 * s, r: 28, x: L.cx, y: L.cy + 40 * s},
    slack: {w: L.dw * s, h: 340 * s, r: 20, x: L.cx, y: L.cy - 10 * s},
    tile: {w: 820 * s, h: 440 * s, r: 24, x: L.cx, y: L.cy - 10 * s},
  };
  const geo = (k: 'w' | 'h' | 'r' | 'x' | 'y') => track(frame, states.gmail[k], [[T.card, states.card[k], morph], [T.slack, states.slack[k], morph], [T.grid, states.tile[k], morph]]);
  const W = geo('w'), H = geo('h'), R = geo('r'), X = geo('x'), Y = geo('y');
  const enter = sp(frame, 0, soft);

  const step = {x: (L.tile.w + L.tile.gap) * s, y: (L.tile.h + L.tile.gap) * s};
  const gridCenter = {x: states.tile.x + ((L.cols - 1) / 2 - L.center[0]) * step.x, y: states.tile.y + ((L.rows - 1) / 2 - L.center[1]) * step.y};
  const push = 0.025 * (prog(frame, 4.2, 7.3) - prog(frame, 7.4, 8.0)) + 0.02 * (prog(frame, 16.4, 18.4) - prog(frame, 18.5, 19.2));
  const camZ = Math.exp(track(frame, 0, [[T.grid, Math.log(L.zoom), morph]])) * (1 + push);
  const camX = track(frame, L.w / 2, [[T.grid, gridCenter.x, morph]]);
  const camY = track(frame, L.h / 2, [[T.grid, gridCenter.y, morph]]);
  const worldOut = clamp01((frame - S(T.worldOut)) / S(0.3));
  const worldVisible = worldOut < 1;

  const gl = states.gmail.x - states.gmail.w / 2, gt = states.gmail.y - states.gmail.h / 2;
  const P = (lx: number, ly: number): [number, number] => [gl + lx * s, gt + ly * s];
  const menuX = Math.min(G.menuX, L.dw - G.menuW - 16);
  const textStart = P(G.textX, G.textY + 24), textEnd = P(G.textX + G.textW, G.textY + 24), item = P(menuX + 70, G.menuY + G.itemY);
  const keys: Key[] = [[T.cursorIn, L.w * 0.72, L.h * 0.96], [T.selStart, ...textStart], [T.selEnd, ...textEnd], [T.rclick + 0.15, ...textEnd], [T.hover, ...item]];
  const cursorOpacity = sp(frame, T.cursorIn - 0.2, firm) * (1 - clamp01((frame - S(T.click + 0.3)) / S(0.25)));
  const sel = prog(frame, T.selStart, T.selEnd);

  const vGmail = vis(frame, -1, T.card - 0.02, 0.16, 0);
  const vCard = vis(frame, T.cardContent, T.cardOut, 0.14, 12);
  const vSlack = vis(frame, T.slackContent, T.slackOut, 0.14, 12);
  const vTile = vis(frame, T.tileContent, undefined, 0.14, 12);
  const content = (v: ReturnType<typeof vis>, w: number, node: React.ReactNode) =>
    v.gone ? null : (
      <div style={{position: 'absolute', left: 0, top: 0, width: w, transformOrigin: '0 0', opacity: v.opacity, filter: v.blur > 0.05 ? `blur(${v.blur}px)` : undefined, transform: `scale(${s}) translateY(${v.dy}px)`}}>{node}</div>
    );

  const cells: [number, number][] = [];
  for (let r = 0; r < L.rows; r++) for (let col = 0; col < L.cols; col++) if (!(col === L.center[0] && r === L.center[1])) cells.push([col, r]);
  const others = TILES.map((_, i) => i).filter((i) => i !== 2);

  const cap1 = vis(frame, T.cap1, T.cap1Out), head2 = vis(frame, T.head2, T.head2Out, 0.14, 24), cap2 = vis(frame, T.cap2, T.cap2Out), cap3 = vis(frame, T.cap3, T.cap3Out);
  const capStyle: React.CSSProperties = {position: 'absolute', left: 0, right: 0, textAlign: 'center', fontSize: L.cap, fontWeight: 600, letterSpacing: '-.02em', color: c.ink};
  const lines = ['Fixes spelling, grammar and punctuation.', 'Keeps your words and your tone.', 'No account needed.'];
  const vEnd = frame >= S(T.end);
  const endY = L.fmt === 'tall' ? L.h * 0.5 : L.h * 0.5;

  return (
    <AbsoluteFill style={{background: c.bg, fontFamily: font, color: c.ink}}>
      {AUDIO && <Audio src={staticFile(AUDIO)} />}
      {worldVisible && (
        <AbsoluteFill style={{opacity: 1 - worldOut, transform: `scale(${1 - 0.03 * worldOut})`}}>
          <div style={{position: 'absolute', left: 0, top: 0, width: L.w, height: L.h, transformOrigin: '0 0', transform: `translate(${L.w / 2}px, ${L.h / 2}px) scale(${camZ}) translate(${-camX}px, ${-camY}px)`}}>
            {frame >= S(T.grid) && others.map((ti, k) => {
              const [col, r] = cells[k];
              const x = states.tile.x + (col - L.center[0]) * step.x, y = states.tile.y + (r - L.center[1]) * step.y;
              const pop = sp(frame, T.tileContent + 0.08 * k, snap);
              return (
                <div key={ti} style={{position: 'absolute', left: x - states.tile.w / 2, top: y - states.tile.h / 2, width: states.tile.w, height: states.tile.h, borderRadius: 24, background: '#fff', overflow: 'hidden', border: '1px solid rgba(0,0,0,.08)', boxShadow: '0 30px 80px rgba(0,0,0,.10)', opacity: Math.min(1, pop * 2), transform: `scale(${0.86 + 0.14 * pop})`}}>
                  <div style={{transformOrigin: '0 0', transform: `scale(${s})`}}><Tile frame={frame} i={ti} marksAt={T.tileContent + 0.3 + 0.08 * k} /></div>
                </div>
              );
            })}
            <div style={{position: 'absolute', left: X - W / 2, top: Y - H / 2, width: W, height: H, borderRadius: R, background: '#fff', overflow: 'hidden', border: '1px solid rgba(0,0,0,.08)', boxShadow: '0 30px 80px rgba(0,0,0,.14)', opacity: enter, transform: `translateY(${(1 - enter) * 30}px)`}}>
              {content(vGmail, L.dw, <><Gmail frame={frame} sel={sel} swapAt={T.swap1} w={L.dw} />{frame >= S(T.menuIn) && frame < S(T.menuOut + 0.2) && <Menu frame={frame} tin={T.menuIn} tout={T.menuOut} hoverAt={T.hover} x={menuX} />}</>)}
              {content(vCard, L.cardW, <Rewrite frame={frame} strikeFrom={T.strikeFrom} strikeTo={T.strikeTo} badgeAt={T.badge} w={L.cardW} />)}
              {content(vSlack, L.dw, <Slack frame={frame} typeAt={T.type} selAt={T.sel2} keysAt={T.keys} swapAt={T.swap2} w={L.dw} />)}
              {content(vTile, 820, <Tile frame={frame} i={2} marksAt={T.tileContent + 0.3} />)}
            </div>
          </div>
          {!cap1.gone && <div style={{...capStyle, top: gt + states.gmail.h + 40 * s, ...visStyle(cap1)}}>Same message. Just fixed.</div>}
          {!head2.gone && <div style={{...capStyle, top: states.card.y - states.card.h / 2 - L.h2 * 1.15 - 44 * s, fontSize: L.h2, fontWeight: 700, letterSpacing: '-.035em', ...visStyle(head2)}}>Every other AI rewrites you.</div>}
          {!cap2.gone && <div style={{...capStyle, top: states.slack.y + states.slack.h / 2 + 78 * s, ...visStyle(cap2)}}>Or press <kbd style={kbd}>⌘</kbd><kbd style={kbd}>⇧</kbd><kbd style={kbd}>E</kbd></div>}
          {!cap3.gone && <div style={{...capStyle, top: L.h / 2 + (L.gridH * L.zoom) / 2 + 48, ...visStyle(cap3)}}>Works where you write.</div>}
          {frame >= S(T.pill1) && frame < S(T.pill1Out + 0.3) && <div style={{position: 'absolute', left: L.cx, top: gt + states.gmail.h - 12 * s, transform: 'translateX(-50%)'}}><Pill frame={frame} tin={T.pill1} doneAt={T.done1} tout={T.pill1Out} /></div>}
          {frame >= S(T.pill2) && frame < S(T.pill2Out + 0.3) && <div style={{position: 'absolute', left: L.cx, top: states.slack.y + states.slack.h / 2 - 12 * s, transform: 'translateX(-50%)'}}><Pill frame={frame} tin={T.pill2} doneAt={T.swap2} tout={T.pill2Out} /></div>}
          <Cursor frame={frame} keys={keys} presses={[T.rclick, T.click]} opacity={cursorOpacity} />
        </AbsoluteFill>
      )}
      {frame >= S(T.promise) && frame < S(T.promiseOut + 0.3) && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <div style={{display: 'flex', flexDirection: 'column', gap: L.line * 0.55, width: Math.min(1440, L.w - 2 * L.margin)}}>
            {lines.map((l, i) => {
              const v = vis(frame, T.promise + i * 0.18, T.promiseOut, 0.14, 22);
              return <div key={l} style={{fontSize: L.line, fontWeight: 700, letterSpacing: '-.03em', lineHeight: 1.1, ...visStyle(v)}}>{l}</div>;
            })}
          </div>
        </AbsoluteFill>
      )}
      {vEnd && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 * (L.fmt === 'wide' ? 1 : 0.9), transform: `translateY(${endY - L.h / 2}px)`}}>
            <Img src={staticFile('icon.png')} style={{width: 160, height: 160, borderRadius: 40, ...popStyle(sp(frame, T.end, snap))}} />
            <div style={{fontSize: L.fmt === 'wide' ? 96 : 80, fontWeight: 700, letterSpacing: '-.04em', ...visStyle(vis(frame, T.end + 0.15))}}>MrGrammar</div>
            <div style={{fontSize: L.fmt === 'wide' ? 34 : 30, color: c.ink2, textAlign: 'center', maxWidth: L.w - 2 * L.margin, ...visStyle(vis(frame, T.end + 0.3))}}>Grammar fixes in any text box. No account, no setup.</div>
            <div style={{display: 'flex', alignItems: 'center', gap: 14, fontSize: 28, color: c.ink2, ...visStyle(vis(frame, T.end + 0.42))}}><span style={{color: '#f5a623', letterSpacing: 2}}>★★★★★</span> 5.0 on the Chrome Web Store</div>
            <div style={{marginTop: 14, background: c.blue, color: '#fff', fontSize: 32, fontWeight: 600, padding: '20px 44px', borderRadius: 999, ...popStyle(sp(frame, T.end + 0.55, snap))}}>Add to Chrome</div>
            <div style={{fontSize: 32, fontWeight: 600, color: c.blue, marginTop: 6, ...visStyle(vis(frame, T.end + 0.7))}}>mrgrammar.me</div>
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
const kbd: React.CSSProperties = {fontFamily: 'inherit', fontSize: '.8em', fontWeight: 600, background: '#fff', border: '1px solid #d2d2d7', boxShadow: '0 2px 0 #d2d2d7', borderRadius: 8, padding: '4px 12px', margin: '0 3px'};
const popStyle = (k: number): React.CSSProperties => ({opacity: Math.min(1, k * 2), transform: `scale(${0.6 + 0.4 * k})`});
