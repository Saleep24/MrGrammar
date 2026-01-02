document.addEventListener('DOMContentLoaded', async () => {
  initializePopup();
  await checkApiStatus();
});
function initializePopup() {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const shortcutElem = document.getElementById('keyboard-shortcut');
  shortcutElem.textContent = isMac ? '⌘+Shift+E' : 'Ctrl+Shift+E';
  document.getElementById('options-btn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  document.getElementById('help-btn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://github.com/Saleep24' });
  });
  addInteractiveEffects();
}
function addInteractiveEffects() {
  const buttons = document.querySelectorAll('.action-btn');
  buttons.forEach(button => {
    button.addEventListener('click', function() {
      this.classList.add('loading');
      setTimeout(() => {
        this.classList.remove('loading');
      }, 1000);
    });
  });
}
async function checkApiStatus() {
  const statusText = document.getElementById('api-status-text');
  const statusDot = document.getElementById('api-status-indicator');
  const modelBadge = document.getElementById('model-badge');
  try {
    const { openaiApiKey, openaiModel } = await chrome.storage.sync.get(['openaiApiKey', 'openaiModel']);
    if (!openaiApiKey) {
      setStatusDisconnected('API key not set');
      return;
    }
    const modelName = getModelDisplayName(openaiModel || 'gpt-4o-mini');
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`
      }
    });
    if (response.ok) {
      setStatusConnected(modelName);
      showModelInfo(modelName);
    } else {
      const error = await response.json();
      setStatusDisconnected(error.error?.message || 'Connection error');
    }
  } catch (error) {
    setStatusDisconnected('Connection error');
    console.error('API status check error:', error);
  }
}
function getModelDisplayName(modelId) {
  const modelNames = {
    'gpt-3.5-turbo': 'GPT-3.5 Turbo',
    'gpt-4o-mini': 'GPT-4o Mini',
    'gpt-4': 'GPT-4',
    'gpt-4o': 'GPT-4o'
  };
  return modelNames[modelId] || modelId;
}
function setStatusConnected(modelName) {
  const statusText = document.getElementById('api-status-text');
  const statusDot = document.getElementById('api-status-indicator');
  if (statusText) statusText.textContent = 'Connected';
  if (statusDot) statusDot.className = 'status-dot status-connected';
}
function setStatusDisconnected(message) {
  const statusText = document.getElementById('api-status-text');
  const statusDot = document.getElementById('api-status-indicator');
  if (statusText) statusText.textContent = message || 'Disconnected';
  if (statusDot) statusDot.className = 'status-dot status-disconnected';
}
function showModelInfo(modelName) {
  const modelBadge = document.getElementById('model-badge');
  if (modelBadge) {
    const shortModelName = getShortModelName(modelName);
    modelBadge.textContent = shortModelName;
    modelBadge.style.display = 'inline';
  }
}
function getShortModelName(modelName) {
  const shortNames = {
    'GPT-3.5 Turbo': 'GPT-3.5',
    'GPT-4o Mini': 'GPT-4o Mini',
    'GPT-4': 'GPT-4',
    'GPT-4o': 'GPT-4o'
  };
  return shortNames[modelName] || modelName;
}
