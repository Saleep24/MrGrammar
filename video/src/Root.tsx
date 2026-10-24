import React from 'react';
import {Composition} from 'remotion';
import {Launch} from './Launch';
import {FPS, SCENES} from './tokens';
const total = Object.values(SCENES).reduce((a, b) => a + b, 0);
export const Root: React.FC = () => (
  <Composition id="Launch" component={Launch} durationInFrames={total} fps={FPS} width={1920} height={1080} />
);
