import React from 'react';
import {AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame} from 'remotion';
import {c, FPS, SCENES} from '../tokens';
import {pop, rise, fadeOut} from '../anim';
const popSoft = (f: number, d: number) => { const s = spring({frame: f - d, fps: FPS, config: {damping: 14, stiffness: 180}}); return {opacity: 0.45 + 0.55 * Math.min(1, s * 2), transform: `scale(${0.8 + 0.2 * s})`}; };

const before = 'Their going to the meeting tommorow, i think we should of sent the agenda earlier so everyone have time to prepare.'.split(' ');
const after: {t: string; fix?: boolean}[] = [
  {t: "They're", fix: true}, {t: 'going'}, {t: 'to'}, {t: 'the'}, {t: 'meeting'}, {t: 'tomorrow.', fix: true}, {t: 'I', fix: true}, {t: 'think'}, {t: 'we'},
  {t: 'should have', fix: true}, {t: 'sent'}, {t: 'the'}, {t: 'agenda'}, {t: 'earlier'}, {t: 'so'}, {t: 'everyone'}, {t: 'has', fix: true}, {t: 'time'}, {t: 'to'}, {t: 'prepare.'},
];
// Timeline in frames, local to this scene
const T = {win: 0, selStart: 30, selEnd: 72, menu: 96, hover: 114, click: 138, fixed: 204};

const Row: React.FC<{label: string; value: string}> = ({label, value}) => (
  <div style={{display: 'flex', gap: 18, padding: '14px 0', borderBottom: `1px solid ${c.line}`, fontSize: 26}}>
    <span style={{color: c.ink3, width: 110}}>{label}</span><span>{value}</span>
  </div>
);

export const Demo: React.FC = () => {
  const f = useCurrentFrame();
  const winIn = spring({frame: f, fps: FPS, config: {damping: 200}});
  const selected = Math.floor(interpolate(f, [T.selStart, T.selEnd], [0, before.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  const showMenu = f >= T.menu && f < T.click;
  const hovered = f >= T.hover && f < T.click;
  const busy = f >= T.click && f < T.fixed;
  const done = f >= T.fixed;
  const spin = (f * 14) % 360;
  // Cursor path: starts low right, moves to end of selection, then to the menu item
  const cx = interpolate(f, [T.selStart, T.selEnd, T.menu, T.hover], [980, 1210, 1210, 1310], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cy = interpolate(f, [T.selStart, T.selEnd, T.menu, T.hover], [560, 612, 612, 742], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const cursorOpacity = interpolate(f, [T.selStart - 10, T.selStart, T.click, T.click + 8], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const pillIn = spring({frame: f - T.click, fps: FPS, config: {damping: 200}});

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: fadeOut(f, SCENES.demo - 10)}}>
      <div style={{width: 1240, background: '#fff', borderRadius: 24, boxShadow: '0 30px 80px rgba(0,0,0,.14)', border: `1px solid ${c.line}`, overflow: 'hidden', opacity: winIn, transform: `translateY(${(1 - winIn) * 40}px) scale(${0.96 + 0.04 * winIn})`}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, padding: '16px 22px', background: c.card, borderBottom: `1px solid ${c.line}`}}>
          {['#ff5f57', '#febc2e', '#28c840'].map((col) => <span key={col} style={{width: 14, height: 14, borderRadius: 7, background: col}} />)}
          <span style={{marginLeft: 12, fontSize: 22, fontWeight: 600, color: c.ink2}}>New message</span>
        </div>
        <div style={{padding: '6px 34px 34px'}}>
          <Row label="To" value="Brenda Garcia" />
          <Row label="Subject" value="Agenda for Thursday" />
          <div style={{fontSize: 32, lineHeight: 1.5, paddingTop: 24, display: 'flex', flexDirection: 'column', gap: 22}}>
            <p>Hi Brenda,</p>
            <p style={{position: 'relative'}}>
              {!done && before.map((w, i) => (
                <span key={i} style={{background: i < selected ? c.sel : 'transparent', borderRadius: 4, padding: '2px 0'}}>{w}{i < before.length - 1 ? ' ' : ''}</span>
              ))}
              {done && after.map((w, i) => (
                <span key={i}>
                  {w.fix ? (
                    <span style={{display: 'inline-block', background: c.greenSoft, color: c.greenInk, borderRadius: 6, padding: '0 6px', ...popSoft(f, T.fixed + after.slice(0, i).filter((x) => x.fix).length * 4)}}>{w.t}</span>
                  ) : w.t}
                  {i < after.length - 1 ? ' ' : ''}
                </span>
              ))}
            </p>
            <p>Can you share the deck when it's ready?</p>
            <p>Thanks,<br />Saleep</p>
          </div>
        </div>
      </div>

      {showMenu && (
        <div style={{position: 'absolute', left: 1210, top: 600, width: 330, background: '#fff', borderRadius: 14, boxShadow: '0 16px 50px rgba(0,0,0,.22)', border: `1px solid ${c.line}`, padding: 8, fontSize: 24, ...pop(f, T.menu)}}>
          {['Copy', 'Paste'].map((t) => <div key={t} style={{padding: '10px 16px', color: c.ink2}}>{t}</div>)}
          <div style={{height: 1, background: c.line, margin: '6px 4px'}} />
          <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 10, background: hovered ? c.blue : 'transparent', color: hovered ? '#fff' : c.ink, fontWeight: 600}}>
            <Img src={staticFile('icon.png')} style={{width: 26, height: 26}} />Fix Grammar with AI
          </div>
          <div style={{height: 1, background: c.line, margin: '6px 4px'}} />
          <div style={{padding: '10px 16px', color: c.ink2}}>Inspect</div>
        </div>
      )}

      <svg width="30" height="36" viewBox="0 0 18 22" style={{position: 'absolute', left: cx, top: cy, opacity: cursorOpacity}}>
        <path d="M1 1l6 18 2.6-6.8L16.5 10 1 1z" fill="#fff" stroke="#1d1d1f" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>

      {(busy || done) && (
        <div style={{position: 'absolute', bottom: 70, display: 'flex', alignItems: 'center', gap: 14, padding: '14px 28px', borderRadius: 999, background: done ? c.greenInk : c.ink, color: '#fff', fontSize: 26, fontWeight: 600, opacity: pillIn, transform: `translateY(${(1 - pillIn) * 20}px)`}}>
          {busy && <span style={{width: 22, height: 22, borderRadius: 11, border: '3px solid rgba(255,255,255,.35)', borderTopColor: '#fff', transform: `rotate(${spin}deg)`}} />}
          {busy ? 'Fixing grammar' : 'Fixed'}
        </div>
      )}

      {showMenu && (
        <div style={{position: 'absolute', top: 60, right: 90, display: 'flex', gap: 8, ...rise(f, T.menu + 6)}}>
          <span style={{fontSize: 22, color: c.ink2, marginRight: 8, alignSelf: 'center'}}>or press</span>
          {['⌘', '⇧', 'E'].map((k) => <kbd key={k} style={{fontSize: 24, fontWeight: 600, background: '#fff', border: '1px solid #d2d2d7', boxShadow: '0 2px 0 #d2d2d7', borderRadius: 8, padding: '6px 14px'}}>{k}</kbd>)}
        </div>
      )}
    </AbsoluteFill>
  );
};
