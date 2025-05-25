document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get(['openaiApiKey', 'openaiModel'], (result) => {
    if (result.openaiApiKey) {
      document.getElementById('api-key').value = result.openaiApiKey;
    }
    if (result.openaiModel) {
      document.getElementById('model').value = result.openaiModel;
    }
  });
});


document.getElementById('save').addEventListener('click', () => {
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
  });
});


function showStatus(message, type) {
  const statusDiv = document.getElementById('status');
  statusDiv.textContent = message;
  statusDiv.className = 'status ' + type;
  statusDiv.style.display = 'block';
  
  setTimeout(() => {
    statusDiv.style.display = 'none';
  }, 3000);
} 