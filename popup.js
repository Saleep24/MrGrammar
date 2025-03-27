document.addEventListener('DOMContentLoaded', async () => {
  // Set correct keyboard shortcut based on platform
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const shortcutElem = document.getElementById('keyboard-shortcut');
  shortcutElem.textContent = isMac ? 'Command+Shift+G' : 'Ctrl+Shift+G';
  
  // Add button event listeners
  document.getElementById('options-btn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  document.getElementById('help-btn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://github.com/yourusername/grammar-fix-extension#readme' });
  });
  
  // Check API connection status
  checkApiStatus();
});

async function checkApiStatus() {
  const statusText = document.getElementById('api-status-text');
  const statusIndicator = document.getElementById('api-status-indicator');
  
  try {
    // Get API key from storage
    const { openaiApiKey } = await chrome.storage.sync.get(['openaiApiKey']);
    
    if (!openaiApiKey) {
      setStatusDisconnected('API key not set');
      return;
    }
    
    // Make a simple request to test connectivity
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`
      }
    });
    
    if (response.ok) {
      setStatusConnected();
    } else {
      const error = await response.json();
      setStatusDisconnected(error.error?.message || 'Connection error');
    }
  } catch (error) {
    setStatusDisconnected('Connection error');
    console.error('API status check error:', error);
  }
}

function setStatusConnected() {
  const statusText = document.getElementById('api-status-text');
  const statusIndicator = document.getElementById('api-status-indicator');
  
  statusText.textContent = 'Connected';
  statusIndicator.className = 'status-indicator status-connected';
}

function setStatusDisconnected(message) {
  const statusText = document.getElementById('api-status-text');
  const statusIndicator = document.getElementById('api-status-indicator');
  
  statusText.textContent = message || 'Disconnected';
  statusIndicator.className = 'status-indicator status-disconnected';
} 