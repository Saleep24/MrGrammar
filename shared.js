const PROXY_URL = 'https://proxy-khaki-eight-20.vercel.app/api/grammar';
const ISSUES_URL = 'https://github.com/Saleep24/MrGrammar/issues/new/choose';

function shortcutsPageUrl() {
  return (navigator.userAgent.includes('Edg/') ? 'edge' : 'chrome') + '://extensions/shortcuts';
}

function openShortcutSettings() {
  chrome.tabs.create({ url: shortcutsPageUrl() });
}

// Returns the bound keys, '' when unassigned, or null when Chrome could not say
async function readFixGrammarShortcut() {
  try {
    const commands = await chrome.commands.getAll();
    const cmd = commands.find(c => c.name === 'fix-grammar');
    return (cmd && cmd.shortcut) || '';
  } catch (error) {
    console.warn('Could not read the keyboard shortcut', error);
    return null;
  }
}

function renderShortcut(elem, bound) {
  elem.textContent = bound || (bound === '' ? 'Not set' : 'Unknown');
  elem.classList.toggle('unset', !bound);
}
