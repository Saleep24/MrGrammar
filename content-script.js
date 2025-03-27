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
        range.deleteContents();
        range.insertNode(document.createTextNode(request.correctedText));
        console.log("Text replaced successfully!"); // Debug log
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