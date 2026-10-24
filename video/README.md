# Launch video

The product launch video, built as code with Remotion so edits are a re-render, not a re-edit.

```
cd video
npm install
npx remotion studio            # live preview in the browser
npx remotion render src/index.ts Launch out/mrgrammar-launch.mp4
```

Scenes live in `src/scenes`, one file each, timed in `src/tokens.ts`. Colors, type and the icon and app logos come from the site so it matches mrgrammar.me. Silent by default; to add music, drop a file in `public/audio` and add an `<Audio>` element in `src/Launch.tsx`.
