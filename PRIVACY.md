# MrGrammar privacy policy

Effective October 5, 2026.

MrGrammar is a browser extension that corrects the grammar of text you select. This page explains what the extension does with your data. The short version: the text you ask it to fix is sent to our server and on to an AI provider for correction, nothing is stored, and nothing else about you is collected.

## What is sent, and when

- Nothing leaves your browser until you ask for a correction by using the right-click menu or the keyboard shortcut.
- At that moment, the text you selected is sent over an encrypted connection to the MrGrammar proxy server, hosted on Vercel.
- The proxy forwards that text to Google's Gemini API to produce the correction. If Gemini is unavailable, the text is sent to Groq instead.
- The corrected text comes back and replaces your selection. The exchange is over.

## What is stored

- The proxy does not store or log the text you send, or the corrections it returns.
- To keep the free service running fairly, the proxy counts requests per network address for up to 24 hours. These counters hold only a request count and your IP address, expire on their own, and are never linked to text.
- The extension keeps a count of corrections and words corrected on your own device, so the options page can show your usage. This never leaves your browser and you can reset it any time.
- There are no accounts, no sign in, no cookies, no advertising and no analytics.

## Third parties that process your text

- Google (Gemini API) and Groq correct the text. Their handling of API traffic is governed by their own terms. Text is sent without any identifying information about you.
- Vercel hosts the proxy server and Upstash stores the request counters described above.

We do not sell or share your data with anyone else.

## Permissions the extension asks for

- Read and change data on the listed sites (Gmail, Outlook, Slack, LinkedIn, Facebook, Messenger): needed to read your selection and write the corrected text back into those editors.
- Access to the page you are on when you invoke the extension: on any other website, the extension only touches the page after you right-click or press the shortcut on it.
- Context menus and keyboard shortcuts: to offer the "Fix Grammar with AI" command.
- Local storage: to keep the usage counts described above on your device.

## Changes and contact

If this policy changes, the new version will be published at this address with a new effective date. Questions and concerns can be raised at https://github.com/Saleep24/MrGrammar/issues.
