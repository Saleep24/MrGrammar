document.addEventListener('DOMContentLoaded', () => {
  // Initialize options page
  initializeOptions();
  
  // Load saved settings
  loadSettings();
  
  // Load statistics
  loadStatistics();
});

function initializeOptions() {
  // Add event listeners
  document.getElementById('save').addEventListener('click', saveSettings);
  document.getElementById('test-connection').addEventListener('click', testConnection);
  document.getElementById('toggle-api-key').addEventListener('click', toggleApiKeyVisibility);
  document.getElementById('reset-stats').addEventListener('click', resetStatistics);
  document.getElementById('export-settings').addEventListener('click', exportSettings);
  
  // Add model card selection
  addModelCardSelection();
  
  // Add interactive effects
  addInteractiveEffects();
}

function addModelCardSelection() {
  const modelCards = document.querySelectorAll('.model-card');
  const modelSelect = document.getElementById('model');
  
  modelCards.forEach(card => {
    card.addEventListener('click', () => {
      const model = card.dataset.model;
      modelSelect.value = model;
      
      // Update visual selection
      modelCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      
      // Add selection animation
      card.style.transform = 'scale(1.02)';
      setTimeout(() => {
        card.style.transform = '';
      }, 200);
    });
  });
  
  // Update model cards when select changes
  modelSelect.addEventListener('change', () => {
    const selectedModel = modelSelect.value;
    modelCards.forEach(card => {
      card.classList.remove('selected');
      if (card.dataset.model === selectedModel) {
        card.classList.add('selected');
      }
    });
  });
}

function addInteractiveEffects() {
  // Add loading states to buttons
  const buttons = document.querySelectorAll('.btn');
  buttons.forEach(button => {
    button.addEventListener('click', function() {
      if (!this.classList.contains('loading')) {
        this.classList.add('loading');
        setTimeout(() => {
          this.classList.remove('loading');
        }, 2000);
      }
    });
  });
  
  // Add hover effects to form inputs
  const inputs = document.querySelectorAll('.form-input, .form-select');
  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      this.parentElement.style.transform = 'scale(1.01)';
    });
    
    input.addEventListener('blur', function() {
      this.parentElement.style.transform = '';
    });
  });
}

function loadSettings() {
  chrome.storage.sync.get(['openaiApiKey', 'openaiModel'], (result) => {
    if (result.openaiApiKey) {
      document.getElementById('api-key').value = result.openaiApiKey;
    }
    if (result.openaiModel) {
      document.getElementById('model').value = result.openaiModel;
      
      // Update model card selection
      const modelCards = document.querySelectorAll('.model-card');
      modelCards.forEach(card => {
        card.classList.remove('selected');
        if (card.dataset.model === result.openaiModel) {
          card.classList.add('selected');
        }
      });
    }
  });
}

function saveSettings() {
  const apiKey = document.getElementById('api-key').value.trim();
  const model = document.getElementById('model').value;
  const statusDiv = document.getElementById('status');
  
  if (!apiKey) {
    showStatus('Please enter your OpenAI API key.', 'error');
    return;
  }
  
  chrome.storage.sync.set({
    openaiApiKey: apiKey,
    openaiModel: model
  }, () => {
    showStatus('Settings saved successfully!', 'success');
    
    // Update model card selection
    const modelCards = document.querySelectorAll('.model-card');
    modelCards.forEach(card => {
      card.classList.remove('selected');
      if (card.dataset.model === model) {
        card.classList.add('selected');
      }
    });
  });
}

async function testConnection() {
  const apiKey = document.getElementById('api-key').value.trim();
  const statusDiv = document.getElementById('status');
  
  if (!apiKey) {
    showStatus('Please enter your OpenAI API key first.', 'error');
    return;
  }
  
  showStatus('Testing connection...', 'info');
  
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      const modelCount = data.data.length;
      showStatus(`Connection successful! You have access to ${modelCount} models.`, 'success');
    } else {
      const error = await response.json();
      showStatus(`Connection failed: ${error.error?.message || 'Unknown error'}`, 'error');
    }
  } catch (error) {
    showStatus('Connection failed: Network error', 'error');
    console.error('API test error:', error);
  }
}

