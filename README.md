# MrGrammar Browser Extension

A browser extension that fixes grammar and polishes text directly in your browser using OpenAI's API. Simply highlight text, right-click, and let AI handle the rest!


## Features
- **One-click grammar correction** via right-click context menu.
- **Powered by OpenAI's latest models** (GPT-3.5, GPT-4o Mini, GPT-4, GPT-4o).
- **Keyboard shortcuts** for faster text correction.
- **Loading indicator** shows when your text is being processed.
- **Text statistics** displaying character, word, and sentence counts.
- **Popup UI** with quick access to options and API status.
- Works in Gmail, Google Docs, CMS, and most editable fields.
- **LinkedIn messaging support** with advanced state synchronization.
- Fallback to clipboard copy for non-editable text.
- Lightweight and easy to set up.

## LinkedIn Integration

### Overview
Mr. Grammar includes specialized support for LinkedIn messaging that addresses the unique challenges of LinkedIn's rich text editor. The extension uses multiple fallback methods to ensure corrected text is properly registered by LinkedIn's internal state before messages are sent.

### How It Works
1. **Multi-Method Approach**: The extension tries four different methods to replace text:
   - Direct DOM manipulation with comprehensive event triggering
   - Programmatic text insertion with focus management
   - Clipboard-based replacement
   - Simulated user typing

2. **State Synchronization**: After text replacement, the extension triggers multiple events to ensure LinkedIn's internal state is updated:
   - `input` events
   - `change` events
   - `compositionstart` and `compositionend` events
   - `keyup` events
   - Focus/blur cycles

3. **Comprehensive Selector Support**: The extension searches for LinkedIn message composers using multiple selectors to handle different LinkedIn interfaces and updates.

### Troubleshooting LinkedIn Issues

If you're experiencing issues with LinkedIn messaging:

1. **Open Browser Console**: Press F12 and go to the Console tab
2. **Run Debug Command**: Type `debugLinkedInGrammarFixer()` and press Enter
3. **Check Output**: Look for information about found message composers and their properties
4. **Verify Selection**: Ensure text is properly selected before using the extension

### Common LinkedIn Issues and Solutions

**Issue**: Corrected text appears visually but original text is sent
- **Solution**: The extension now uses multiple fallback methods and comprehensive event triggering to ensure LinkedIn's state is properly updated

**Issue**: Extension doesn't work in LinkedIn messaging
- **Solution**: Make sure you're on `www.linkedin.com` and try refreshing the page if the extension was installed after the page loaded

**Issue**: Text replacement doesn't work in specific LinkedIn contexts
- **Solution**: The extension supports multiple LinkedIn interfaces including direct messages, connection requests, and post comments

## Setup Instructions
1. Install the extension from the Chrome Web Store or load it as an unpacked extension.
2. Get your OpenAI API key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys).
3. Click the extension icon, then click "Options" to open the settings page.
4. Enter your OpenAI API key and choose your preferred model:
   - **GPT-3.5 Turbo**: Basic grammar fixes (lowest cost)
   - **GPT-4o Mini**: Recommended — better quality at reasonable cost
   - **GPT-4**: Premium quality for complex text
   - **GPT-4o**: Latest model with the highest quality
5. Save your settings.

## Usage
1. Highlight the text you want to correct.
2. Either:
   - Right-click and select "Fix Grammar with AI" from the context menu, or
   - Use the keyboard shortcut: `Ctrl+Shift+E` (Windows/Linux) or `Command+Shift+E` (Mac)
3. A loading indicator will appear while the text is being processed.
4. The highlighted text will be automatically replaced with the corrected version.
5. A notification with text statistics will appear, showing the changes in character count, word count, and sentence count.

## Keyboard Shortcuts
- **Fix Grammar**: `Ctrl+Shift+E` (Windows/Linux) or `Command+Shift+E` (Mac)

You can customize these shortcuts by visiting:
- Chrome: `chrome://extensions/shortcuts`
- Edge: `edge://extensions/shortcuts`
- Brave: `brave://extensions/shortcuts`

## Privacy
- Your API key is stored securely in your browser's local storage.
- Text is sent directly from your browser to OpenAI's API.
- The extension does not collect or store any of your text data.

## Credits
- Powered by [OpenAI API](https://openai.com/blog/openai-api)
- Icons from [Material Design Icons](https://material.io/resources/icons/)

## License
MIT
