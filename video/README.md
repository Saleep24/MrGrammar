# Launch video

The product launch video, built as code with Remotion so edits are a re-render, not a re-edit.

```
cd video
npm install
npx remotion studio                                                        # live preview in the browser
npx remotion render src/index.ts Launch out/mrgrammar-launch-16x9.mp4 --crf 16
npx remotion render src/index.ts LaunchSquare out/mrgrammar-launch-1x1.mp4 --crf 16
npx remotion render src/index.ts LaunchTall out/mrgrammar-launch-9x16.mp4 --crf 16
npx remotion render src/index.ts Launch out/mrgrammar-launch-16x9-4k.mp4 --scale 2 --crf 16
```

One film, three compositions. `src/Launch.tsx` holds the timeline (the `T` table, in seconds) and draws every beat; `src/layout.ts` places the same beats for 16:9, 1:1 and 9:16 so nothing is cropped; `src/scenes/content.tsx` holds the mock windows and the example tiles. Colors, type, the icon and the app logos come from the site so it matches mrgrammar.me.

Music is `public/audio/launch-track.mp3`, already levelled to -14 LUFS with an end fade, and is mixed in by the render. For the silent web copy on the site, re-encode with `ffmpeg -i <render> -an -crf 27 -movflags +faststart site/assets/video/launch.mp4`.
