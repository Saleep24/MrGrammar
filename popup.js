document.addEventListener('DOMContentLoaded', async () => {
  // Set correct keyboard shortcut based on platform
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const shortcutElem = document.getElementById('keyboard-shortcut');
  shortcutElem.textContent = isMac ? 'Command+Shift+E' : 'Ctrl+Shift+E';
  
  // Add button event listeners
  document.getElementById('options-btn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  document.getElementById('help-btn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://github.com/yourusername/grammar-fix-extension#readme' });
  });
  
  // Check API connection status and display model info
  checkApiStatus();
});

async function checkApiStatus() {
  const statusText = document.getElementById('api-status-text');
  const statusIndicator = document.getElementById('api-status-indicator');
  
  try {
    // Get API key and model from storage
    const { openaiApiKey, openaiModel } = await chrome.storage.sync.get(['openaiApiKey', 'openaiModel']);
    
    if (!openaiApiKey) {
      setStatusDisconnected('API key not set');
      return;
    }
    
    // Set model info
    const modelName = getModelDisplayName(openaiModel || 'gpt-4o-mini');
    
    // Make a simple request to test connectivity
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`
      }
    });
    
    if (response.ok) {
      setStatusConnected(modelName);
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
  const statusIndicator = document.getElementById('api-status-indicator');
  
  statusText.textContent = `Connected (${modelName})`;
  statusIndicator.className = 'status-indicator status-connected';
}

function setStatusDisconnected(message) {
  const statusText = document.getElementById('api-status-text');
  const statusIndicator = document.getElementById('api-status-indicator');
  
  statusText.textContent = message || 'Disconnected';
  statusIndicator.className = 'status-indicator status-disconnected';
} 