const PROXY_URL = 'https://proxy-khaki-eight-20.vercel.app/api/grammar';

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('version').textContent = 'v' + chrome.runtime.getManifest().version;
  document.getElementById('test-connection').addEventListener('click', testConnection);
  document.getElementById('change-shortcut').addEventListener('click', openShortcutSettings);
  document.getElementById('reset-stats').addEventListener('click', resetStatistics);
  document.getElementById('export-stats').addEventListener('click', exportStatistics);
  showShortcut();
  loadStatistics();
});

function shortcutsPageUrl() {
  return (navigator.userAgent.includes('Edg/') ? 'edge' : 'chrome') + '://extensions/shortcuts';
}

function openShortcutSettings() {
  chrome.tabs.create({ url: shortcutsPageUrl() });
}

async function showShortcut() {
  const key = document.getElementById('shortcut-key');
  const note = document.getElementById('shortcut-note');
  try {
    const commands = await chrome.commands.getAll();
    const cmd = commands.find(c => c.name === 'fix-grammar');
    const bound = cmd && cmd.shortcut;
    key.textContent = bound || 'Not set';
    key.classList.toggle('unset', !bound);
    note.textContent = bound
      ? 'Works on any page where you can select text.'
      : 'The shortcut is not assigned, usually because another extension already uses it. Pick a different one below.';
  } catch (error) {
    key.textContent = 'Unknown';
    note.textContent = 'Could not read the current shortcut.';
    console.warn('Could not read the keyboard shortcut', error);
  }
}

async function testConnection() {
  const button = document.getElementById('test-connection');
  button.classList.add('loading');
  showStatus('Testing connection...', 'info');
  try {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'I goes to the store.' })
    });
    if (response.ok) {
      const data = await response.json();
      showStatus(`Connection successful! Corrected: "${data.correctedText}"`, 'success');
    } else {
      const error = await response.json().catch(() => ({}));
      showStatus(`Connection failed: ${error.error || 'Unknown error'}`, 'error');
    }
  } catch (error) {
    showStatus('Connection failed: Network error', 'error');
    console.warn('Connection test failed', error);
  } finally {
    button.classList.remove('loading');
  }
}

function loadStatistics() {
  chrome.storage.local.get(['grammarStats'], (result) => {
    const stats = result.grammarStats || { totalCorrections: 0, wordsCorrected: 0 };
    document.getElementById('total-corrections').textContent = (stats.totalCorrections || 0).toLocaleString();
    document.getElementById('words-corrected').textContent = (stats.wordsCorrected || 0).toLocaleString();
  });
}

function resetStatistics() {
  if (!confirm('Reset all statistics? This cannot be undone.')) return;
  chrome.storage.local.set({
    grammarStats: {
      totalCorrections: 0,
      wordsCorrected: 0,
      accuracyRate: 0,
      apiSuccessCount: 0,
      apiTotalCount: 0,
      replacementSuccessCount: 0,
      replacementTotalCount: 0
    }
  }, () => {
    showStatus('Statistics reset.', 'success');
    loadStatistics();
  });
}

function exportStatistics() {
  chrome.storage.local.get(['grammarStats'], (stats) => {
    const blob = new Blob([JSON.stringify(stats, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'mrgrammar-stats.json';
    link.click();
    URL.revokeObjectURL(link.href);
    showStatus('Statistics exported.', 'success');
  });
}

let hideStatusTimer;
function showStatus(message, type) {
  const statusDiv = document.getElementById('status');
  clearTimeout(hideStatusTimer);
  statusDiv.textContent = '';
  statusDiv.className = 'status-message ' + type;
  statusDiv.style.display = 'block';
  // Set text after render so the live region announces the change
  setTimeout(() => { statusDiv.textContent = message; }, 10);
  if (type === 'success') {
    hideStatusTimer = setTimeout(() => { statusDiv.style.display = 'none'; }, 5000);
  }
}
