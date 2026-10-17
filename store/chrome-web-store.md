# Chrome Web Store listing

Everything that goes into the developer console for the MrGrammar item, so a
store update is a copy and paste job. Keep this in sync with the manifest,
README and PRIVACY.md.

- Console: https://chrome.google.com/webstore/devconsole
- Item id: jpecnjmadbehcdpnlfdoobfbohajpdel
- Public listing: https://chromewebstore.google.com/detail/mrgrammar/jpecnjmadbehcdpnlfdoobfbohajpdel

## Release steps

1. On main, confirm `manifest.json` has a version higher than the one in the
   store, then run `npm test` and `npm run package`. The zip lands at the repo
   root as `mrgrammar-<version>.zip`.
2. Tag the release on GitHub with the same version and attach the zip.
3. In the console open the item, go to Package, Upload new package, and pick
   the zip.
4. Update Store listing, Privacy practices and Distribution with the text
   below. Replace the old screenshots with the files in `store/screenshots/`.
5. Save draft, then Submit for review. Leave "Publish automatically after
   review" on unless you want to time the release.
6. Review usually takes one to three days. Reply to any feedback in the
   console and resubmit. Existing users update on their own within a day or
   so of publishing.

## Store listing tab

Title comes from the manifest: MrGrammar.

Summary comes from the manifest description (132 character limit):

> Free AI-powered grammar correction directly in your browser. Compatible with Gmail, LinkedIn, Slack, and many more.

Detailed description:

> Free grammar correction in any text box in your browser. Highlight the text, right-click or press a shortcut, and the corrected version replaces it in place. No account, no API key, nothing to set up.
>
> HOW IT WORKS
> 1. Select the text you want to fix.
> 2. Right-click and choose "Fix Grammar with AI", or press Ctrl+Shift+E (Cmd+Shift+E on Mac).
> 3. A small "Fixing grammar" pill appears while the text is processed, usually for about a second.
> 4. The selection is replaced with the corrected text.
>
> Spelling, grammar and punctuation are fixed. Your word choice, tone and style are left alone.
>
> WHERE IT WORKS
> Gmail, Outlook on the web, Slack, LinkedIn messages and comments, Facebook and Messenger, and most websites with ordinary text boxes, comment fields or editors. On the listed sites the extension is ready as soon as the page loads. On any other site it only touches the page when you invoke it there.
>
> FREE, WITH NO SETUP
> The extension holds no keys and you never pay anything. Corrections are produced by Google Gemini through a small server we run, with Groq as a backup when Gemini is unavailable. The free service allows 10 corrections a minute and 200 a day per person.
>
> PRIVACY
> Text leaves your browser only when you ask for a correction. It is not stored anywhere and is never tied to you. There are no accounts, no sign in, no cookies, no advertising and no analytics. Full policy: https://github.com/Saleep24/MrGrammar/blob/main/PRIVACY.md
>
> KNOWN LIMITATIONS
> Google Docs is not supported, because Docs draws its text on a canvas rather than as regular page text. Some heavily customised editors can reject outside changes, in which case you will see "Couldn't replace the text" and can retry. Selections are capped at 10,000 characters.
>
> OPEN SOURCE
> The code is on GitHub under the MIT license. Bug reports and ideas are welcome: https://github.com/Saleep24/MrGrammar/issues

Category: Tools (Workflow & Planning is the alternative).

Language: English.

Store icon: `icons/icon-128.png`. The 1024 px source the smaller icons were cut from is in git history at `ca02f28^:icons/icon-48.png`.

Screenshots, 1280x800, upload in this order:

1. `store/screenshots/01-hero.png`, select, right-click, done
2. `store/screenshots/02-before-after.png`, what gets fixed and what is left alone
3. `store/screenshots/03-popup-sites.png`, popup and supported sites
4. `store/screenshots/04-options.png`, settings page and local usage counts

Small promo tile, 440x280: `store/screenshots/05-promo-tile.png`.

To regenerate the images after a UI change, run `store/screenshots/render.sh`. The mockup sources are in `store/screenshots/src/`.

Additional fields:

- Homepage URL: https://github.com/Saleep24/MrGrammar
- Support URL: https://github.com/Saleep24/MrGrammar/issues (the templates page redirects logged-out visitors to sign in)
- Mature content: No

## Privacy practices tab

Single purpose description:

> MrGrammar corrects the spelling, grammar and punctuation of text the user selects in a web page and replaces the selection with the corrected text.

Permission justifications:

- contextMenus: Adds the "Fix Grammar with AI" item to the right-click menu, which is the main way users trigger a correction on selected text.
- activeTab: On sites not listed in the manifest, lets the extension read the selected text and write the correction back only in the tab where the user right-clicked or pressed the shortcut, and only at that moment.
- scripting: Injects the small function that reads the current selection and replaces it with the corrected text in the editor the user is typing in.
- storage: Keeps a count of corrections and words corrected on the user's device so the options page can show usage. Nothing else is stored and the counts never leave the browser.
- Host permissions: The proxy host (proxy-khaki-eight-20.vercel.app) is the server that produces corrections. Gmail, Outlook, Slack, LinkedIn, Facebook and Messenger are listed so the content script is ready as soon as those pages load, because their editors need site-specific handling to replace text reliably.

Remote code: No, this extension does not use remote code. All JavaScript ships in the package. The proxy returns plain text only.

Data usage, check these three and leave the rest unchecked:

- Website content: the text the user selects is sent to the proxy for correction.
- Personal communications: the selected text can be part of an email or chat message, for example in Gmail, Slack or Messenger.
- Location: the proxy keeps the IP address with a request count for up to 24 hours to enforce the rate limit, as PRIVACY.md discloses. It is never linked to text.

Nothing else is collected: no personally identifiable information, health, financial or authentication data, web history or user activity.

Certify all three statements:

- Data is not sold to third parties, outside of approved use cases
- Data is not used or transferred for purposes unrelated to the item's core functionality
- Data is not used or transferred to determine creditworthiness or for lending purposes

Privacy policy URL: https://github.com/Saleep24/MrGrammar/blob/main/PRIVACY.md

## Distribution tab

- Visibility: Public
- Regions: All regions
- Payments: Free of charge

## Watch items for the v2.1 to v3.x update

- The v2.1 listing describes the bring-your-own-OpenAI-key build. Replace the description and every old screenshot, especially anything showing an API key field.
- v3 drops the broad permissions v2.1 asked for and adds specific hosts. Because the new set is narrower, existing users should update without a new permissions prompt. If Chrome does prompt, the extension stays disabled for that user until they accept.
- Host permissions and the "Website content" disclosure usually mean a longer manual review. The justifications above answer the questions reviewers ask.
- The support email in the console account settings must be a monitored address. Verify it before submitting.
