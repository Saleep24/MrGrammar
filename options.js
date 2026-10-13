document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('version').textContent = 'v' + chrome.runtime.getManifest().version;
  document.getElementById('test-connection').addEventListener('click', testConnection);
  document.getElementById('change-shortcut').addEventListener('click', openShortcutSettings);
  document.getElementById('reset-stats').addEventListener('click', resetStatistics);
  document.getElementById('export-stats').addEventListener('click', exportStatistics);
  showShortcut();
  loadStatistics();
});

async function showShortcut() {
  const bound = await readFixGrammarShortcut();
  renderShortcut(document.getElementById('shortcut-key'), bound);
  const notes = {
    bound: 'Works on any page where you can select text.',
    unset: 'The shortcut is not assigned, usually because another extension already uses it. Pick a different one below.',
    unknown: 'Could not read the current shortcut.'
  };
  document.getElementById('shortcut-note').textContent = bound ? notes.bound : bound === '' ? notes.unset : notes.unknown;
}

async function testConnection() {
  const button = document.getElementById('test-connection');
  if (button.disabled) return;
  button.disabled = true;
  button.classList.add('loading');
  showStatus('Testing connection...', 'info');
  try {
    const response = await fetch(PROXY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'I goes to the store.' }),
      signal: AbortSignal.timeout(15000)
    });
    if (response.ok) {
      const data = await response.json();
      showStatus(`Connection successful! Corrected: "${data.correctedText}"`, 'success');
    } else {
      const error = await response.json().catch(() => ({}));
      showStatus(`Connection failed: ${error.error || 'Unknown error'}`, 'error');
    }
  } catch (error) {
    showStatus(error.name === 'TimeoutError' ? 'Connection failed: Timed out' : 'Connection failed: Network error', 'error');
    console.warn('Connection test failed', error);
  } finally {
    button.disabled = false;
    button.classList.remove('loading');
  }
}

function loadStatistics() {
  chrome.storage.local.get(['grammarStats'], (result) => {
    const stats = result.grammarStats || {};
    document.getElementById('total-corrections').textContent = (stats.totalCorrections || 0).toLocaleString();
    document.getElementById('words-corrected').textContent = (stats.wordsCorrected || 0).toLocaleString();
  });
}

function resetStatistics() {
  if (!confirm('Reset all statistics? This cannot be undone.')) return;
  chrome.storage.local.remove('grammarStats', () => {
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
