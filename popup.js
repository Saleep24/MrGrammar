document.addEventListener('DOMContentLoaded', async () => {
  initializePopup();
  await checkServiceStatus();
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
async function checkServiceStatus() {
  const statusText = document.getElementById('api-status-text');
  const statusDot = document.getElementById('api-status-indicator');
  const modelBadge = document.getElementById('model-badge');
  try {
    const response = await fetch('https://proxy-khaki-eight-20.vercel.app/api/grammar', {
      method: 'OPTIONS'
    });
    if (response.ok) {
      setStatusConnected();
      showModelInfo('Gemini 2.5');
    } else {
      setStatusDisconnected('Service unavailable');
    }
  } catch (error) {
    setStatusDisconnected('Connection error');
    console.error('Service status check error:', error);
  }
}
function setStatusConnected() {
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
    modelBadge.textContent = modelName;
    modelBadge.style.display = 'inline';
  }
}
