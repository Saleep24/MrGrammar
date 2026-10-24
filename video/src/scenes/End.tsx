import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {c} from '../tokens';
import {rise, pop} from '../anim';
export const End: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', gap: 22}}>
      <Img src={staticFile('icon.png')} style={{width: 160, height: 160, borderRadius: 40, ...pop(f, 0)}} />
      <div style={{fontSize: 96, fontWeight: 700, letterSpacing: '-.04em', ...rise(f, 8)}}>MrGrammar</div>
      <div style={{fontSize: 36, color: c.ink2, ...rise(f, 16)}}>Free grammar fixes in any text box. No account, no setup.</div>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, fontSize: 30, color: c.ink2, ...rise(f, 24)}}>
        <span style={{color: '#f5a623', letterSpacing: 2}}>★★★★★</span> 5.0 on the Chrome Web Store
      </div>
      <div style={{marginTop: 18, background: c.blue, color: '#fff', fontSize: 34, fontWeight: 600, padding: '20px 44px', borderRadius: 999, ...pop(f, 32)}}>Add to Chrome</div>
      <div style={{fontSize: 34, fontWeight: 600, color: c.blue, marginTop: 10, ...rise(f, 40)}}>mrgrammar.me</div>
    </AbsoluteFill>
  );
};
