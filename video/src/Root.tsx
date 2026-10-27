import React from 'react';
import {Composition} from 'remotion';
import {Launch} from './Launch';
import {FPS, DURATION} from './tokens';
const frames = DURATION * FPS;
export const Root: React.FC = () => (
  <>
    <Composition id="Launch" component={Launch} durationInFrames={frames} fps={FPS} width={1920} height={1080} />
    <Composition id="LaunchSquare" component={Launch} durationInFrames={frames} fps={FPS} width={1080} height={1080} />
    <Composition id="LaunchTall" component={Launch} durationInFrames={frames} fps={FPS} width={1080} height={1920} />
  </>
);
