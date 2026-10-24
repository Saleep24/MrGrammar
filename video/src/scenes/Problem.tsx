import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {c, F} from '../tokens';
import {rise, pop, typed, fadeOut} from '../anim';
import {SCENES} from '../tokens';

const Card: React.FC<{label: string; children: React.ReactNode; style?: React.CSSProperties}> = ({label, children, style}) => (
  <div style={{background: c.card, borderRadius: 24, padding: '28px 36px', width: 980, ...style}}>
    <div style={{fontSize: 18, fontWeight: 600, letterSpacing: '.08em', color: c.ink3, marginBottom: 12}}>{label}</div>
    <div style={{fontSize: 40, lineHeight: 1.3}}>{children}</div>
  </div>
);

export const Problem: React.FC = () => {
  const f = useCurrentFrame();
  const msg = 'hey can u send me the file when u get a sec, no rush tho';
  const typedMsg = typed(msg, f, F(14), 1.4);
  const caret = f < F(14 + msg.length * 1.4 + 6) && Math.floor(f / 8) % 2 === 0;
  const rewrite = 'Hello, could you please send me the file at your earliest convenience? There is no rush.'.split(' ');
  const struck = Math.floor(interpolate(f, [F(84), F(110)], [0, rewrite.length], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 36, opacity: fadeOut(f, SCENES.problem - F(10))}}>
      <div style={{fontSize: 88, fontWeight: 700, letterSpacing: '-.035em', lineHeight: 1.02, ...rise(f, 0)}}>Every AI tool rewrites you.</div>
      <Card label="YOU WROTE" style={rise(f, 12)}>
        {typedMsg}<span style={{opacity: caret ? 1 : 0, color: c.blue}}>|</span>
      </Card>
      <Card label="A TYPICAL AI REWRITE" style={{...rise(f, 62), background: '#fff', border: `1px solid ${c.line}`}}>
        <span style={{color: '#a33'}}>
          {rewrite.map((w, i) => (
            <span key={i} style={{textDecoration: i < struck ? 'line-through' : 'none', textDecorationColor: c.red, textDecorationThickness: 4}}>{w}{i < rewrite.length - 1 ? ' ' : ''}</span>
          ))}
        </span>
        <div style={{display: 'inline-block', marginTop: 16, background: '#fde8e6', color: '#b42318', fontSize: 24, fontWeight: 600, padding: '8px 18px', borderRadius: 999, ...pop(f, 112)}}>
          Polite. Formal. Not you.
        </div>
      </Card>
    </AbsoluteFill>
  );
};