function toggleApiKeyVisibility() {
  const apiKeyInput = document.getElementById('api-key');
  const toggleButton = document.getElementById('toggle-api-key');
  const toggleIcon = toggleButton.querySelector('.toggle-icon');
  
  if (apiKeyInput.type === 'password') {
    apiKeyInput.type = 'text';
    toggleIcon.textContent = '🙈';
    toggleButton.setAttribute('title', 'Hide API key');
  } else {
    apiKeyInput.type = 'password';
    toggleIcon.textContent = '👁️';
    toggleButton.setAttribute('title', 'Show API key');
  }
}

function loadStatistics() {
  chrome.storage.local.get(['grammarStats'], (result) => {
    const stats = result.grammarStats || {
      totalCorrections: 0,
      wordsCorrected: 0,
      accuracyRate: 0
    };
    
    document.getElementById('total-corrections').textContent = stats.totalCorrections;
    document.getElementById('words-corrected').textContent = stats.wordsCorrected;
    document.getElementById('accuracy-rate').textContent = `${stats.accuracyRate}%`;
    
    // Add animation to stats
    animateStatistics();
  });
}

function animateStatistics() {
  const statValues = document.querySelectorAll('.stat-value');
  statValues.forEach((element, index) => {
    const finalValue = element.textContent;
    const isPercentage = finalValue.includes('%');
    const numericValue = parseInt(finalValue.replace(/[^\d]/g, ''));
    
    if (numericValue > 0) {
      element.textContent = '0' + (isPercentage ? '%' : '');
      
      let currentValue = 0;
      const increment = numericValue / 20;
      const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= numericValue) {
          currentValue = numericValue;
          clearInterval(timer);
        }
        element.textContent = Math.floor(currentValue) + (isPercentage ? '%' : '');
      }, 50 + (index * 10));
    }
  });
}

function resetStatistics() {
  if (confirm('Are you sure you want to reset all statistics? This action cannot be undone.')) {
    chrome.storage.local.set({
      grammarStats: {
        totalCorrections: 0,
        wordsCorrected: 0,
        accuracyRate: 0
      }
    }, () => {
      showStatus('Statistics reset successfully!', 'success');
      loadStatistics();
    });
  }
}

function exportSettings() {
  chrome.storage.sync.get(null, (settings) => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'mrgrammar-settings.json';
    link.click();
    
    showStatus('Settings exported successfully!', 'success');
  });
}

function showStatus(message, type) {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = 'status-message ' + type;
  statusDiv.style.display = 'block';
  
  // Add entrance animation
  statusDiv.style.opacity = '0';
  statusDiv.style.transform = 'translateY(-10px)';
  statusDiv.style.transition = 'all 0.3s ease-out';
  
  setTimeout(() => {
    statusDiv.style.opacity = '1';
    statusDiv.style.transform = 'translateY(0)';
  }, 10);
  
  // Auto-hide after 5 seconds for success/info messages
  if (type === 'success' || type === 'info') {
    setTimeout(() => {
      statusDiv.style.opacity = '0';
      statusDiv.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        statusDiv.style.display = 'none';
      }, 300);
    }, 5000);
  }
}

// Add CSS for selected model cards
const style = document.createElement('style');
style.textContent = `
  .model-card.selected {
    border-color: var(--color-primary);
    background: linear-gradient(135deg, rgb(99 102 241 / 0.1) 0%, rgb(139 92 246 / 0.1) 100%);
    box-shadow: var(--shadow-md);
  }
  
  .model-card.selected::after {
    content: '✓';
    position: absolute;
    top: var(--space-2);
    right: var(--space-2);
    background: var(--color-primary);
    color: white;
    width: 24px;
    height: 24px;
    border-radius: var(--radius-full);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-size-sm);
    font-weight: bold;
  }
  
  .model-card {
    position: relative;
  }
  
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  .config-section {
    animation: fadeInUp 0.6s ease-out;
  }
  
  .config-section:nth-child(2) {
    animation-delay: 0.1s;
  }
  
  .config-section:nth-child(3) {
    animation-delay: 0.2s;
  }
`;
document.head.appendChild(style); 