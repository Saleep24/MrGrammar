import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {c, SCENES} from '../tokens';
import {rise, fadeOut} from '../anim';
const lines = ['Fixes spelling, grammar and punctuation.', 'Keeps your words and your tone.', 'Works in any text box.'];
export const Promise: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: fadeOut(f, SCENES.promise - 10)}}>
      <div style={{display: 'flex', flexDirection: 'column', gap: 26, width: 1440}}>
        <div style={{color: c.blue, fontSize: 28, fontWeight: 600, ...rise(f, 0)}}>Same message. Just fixed.</div>
        {lines.map((l, i) => (
          <div key={l} style={{display: 'flex', alignItems: 'center', gap: 24, fontSize: 60, fontWeight: 700, letterSpacing: '-.03em', lineHeight: 1.1, ...rise(f, 10 + i * 16)}}>
            <span style={{width: 52, height: 52, borderRadius: 26, background: c.blueSoft, color: c.blue, display: 'grid', placeItems: 'center', fontSize: 26, fontWeight: 700, flexShrink: 0}}>{i + 1}</span>{l}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
