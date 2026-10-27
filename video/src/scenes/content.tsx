import React from 'react';
import {Img, staticFile} from 'remotion';
import {c} from '../tokens';
import {S, prog, sp, snap, typed, blink, vis, visStyle, easeOut, clamp01} from '../anim';
import {marks, Mark} from '../marks';

export type Tok = {t: string; fix?: boolean};
export const Marks: React.FC<{toks: Tok[]; frame: number; start: number; step?: number}> = ({toks, frame, start, step = 0.07}) => {
  let n = 0;
  return (
    <>
      {toks.map((w, i) => {
        const k = w.fix ? n++ : 0;
        const s = w.fix ? sp(frame, start + k * step, snap) : 1;
        return (
          <span key={i}>
            {w.fix ? (
              <span style={{display: 'inline-block', background: c.greenSoft, color: c.greenInk, borderRadius: 6, padding: '0 6px', opacity: 0.4 + 0.6 * Math.min(1, s * 2), transform: `scale(${0.82 + 0.18 * s})`}}>{w.t}</span>
            ) : w.t}
            {i < toks.length - 1 ? ' ' : ''}
          </span>
        );
      })}
    </>
  );
};

const Bar: React.FC<{title: string}> = ({title}) => (
  <div style={{height: 44, display: 'flex', alignItems: 'center', gap: 9, padding: '0 20px', background: '#f7f7f8', borderBottom: `1px solid ${c.line}`}}>
    {['#ff5f57', '#febc2e', '#28c840'].map((col) => <span key={col} style={{width: 13, height: 13, borderRadius: 7, background: col}} />)}
    <span style={{marginLeft: 10, fontSize: 19, fontWeight: 600, color: c.ink2}}>{title}</span>
  </div>
);
const Row: React.FC<{label: string; value: string}> = ({label, value}) => (
  <div style={{display: 'flex', gap: 16, height: 50, alignItems: 'center', padding: '0 28px', borderBottom: `1px solid ${c.line}`, fontSize: 23}}>
    <span style={{color: c.ink3, width: 96}}>{label}</span><span>{value}</span>
  </div>
);

export const GMAIL_BEFORE = 'hey can u send me the file when u get a sec, no rush tho';
export const GMAIL_AFTER: Tok[] = [
  {t: 'Hey,', fix: true}, {t: 'can'}, {t: 'you', fix: true}, {t: 'send'}, {t: 'me'}, {t: 'the'}, {t: 'file'}, {t: 'when'}, {t: 'you', fix: true},
  {t: 'get'}, {t: 'a'}, {t: 'sec?', fix: true}, {t: 'No', fix: true}, {t: 'rush'}, {t: 'though.', fix: true},
];
// Window-local design coordinates (1240 wide) used to place the cursor and menu
export const G = {textX: 28, textY: 234, textW: 752, lineH: 42, menuX: 790, menuY: 262, menuW: 336, itemY: 118};

export const Gmail: React.FC<{frame: number; sel: number; swapAt: number; w: number}> = ({frame, sel, swapAt, w}) => {
  const done = frame >= S(swapAt);
  const out = vis(frame, -1, swapAt - 0.1, 0.1, 0);
  const inn = vis(frame, swapAt, undefined, 0.1, 10);
  return (
    <div style={{width: w, height: 600, background: '#fff'}}>
      <Bar title="New message" />
      <Row label="To" value="Brenda" />
      <Row label="Subject" value="Friday file" />
      <div style={{padding: '28px 28px 0', fontSize: 28, lineHeight: `${G.lineH}px`, position: 'relative'}}>
        <p>Hi Brenda,</p>
        <div style={{position: 'relative', marginTop: 20, height: G.lineH, whiteSpace: 'nowrap'}}>
          {!done && (
            <div style={{position: 'absolute', inset: 0, ...visStyle(out)}}>
              <span>{GMAIL_BEFORE}</span>
              <span style={{position: 'absolute', left: 0, top: 0, background: c.sel, borderRadius: 4, padding: '2px 0', margin: '-2px 0', clipPath: `inset(0 ${(1 - sel) * 100}% 0 0)`}}>{GMAIL_BEFORE}</span>
            </div>
          )}
          {done && (
            <div style={{position: 'absolute', inset: 0, ...visStyle(inn)}}>
              <Marks toks={GMAIL_AFTER} frame={frame} start={swapAt + 0.1} />
              <span style={{opacity: blink(frame) ? 1 : 0, color: c.blue, marginLeft: 2}}>|</span>
            </div>
          )}
        </div>
        <p style={{marginTop: 20}}>Can you share the deck when it's ready?</p>
        <p style={{marginTop: 20}}>Thanks,<br />Saleep</p>
      </div>
    </div>
  );
};

