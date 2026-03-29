document.addEventListener('DOMContentLoaded', () => {
  initializeOptions();
  loadStatistics();
});
function initializeOptions() {
  document.getElementById('test-connection').addEventListener('click', testConnection);
  document.getElementById('reset-stats').addEventListener('click', resetStatistics);
  document.getElementById('export-settings').addEventListener('click', exportSettings);
  addInteractiveEffects();
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
}
async function testConnection() {
  showStatus('Testing connection...', 'info');
  try {
    const response = await fetch('https://proxy-khaki-eight-20.vercel.app/api/grammar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'I goes to the store.' })
    });
    if (response.ok) {
      const data = await response.json();
      showStatus(`Connection successful! Corrected: "${data.correctedText}"`, 'success');
    } else {
      const error = await response.json();
      showStatus(`Connection failed: ${error.error || 'Unknown error'}`, 'error');
    }
  } catch (error) {
    showStatus('Connection failed: Network error', 'error');
    console.error('Connection test error:', error);
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
  chrome.storage.local.get(['grammarStats'], (stats) => {
    const dataStr = JSON.stringify(stats, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'mrgrammar-stats.json';
    link.click();
    showStatus('Statistics exported successfully!', 'success');
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
