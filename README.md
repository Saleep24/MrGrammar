# MrGrammar

Free grammar correction in any text box in your browser. Highlight the text, right-click or press a shortcut, and the corrected version replaces it in place. No account, no API key, nothing to set up.

[Install from the Chrome Web Store](https://chromewebstore.google.com/detail/mrgrammar/jpecnjmadbehcdpnlfdoobfbohajpdel)

## How it works

1. Select the text you want to fix.
2. Right-click and choose **Fix Grammar with AI**, or press `Ctrl+Shift+E` (`Cmd+Shift+E` on Mac).
3. A small "Fixing grammar" pill appears while the text is processed, usually for about a second.
4. The selection is replaced with the corrected text. Spelling, grammar and punctuation are fixed. Your word choice, tone and style are left alone.

Behind the scenes the extension sends your selection to a small proxy server that asks Google Gemini for the correction, with Groq as a backup when Gemini is unavailable. The extension itself holds no keys and you never pay anything.

## Where it works

- Gmail
- Outlook on the web (outlook.office.com, outlook.office365.com, outlook.live.com)
- Slack
- LinkedIn messages and comments
- Facebook and Messenger
- Most websites with ordinary text boxes, comment fields or editors

On the sites listed above the extension is ready as soon as the page loads. On any other site it only touches the page when you invoke it there.

## Known limitations

- **Google Docs is not supported.** Docs draws its text on a canvas rather than as regular page text, so there is nothing for the extension to read. You will see a short message saying so if you try. Real support would need a separate integration with Docs.
- The LinkedIn post composer and some other heavily customised editors can reject outside changes. When that happens you will see "Couldn't replace the text" instead of a silent failure. Selecting the text again and retrying usually works.
- Selections are capped at 10,000 characters.
- The free service allows 10 corrections a minute and 200 a day per person. You will see a message if you hit the limit.

## Keyboard shortcut

The default is `Ctrl+Shift+E` on Windows, Linux and ChromeOS and `Cmd+Shift+E` on Mac. Change it at:

- Chrome: `chrome://extensions/shortcuts`
- Edge: `edge://extensions/shortcuts`
- Brave: `brave://extensions/shortcuts`

## Privacy

Text leaves your browser only when you ask for a correction, is not stored anywhere, and is never tied to you. The full details are in the [privacy policy](PRIVACY.md).

## For developers

The repository has two parts:

- The extension at the repository root (`manifest.json`, `background.js`, `content-script.js`, popup and options pages). Load it unpacked from `chrome://extensions` with Developer mode on.
- The proxy in `proxy/`, a single Vercel serverless function that holds the provider keys, applies rate limits and calls Gemini or Groq.

Run the tests with Node 22 or newer:

```
npm test
```

Build the store package:

```
npm run package
```

Bug reports and ideas are welcome through the [issue templates](https://github.com/Saleep24/MrGrammar/issues/new/choose).

## License

MIT