export const Menu: React.FC<{frame: number; tin: number; tout: number; hoverAt: number; x: number; y: number}> = ({frame, tin, tout, hoverAt, x, y}) => {
  const v = vis(frame, tin, tout, 0.08, -6);
  const k = sp(frame, tin, snap);
  const hovered = frame >= S(hoverAt);
  return (
    <div style={{position: 'absolute', left: x, top: y, width: G.menuW, background: '#fff', borderRadius: 14, boxShadow: '0 16px 50px rgba(0,0,0,.22)', border: `1px solid ${c.line}`, padding: 8, fontSize: 22, whiteSpace: 'nowrap', transformOrigin: 'top left', opacity: v.opacity, transform: `scale(${0.9 + 0.1 * k}) translateY(${v.dy}px)`}}>
      {['Copy', 'Paste'].map((t) => <div key={t} style={{padding: '9px 16px', color: c.ink2}}>{t}</div>)}
      <div style={{height: 1, background: c.line, margin: '6px 4px'}} />
      <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '9px 16px', borderRadius: 10, background: hovered ? c.blue : 'transparent', color: hovered ? '#fff' : c.ink, fontWeight: 600}}>
        <Img src={staticFile('icon.png')} style={{width: 24, height: 24, borderRadius: 6}} />Fix Grammar with AI
      </div>
      <div style={{height: 1, background: c.line, margin: '6px 4px'}} />
      <div style={{padding: '9px 16px', color: c.ink2}}>Inspect</div>
    </div>
  );
};

export const REWRITE = 'Hello, could you please send me the file at your earliest convenience? There is no rush.'.split(' ');
export const Rewrite: React.FC<{frame: number; strikeFrom: number; strikeTo: number; badgeAt: number; w: number}> = ({frame, strikeFrom, strikeTo, badgeAt, w}) => {
  const struck = Math.floor(prog(frame, strikeFrom, strikeTo, (p) => p) * REWRITE.length);
  const b = sp(frame, badgeAt, snap);
  return (
    <div style={{width: w, height: 460, background: '#fff', padding: '40px 48px'}}>
      <div style={{fontSize: 22, fontWeight: 600, color: c.ink3, marginBottom: 20}}>A typical AI rewrite</div>
      <div style={{fontSize: 40, lineHeight: 1.35, color: '#a33'}}>
        {REWRITE.map((w, i) => (
          <span key={i} style={{textDecoration: i < struck ? 'line-through' : 'none', textDecorationColor: c.red, textDecorationThickness: 4}}>{w}{i < REWRITE.length - 1 ? ' ' : ''}</span>
        ))}
      </div>
      <div style={{display: 'inline-block', marginTop: 34, background: '#fde8e6', color: '#b42318', fontSize: 26, fontWeight: 600, padding: '10px 20px', borderRadius: 999, opacity: Math.min(1, b * 2), transform: `scale(${0.7 + 0.3 * b})`, transformOrigin: 'left center'}}>
        Polite. Formal. Not you.
      </div>
    </div>
  );
};

