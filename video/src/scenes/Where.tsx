import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {c, SCENES, F} from '../tokens';
import {rise, pop, fadeOut} from '../anim';
import {marks, Mark} from '../marks';
export const Where: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 60, opacity: fadeOut(f, SCENES.where - F(10))}}>
      <div style={{fontSize: 80, fontWeight: 700, letterSpacing: '-.035em', ...rise(f, 0)}}>Works where you write.</div>
      <div style={{display: 'flex', gap: 28}}>
        {marks.map((m, i) => (
          <div key={m.name} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, ...pop(f, 10 + i * 6)}}>
            <div style={{width: 150, height: 150, borderRadius: 36, background: c.card, display: 'grid', placeItems: 'center'}}><Mark inner={m.inner} size={80} /></div>
            <span style={{fontSize: 26, color: c.ink2, fontWeight: 500}}>{m.name}</span>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
