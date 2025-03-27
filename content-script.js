// Create and manage loading indicator
function showLoadingIndicator(selectionRect) {
  // Remove any existing loading indicators
  removeLoadingIndicator();
  
  // Create the loading indicator element
  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'grammar-fix-loading';
  loadingDiv.style.position = 'fixed';
  loadingDiv.style.zIndex = '9999';
  loadingDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
  loadingDiv.style.borderRadius = '4px';
  loadingDiv.style.padding = '10px 15px';
  loadingDiv.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
  loadingDiv.style.display = 'flex';
  loadingDiv.style.alignItems = 'center';
  loadingDiv.style.justifyContent = 'center';
  loadingDiv.style.flexDirection = 'column';
  loadingDiv.style.fontSize = '14px';
  
  // Create spinner
  const spinner = document.createElement('div');
  spinner.style.width = '20px';
  spinner.style.height = '20px';
  spinner.style.marginBottom = '8px';
  spinner.style.border = '3px solid #f3f3f3';
  spinner.style.borderTop = '3px solid #3498db';
  spinner.style.borderRadius = '50%';
  spinner.style.animation = 'grammar-fix-spin 1s linear infinite';
  
  // Create and add keyframes for spinner animation
  if (!document.getElementById('grammar-fix-keyframes')) {
    const style = document.createElement('style');
    style.id = 'grammar-fix-keyframes';
    style.textContent = `
      @keyframes grammar-fix-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  }
  
  // Add message
  const message = document.createElement('span');
  message.textContent = 'Fixing grammar...';
  
  // Add elements to loading div
  loadingDiv.appendChild(spinner);
  loadingDiv.appendChild(message);
  
  // Position the loading indicator near the text selection
  if (selectionRect) {
    loadingDiv.style.top = `${selectionRect.bottom + window.scrollY + 10}px`;
    loadingDiv.style.left = `${selectionRect.left + window.scrollX}px`;
  } else {
    // Fallback to center of screen if no selection rect
    loadingDiv.style.top = '50%';
    loadingDiv.style.left = '50%';
    loadingDiv.style.transform = 'translate(-50%, -50%)';
  }
  
  // Add to document
  document.body.appendChild(loadingDiv);
}

function removeLoadingIndicator() {
  const existingIndicator = document.getElementById('grammar-fix-loading');
  if (existingIndicator && existingIndicator.parentNode) {
    existingIndicator.parentNode.removeChild(existingIndicator);
  }
}

// Show success notification with text statistics
function showSuccessNotification(originalText, correctedText, position) {
  // Calculate text statistics
  const originalStats = getTextStatistics(originalText);
  const correctedStats = getTextStatistics(correctedText);
  
  // Create notification element
  const notificationDiv = document.createElement('div');
  notificationDiv.id = 'grammar-fix-notification';
  notificationDiv.style.position = 'fixed';
  notificationDiv.style.zIndex = '9999';
  notificationDiv.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
  notificationDiv.style.borderRadius = '4px';
  notificationDiv.style.padding = '10px 15px';
  notificationDiv.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
  notificationDiv.style.fontSize = '14px';
  notificationDiv.style.maxWidth = '300px';
  notificationDiv.style.border = '1px solid #e0e0e0';
  
  // Position the notification
  if (position) {
    notificationDiv.style.top = `${position.bottom + window.scrollY + 10}px`;
    notificationDiv.style.left = `${position.left + window.scrollX}px`;
  } else {
    notificationDiv.style.top = '20px';
    notificationDiv.style.right = '20px';
  }
  
  // Create title
  const title = document.createElement('div');
  title.style.fontWeight = 'bold';
  title.style.marginBottom = '10px';
  title.style.color = '#4285f4';
  title.textContent = 'Text Corrected';
  
  // Create statistics content
  const stats = document.createElement('div');
  stats.style.fontSize = '12px';
  stats.style.lineHeight = '1.4';
  stats.innerHTML = `
    <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
      <span>Characters:</span>
      <span>${originalStats.characters} → ${correctedStats.characters} ${getChangeIndicator(originalStats.characters, correctedStats.characters)}</span>
    </div>
    <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
      <span>Words:</span>
      <span>${originalStats.words} → ${correctedStats.words} ${getChangeIndicator(originalStats.words, correctedStats.words)}</span>
    </div>
    <div style="display: flex; justify-content: space-between;">
      <span>Sentences:</span>
      <span>${originalStats.sentences} → ${correctedStats.sentences} ${getChangeIndicator(originalStats.sentences, correctedStats.sentences)}</span>
    </div>
  `;
  
  // Add a close button
  const closeButton = document.createElement('div');
  closeButton.style.position = 'absolute';
  closeButton.style.top = '5px';
  closeButton.style.right = '5px';
  closeButton.style.cursor = 'pointer';
  closeButton.style.fontSize = '16px';
  closeButton.style.width = '20px';
  closeButton.style.height = '20px';
  closeButton.style.textAlign = 'center';
  closeButton.style.lineHeight = '18px';
  closeButton.innerHTML = '&times;';
  closeButton.addEventListener('click', () => {
    if (notificationDiv.parentNode) {
      notificationDiv.parentNode.removeChild(notificationDiv);
    }
  });
  
  // Add everything to the notification
  notificationDiv.appendChild(closeButton);
  notificationDiv.appendChild(title);
  notificationDiv.appendChild(stats);
  
  // Add to document
  document.body.appendChild(notificationDiv);
  
  // Auto-remove after 8 seconds
  setTimeout(() => {
    if (notificationDiv.parentNode) {
      notificationDiv.parentNode.removeChild(notificationDiv);
    }
  }, 8000);
}

// Helper function to calculate text statistics
function getTextStatistics(text) {
  const characterCount = text.length;
  const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length;
  const sentenceCount = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
  
  return {
    characters: characterCount,
    words: wordCount,
    sentences: sentenceCount
  };
}

// Helper function to get change indicator (increase, decrease, same)
function getChangeIndicator(originalValue, newValue) {
  if (newValue > originalValue) {
    return `<span style="color: #4caf50;">▲${newValue - originalValue}</span>`;
  } else if (newValue < originalValue) {
    return `<span style="color: #f44336;">▼${originalValue - newValue}</span>`;
  } else {
    return `<span style="color: #9e9e9e;">=</span>`;
  }
}

// Listen for messages from background.js
chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "startProcessing") {
      // Get selection rectangle for positioning the loading indicator
      const selection = window.getSelection();
      let selectionRect = null;
      
      if (selection.rangeCount > 0) {
        selectionRect = selection.getRangeAt(0).getBoundingClientRect();
      }
      
      showLoadingIndicator(selectionRect);
    }
    else if (request.action === "replaceText") {
      console.log("Received corrected text:", request.correctedText); // Debug log
      
      // Remove loading indicator
      removeLoadingIndicator();
  
      const selection = window.getSelection();
      if (selection.rangeCount === 0) {
        console.error("No text selected!");
        return;
      }
  
      try {
        const range = selection.getRangeAt(0);
        const selectionRect = range.getBoundingClientRect();
        
        range.deleteContents();
        range.insertNode(document.createTextNode(request.correctedText));
        console.log("Text replaced successfully!"); // Debug log
        
        // Show success notification with text statistics
        showSuccessNotification(request.originalText, request.correctedText, selectionRect);
      } catch (error) {
        console.error("Replacement error:", error); // Debug log
      }
    } else if (request.action === "showError") {
      // Remove loading indicator
      removeLoadingIndicator();
      
      // Create and show error message
      const errorDiv = document.createElement('div');
      errorDiv.style.position = 'fixed';
      errorDiv.style.top = '20px';
      errorDiv.style.right = '20px';
      errorDiv.style.backgroundColor = '#f8d7da';
      errorDiv.style.color = '#721c24';
      errorDiv.style.padding = '10px 15px';
      errorDiv.style.borderRadius = '4px';
      errorDiv.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
      errorDiv.style.zIndex = '9999';
      errorDiv.style.maxWidth = '300px';
      errorDiv.style.fontSize = '14px';
      
      errorDiv.textContent = request.message;
      
      document.body.appendChild(errorDiv);
      
      // Remove the error message after 5 seconds
      setTimeout(() => {
        if (errorDiv.parentNode) {
          errorDiv.parentNode.removeChild(errorDiv);
        }
      }, 5000);
    }
  });