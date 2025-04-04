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
  
  // Add keyframes for spinner animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes grammar-fix-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
  
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
  if (request.action === "ping") {
    return true; // Acknowledge the ping
  }
  
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
    console.log("Received corrected text");
    
    // Remove loading indicator
    removeLoadingIndicator();

    const selection = window.getSelection();
    
    // Special handling for Gmail compose window
    const isGmailCompose = window.location.hostname === 'mail.google.com' && 
                          document.querySelector('div[role="textbox"][aria-label*="compose"]');
    
    // If we're in Gmail compose and there's no selection, try to find the compose area
    if (selection.rangeCount === 0 && isGmailCompose) {
      const composeArea = document.querySelector('div[role="textbox"][aria-label*="compose"]');
      if (composeArea) {
        console.log("Using Gmail compose area for text replacement");
        
        // Attempt to use the compose area
        try {
          // Focus the compose area
          composeArea.focus();
          
          // Either replace selected text or insert at cursor position
          if (window.getSelection().rangeCount > 0) {
            const range = window.getSelection().getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(request.correctedText));
          } else {
            // If no selection even after focusing, just append text
            composeArea.innerHTML += request.correctedText;
          }
          console.log("Text inserted in Gmail compose area");
          return;
        } catch (error) {
          console.log("Error inserting text in Gmail compose:", error);
        }
      }
    }
    
    // Standard text replacement logic for non-Gmail or if Gmail-specific handling failed
    if (selection.rangeCount === 0) {
      console.log("No text selected - cannot replace text");
      
      // Show message to user instead of console error
      const errorMessage = document.createElement('div');
      errorMessage.style.position = 'fixed';
      errorMessage.style.top = '20px';
      errorMessage.style.right = '20px';
      errorMessage.style.backgroundColor = '#f8d7da';
      errorMessage.style.color = '#721c24';
      errorMessage.style.padding = '10px 15px';
      errorMessage.style.borderRadius = '4px';
      errorMessage.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
      errorMessage.style.zIndex = '9999';
      errorMessage.style.maxWidth = '300px';
      errorMessage.style.fontSize = '14px';
      
      errorMessage.textContent = "Could not replace text - no text selection found. Try selecting text again.";
      
      document.body.appendChild(errorMessage);
      
      // Remove the error message after 5 seconds
      setTimeout(() => {
        if (errorMessage.parentNode) {
          errorMessage.parentNode.removeChild(errorMessage);
        }
      }, 5000);
      
      return;
    }

    try {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(request.correctedText));
      console.log("Text replaced successfully!");
    } catch (error) {
      console.error("Replacement error:", error);
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

// Gmail-specific integration
function setupGmailIntegration() {
  if (window.location.hostname === 'mail.google.com') {
    console.log("Gmail detected, setting up integration");
    
    // Create MutationObserver to detect when compose windows appear
    const observer = new MutationObserver(mutations => {
      const composeBoxes = document.querySelectorAll('div[role="textbox"][aria-label*="compose"]');
      if (composeBoxes.length > 0) {
        composeBoxes.forEach(box => {
          // Ensure we haven't already processed this box
          if (!box.dataset.grammarFixerInitialized) {
            box.dataset.grammarFixerInitialized = 'true';
            console.log("Gmail compose box found and initialized");
            
            // You could add extra event listeners here if needed
            box.addEventListener('focus', () => {
              console.log("Gmail compose box focused");
            });
          }
        });
      }
    });
    
    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Handle ping immediately with proper response
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "ping") {
        console.log("Ping received in Gmail");
        sendResponse({status: "ok"});
        return true; // Important for async response
      }
    });
  }
}

// Call this function when the content script loads
setupGmailIntegration();

// This ensures the content script is loaded even in Gmail's dynamic environment
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded - Grammar Fixer initializing");
  });
}

console.log("Grammar Fixer content script loaded successfully");