document.addEventListener('DOMContentLoaded', async () => {
  // Initialize popup
  initializePopup();
  
  // Check API status
  await checkApiStatus();
});

function initializePopup() {
  // Set keyboard shortcut based on platform
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const shortcutElem = document.getElementById('keyboard-shortcut');
  shortcutElem.textContent = isMac ? '⌘+Shift+E' : 'Ctrl+Shift+E';

  // Add event listeners
  document.getElementById('options-btn').addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  document.getElementById('help-btn').addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://github.com/Saleep24' });
  });

  // Add hover effects and animations
  addInteractiveEffects();
}

function addInteractiveEffects() {
  // Add loading state to buttons
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(button => {
    button.addEventListener('click', function() {
      this.classList.add('loading');
      setTimeout(() => {
        this.classList.remove('loading');
      }, 1000);
    });
  });

  // Add ripple effect to action cards
  const actionCards = document.querySelectorAll('.action-card');
  actionCards.forEach(card => {
    card.addEventListener('click', createRippleEffect);
  });
}

function createRippleEffect(event) {
  const ripple = document.createElement('span');
  const rect = event.currentTarget.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height);
  const x = event.clientX - rect.left - size / 2;
  const y = event.clientY - rect.top - size / 2;
  
  ripple.style.cssText = `
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    left: ${x}px;
    top: ${y}px;
    background: rgba(99, 102, 241, 0.3);
    border-radius: 50%;
    transform: scale(0);
    animation: ripple 0.6s linear;
    pointer-events: none;
  `;
  
  event.currentTarget.style.position = 'relative';
  event.currentTarget.appendChild(ripple);
  
  setTimeout(() => {
    ripple.remove();
  }, 600);
}

async function checkApiStatus() {
  const statusText = document.getElementById('api-status-text');
  const statusIndicator = document.getElementById('api-status-indicator');
  const modelInfo = document.getElementById('model-info');
  const modelBadge = document.getElementById('model-badge');
  
  try {
    // Get stored settings
    const { openaiApiKey, openaiModel } = await chrome.storage.sync.get(['openaiApiKey', 'openaiModel']);
    
    if (!openaiApiKey) {
      setStatusDisconnected('API key not set');
      return;
    }
    
    // Get model display name
    const modelName = getModelDisplayName(openaiModel || 'gpt-4o-mini');

    // Test API connection
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
  const statusIndicator = document.getElementById('api-status-indicator');
  
  statusText.textContent = 'Connected';
  statusIndicator.className = 'status-indicator status-connected';
  
  // Add success animation
  statusIndicator.style.animation = 'pulse 2s infinite';
}

function setStatusDisconnected(message) {
  const statusText = document.getElementById('api-status-text');
  const statusIndicator = document.getElementById('api-status-indicator');
  
  statusText.textContent = message || 'Disconnected';
  statusIndicator.className = 'status-indicator status-disconnected';
  statusIndicator.style.animation = '';
}

function showModelInfo(modelName) {
  const modelInfo = document.getElementById('model-info');
  const modelBadge = document.getElementById('model-badge');
  
  modelBadge.textContent = modelName;
  modelInfo.style.display = 'flex';
  
  // Add fade-in animation
  modelInfo.style.opacity = '0';
  modelInfo.style.transform = 'translateY(10px)';
  modelInfo.style.transition = 'all 0.3s ease-out';
  
  setTimeout(() => {
    modelInfo.style.opacity = '1';
    modelInfo.style.transform = 'translateY(0)';
  }, 100);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes ripple {
    to {
      transform: scale(4);
      opacity: 0;
    }
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .popup-container {
    animation: fadeIn 0.3s ease-out;
  }
`;
document.head.appendChild(style); 