document.addEventListener('DOMContentLoaded', () => {
  initializeOptions();
  loadSettings();
  loadStatistics();
});
function initializeOptions() {
  document.getElementById('save').addEventListener('click', saveSettings);
  document.getElementById('test-connection').addEventListener('click', testConnection);
  document.getElementById('toggle-api-key').addEventListener('click', toggleApiKeyVisibility);
  document.getElementById('reset-stats').addEventListener('click', resetStatistics);
  document.getElementById('export-settings').addEventListener('click', exportSettings);
  addModelCardSelection();
  addInteractiveEffects();
}
function addModelCardSelection() {
  const modelCards = document.querySelectorAll('.model-card');
  const modelSelect = document.getElementById('model');
  modelCards.forEach(card => {
    card.addEventListener('click', () => {
      const model = card.dataset.model;
      modelSelect.value = model;
      modelCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      card.style.transform = 'scale(1.02)';
      setTimeout(() => {
        card.style.transform = '';
      }, 200);
    });
  });
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
    toggleIcon.innerHTML = `
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
      <line x1="1" y1="1" x2="23" y2="23"></line>
    `;
    toggleButton.setAttribute('title', 'Hide API key');
  } else {
    apiKeyInput.type = 'password';
    toggleIcon.innerHTML = `
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    `;
    toggleButton.setAttribute('title', 'Show API key');
  }
}
function loadStatistics() {
  chrome.storage.local.get(['grammarStats'], (result) => {
    const stats = result.grammarStats || {
      totalCorrections: 0,
      wordsCorrected: 0
    };
    document.getElementById('total-corrections').textContent = stats.totalCorrections;
    document.getElementById('words-corrected').textContent = stats.wordsCorrected;
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
        accuracyRate: 0,
        apiSuccessCount: 0,
        apiTotalCount: 0,
        replacementSuccessCount: 0,
        replacementTotalCount: 0
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
  statusDiv.style.opacity = '0';
  statusDiv.style.transform = 'translateY(-10px)';
  statusDiv.style.transition = 'all 0.3s ease-out';
  setTimeout(() => {
    statusDiv.style.opacity = '1';
    statusDiv.style.transform = 'translateY(0)';
  }, 10);
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