export const SLACK_BEFORE = 'lmk if their are any questions';
export const SLACK_AFTER: Tok[] = [{t: 'lmk'}, {t: 'if'}, {t: 'there', fix: true}, {t: 'are'}, {t: 'any'}, {t: 'questions'}];
export const Slack: React.FC<{frame: number; typeAt: number; selAt: number; keysAt: number; swapAt: number; w: number}> = ({frame, typeAt, selAt, keysAt, swapAt, w}) => {
  const text = typed(SLACK_BEFORE, frame, typeAt, 18);
  const typing = frame >= S(typeAt) && text.length < SLACK_BEFORE.length;
  const sel = prog(frame, selAt, selAt + 0.3, easeOut);
  const done = frame >= S(swapAt);
  const out = vis(frame, -1, swapAt - 0.1, 0.1, 0);
  const inn = vis(frame, swapAt, undefined, 0.1, 10);
  const kv = vis(frame, keysAt - 0.25, swapAt + 1.0, 0.15, 8);
  return (
    <div style={{width: w, height: 340, background: '#fff'}}>
      <div style={{height: 56, display: 'flex', alignItems: 'center', gap: 10, padding: '0 24px', borderBottom: `1px solid ${c.line}`}}>
        <Mark inner={marks[2].inner} size={24} />
        <span style={{fontSize: 22, fontWeight: 700}}># general</span>
        <span style={{fontSize: 18, color: c.ink3, marginLeft: 8}}>12 members</span>
      </div>
      <div style={{padding: '28px 24px 0', position: 'relative'}}>
        <div style={{position: 'relative', border: `1.5px solid #c9c9ce`, borderRadius: 14, minHeight: 170, padding: '18px 22px', fontSize: 28, lineHeight: '42px'}}>
          {!done && text.length === 0 && <span style={{color: c.ink3}}>Message #general</span>}
          {!done && (
            <div style={{position: 'relative', whiteSpace: 'nowrap', ...visStyle(out)}}>
              <span>{text}</span>
              <span style={{position: 'absolute', left: 0, top: 0, background: c.sel, borderRadius: 4, padding: '2px 0', margin: '-2px 0', clipPath: `inset(0 ${(1 - sel) * 100}% 0 0)`}}>{text}</span>
              <span style={{opacity: typing || (blink(frame) && frame < S(selAt)) ? 1 : 0, color: c.blue, marginLeft: 1}}>|</span>
            </div>
          )}
          {done && (
            <div style={{position: 'absolute', left: 22, top: 18, whiteSpace: 'nowrap', ...visStyle(inn)}}>
              <Marks toks={SLACK_AFTER} frame={frame} start={swapAt + 0.1} />
              <span style={{opacity: blink(frame) ? 1 : 0, color: c.blue, marginLeft: 2}}>|</span>
            </div>
          )}
          <div style={{position: 'absolute', right: 18, bottom: 16, display: 'flex', gap: 14, alignItems: 'center', color: c.ink3, fontSize: 20}}>
            <span>Aa</span><span>@</span><span>:)</span>
            <span style={{marginLeft: 8, width: 40, height: 32, borderRadius: 8, background: '#007a5a', display: 'grid', placeItems: 'center', color: '#fff', fontSize: 18}}>➤</span>
          </div>
        </div>
        <div style={{position: 'absolute', right: 40, top: -14, display: 'flex', gap: 8, ...visStyle(kv)}}>
          {['⌘', '⇧', 'E'].map((k, i) => {
            const p = Math.exp(-Math.pow((frame / 60 - (keysAt + i * 0.14)) / 0.07, 2));
            const held = frame / 60 > keysAt + i * 0.14 && frame / 60 < keysAt + 0.14 * 2 + 0.3;
            const d = Math.max(p, held ? 1 : 0);
            return (
              <kbd key={k} style={{fontFamily: 'inherit', fontSize: 24, fontWeight: 600, background: d > 0.5 ? c.blue : '#fff', color: d > 0.5 ? '#fff' : c.ink, border: `1px solid ${d > 0.5 ? c.blue : '#d2d2d7'}`, boxShadow: `0 ${3 - 3 * d}px 0 ${d > 0.5 ? '#2436c9' : '#d2d2d7'}`, borderRadius: 9, padding: '7px 15px', transform: `translateY(${3 * d}px)`}}>{k}</kbd>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const TILES: {app: number; before: string; after: Tok[]}[] = [
  {app: 0, before: 'Their going to the meeting tommorow', after: [{t: "They're", fix: true}, {t: 'going'}, {t: 'to'}, {t: 'the'}, {t: 'meeting'}, {t: 'tomorrow.', fix: true}]},
  {app: 1, before: "Thanks for you're patience", after: [{t: 'Thanks'}, {t: 'for'}, {t: 'your', fix: true}, {t: 'patience.'}]},
  {app: 2, before: SLACK_BEFORE, after: SLACK_AFTER},
  {app: 3, before: 'Congrats on the new role, you deserved it alot', after: [{t: 'Congrats'}, {t: 'on'}, {t: 'the'}, {t: 'new'}, {t: 'role,'}, {t: 'you'}, {t: 'deserved'}, {t: 'it'}, {t: 'a lot.', fix: true}]},
  {app: 4, before: "Who's dog is this", after: [{t: 'Whose', fix: true}, {t: 'dog'}, {t: 'is'}, {t: 'this?', fix: true}]},
  {app: 5, before: 'me and him are gonna be late', after: [{t: 'He and I', fix: true}, {t: 'are'}, {t: 'gonna'}, {t: 'be'}, {t: 'late'}]},
];
export const Tile: React.FC<{frame: number; i: number; marksAt: number}> = ({frame, i, marksAt}) => {
  const t = TILES[i];
  const m = marks[t.app];
  return (
    <div style={{width: 820, height: 440, background: '#fff', padding: '34px 40px'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 12, fontSize: 26, fontWeight: 600, color: c.ink2, marginBottom: 22}}>
        <Mark inner={m.inner} size={32} />{m.name}
      </div>
      <div style={{fontSize: 31, color: c.ink3, textDecoration: 'line-through', textDecorationColor: 'rgba(224,54,46,.6)', textDecorationThickness: 2, lineHeight: 1.4, marginBottom: 16}}>{t.before}</div>
      <div style={{fontSize: 40, lineHeight: 1.35}}><Marks toks={t.after} frame={frame} start={marksAt} step={0.05} /></div>
    </div>
  );
};

export const Pill: React.FC<{frame: number; tin: number; doneAt: number; tout: number}> = ({frame, tin, doneAt, tout}) => {
  const v = vis(frame, tin, tout, 0.15, 14);
  const done = frame >= S(doneAt);
  const spin = (frame * 7) % 360;
  const flip = clamp01((frame - S(doneAt)) / 8);
  return (
    <div style={{display: 'inline-flex', alignItems: 'center', gap: 12, padding: '12px 24px', borderRadius: 999, background: done ? c.greenInk : c.ink, color: '#fff', fontSize: 24, fontWeight: 600, boxShadow: '0 12px 30px rgba(0,0,0,.18)', opacity: v.opacity, filter: v.blur > 0.05 ? `blur(${v.blur}px)` : undefined, transform: `translateY(${v.dy}px) scale(${1 + 0.06 * Math.sin(flip * Math.PI)})`}}>
      {!done && <span style={{width: 20, height: 20, borderRadius: 10, border: '3px solid rgba(255,255,255,.35)', borderTopColor: '#fff', transform: `rotate(${spin}deg)`}} />}
      {done ? 'Fixed' : 'Fixing grammar'}
    </div>
  );
};
