import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {SCENES, c, font} from './tokens';
import {Problem} from './scenes/Problem';
import {Demo} from './scenes/Demo';
import {Promise} from './scenes/Promise';
import {Where} from './scenes/Where';
import {End} from './scenes/End';
export const Launch: React.FC = () => {
  let at = 0;
  const seq = (len: number, el: React.ReactNode) => {
    const from = at; at += len;
    return <Sequence from={from} durationInFrames={len}>{el}</Sequence>;
  };
  return (
    <AbsoluteFill style={{background: c.bg, fontFamily: font, color: c.ink}}>
      {seq(SCENES.problem, <Problem />)}
      {seq(SCENES.demo, <Demo />)}
      {seq(SCENES.promise, <Promise />)}
      {seq(SCENES.where, <Where />)}
      {seq(SCENES.end, <End />)}
    </AbsoluteFill>
  );
};
