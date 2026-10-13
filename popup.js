document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('version').textContent = 'v' + chrome.runtime.getManifest().version;
  document.getElementById('options-btn').addEventListener('click', () => chrome.runtime.openOptionsPage());
  document.getElementById('help-btn').addEventListener('click', () => chrome.tabs.create({ url: ISSUES_URL }));
  document.getElementById('change-shortcut').addEventListener('click', openShortcutSettings);
  showShortcut();
  showCorrectionCount();
  checkServiceStatus();
});

async function showShortcut() {
  renderShortcut(document.getElementById('keyboard-shortcut'), await readFixGrammarShortcut());
}

async function showCorrectionCount() {
  const { grammarStats } = await chrome.storage.local.get(['grammarStats']);
  const count = (grammarStats && grammarStats.totalCorrections) || 0;
  document.getElementById('correction-count').textContent = count.toLocaleString();
}

async function checkServiceStatus() {
  try {
    const response = await fetch(PROXY_URL, { method: 'OPTIONS', signal: AbortSignal.timeout(10000) });
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
