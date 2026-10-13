const PROXY_URL = 'https://proxy-khaki-eight-20.vercel.app/api/grammar';
const ISSUES_URL = 'https://github.com/Saleep24/MrGrammar/issues/new/choose';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('version').textContent = 'v' + chrome.runtime.getManifest().version;
  document.getElementById('options-btn').addEventListener('click', () => chrome.runtime.openOptionsPage());
  document.getElementById('help-btn').addEventListener('click', () => chrome.tabs.create({ url: ISSUES_URL }));
  document.getElementById('change-shortcut').addEventListener('click', openShortcutSettings);
  showShortcut();
  showCorrectionCount();
  checkServiceStatus();
});

function shortcutsPageUrl() {
  return (navigator.userAgent.includes('Edg/') ? 'edge' : 'chrome') + '://extensions/shortcuts';
}

function openShortcutSettings() {
  chrome.tabs.create({ url: shortcutsPageUrl() });
}

async function showShortcut() {
  const elem = document.getElementById('keyboard-shortcut');
  try {
    const commands = await chrome.commands.getAll();
    const cmd = commands.find(c => c.name === 'fix-grammar');
    const bound = cmd && cmd.shortcut;
    elem.textContent = bound || 'Not set';
    elem.classList.toggle('unset', !bound);
  } catch (error) {
    elem.textContent = 'Unknown';
    console.warn('Could not read the keyboard shortcut', error);
  }
}

async function showCorrectionCount() {
  const { grammarStats } = await chrome.storage.local.get(['grammarStats']);
  const count = (grammarStats && grammarStats.totalCorrections) || 0;
  document.getElementById('correction-count').textContent = count.toLocaleString();
}

async function checkServiceStatus() {
  try {
    const response = await fetch(PROXY_URL, { method: 'OPTIONS' });
    if (response.ok) setStatus('Connected', 'status-connected');
    else setStatus('Service unavailable', 'status-disconnected');
  } catch (error) {
    setStatus('Connection error', 'status-disconnected');
    console.warn('Service status check failed', error);
  }
}

function setStatus(message, dotClass) {
  document.getElementById('api-status-text').textContent = message;
  document.getElementById('api-status-indicator').className = 'status-dot ' + dotClass;
}
