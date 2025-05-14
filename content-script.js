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

// Outlook-specific integration
function setupOutlookIntegration() {
  if (window.location.hostname.includes('outlook.office.com') || 
      window.location.hostname.includes('outlook.live.com')) {
    console.log("Outlook detected, setting up integration");
    
    // Create MutationObserver to detect when compose windows appear
    const observer = new MutationObserver(mutations => {
      // Look for the compose area in both new email and reply modes
      const composeAreas = document.querySelectorAll([
        'div[role="textbox"][aria-label="Message body"]', // New email
        'div[role="textbox"][aria-label="Reply body"]',   // Reply
        'div[role="textbox"][aria-label="Forward body"]'  // Forward
      ].join(','));
      
      if (composeAreas.length > 0) {
        composeAreas.forEach(area => {
          // Ensure we haven't already processed this area
          if (!area.dataset.grammarFixerInitialized) {
            area.dataset.grammarFixerInitialized = 'true';
            console.log("Outlook compose area found and initialized");
            
            // Add focus event listener
            area.addEventListener('focus', () => {
              console.log("Outlook compose area focused");
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
  }
}

// Slack-specific integration
function setupSlackIntegration() {
  if (window.location.hostname === 'app.slack.com') {
    console.log("Slack detected, setting up integration");
    
    // Create MutationObserver to detect when message input areas appear
    const observer = new MutationObserver(mutations => {
      // Look for the message composer in Slack
      const messageComposers = document.querySelectorAll([
        'div[data-qa="message_input"]', // Main message input
        'div[data-qa="message_input_reply"]', // Thread reply input
        'div[data-qa="message_edit_input"]' // Edit message input
      ].join(','));
      
      if (messageComposers.length > 0) {
        messageComposers.forEach(composer => {
          // Ensure we haven't already processed this composer
          if (!composer.dataset.grammarFixerInitialized) {
            composer.dataset.grammarFixerInitialized = 'true';
            console.log("Slack message composer found and initialized");
            
            // Add focus event listener if needed
            composer.addEventListener('focus', () => {
              console.log("Slack message composer focused");
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
        console.log("Ping received in Slack");
        sendResponse({status: "ok"});
        return true; // Important for async response
      }
    });
  }
}

// Update the text replacement logic to handle Outlook
function replaceTextInEditor(correctedText) {
  const selection = window.getSelection();
  
  // Check if we're in Outlook
  const isOutlook = window.location.hostname.includes('outlook.office.com') || 
                   window.location.hostname.includes('outlook.live.com');
  
  // Check if we're in Slack
  const isSlack = window.location.hostname === 'app.slack.com';
  
  if (isOutlook) {
    // Try to find the Outlook compose area
    const composeArea = document.querySelector([
      'div[role="textbox"][aria-label="Message body"]',
      'div[role="textbox"][aria-label="Reply body"]',
      'div[role="textbox"][aria-label="Forward body"]'
    ].join(','));
    
    if (composeArea) {
      try {
        // Focus the compose area
        composeArea.focus();
        
        // Either replace selected text or insert at cursor position
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(correctedText));
        } else {
          // If no selection, insert at cursor position or append
          const range = document.createRange();
          range.selectNodeContents(composeArea);
          range.collapse(false); // Move to end
          range.insertNode(document.createTextNode(correctedText));
        }
        console.log("Text inserted in Outlook compose area");
        return true;
      } catch (error) {
        console.error("Error inserting text in Outlook compose:", error);
      }
    }
  }
  
  // Handle Slack-specific text replacement
  if (isSlack) {
    // Try to find the Slack message composer
    const messageComposer = document.querySelector([
      'div[data-qa="message_input"]', // Main message input
      'div[data-qa="message_input_reply"]', // Thread reply input
      'div[data-qa="message_edit_input"]' // Edit message input
    ].join(','));
    
    if (messageComposer) {
      try {
        // Focus the message composer
        messageComposer.focus();
        
        // Either replace selected text or insert at cursor position
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(correctedText));
        } else {
          // If no selection, try to find the rich text area within the composer
          const richTextArea = messageComposer.querySelector('[data-slate-editor="true"]');
          if (richTextArea) {
            // Focus the rich text area
            richTextArea.focus();
            
            if (selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              range.deleteContents();
              range.insertNode(document.createTextNode(correctedText));
            } else {
              // If still no selection, insert at end
              const range = document.createRange();
              range.selectNodeContents(richTextArea);
              range.collapse(false); // Move to end
              range.insertNode(document.createTextNode(correctedText));
            }
          } else {
            // Fallback: insert at cursor position or append to message composer
            const range = document.createRange();
            range.selectNodeContents(messageComposer);
            range.collapse(false); // Move to end
            range.insertNode(document.createTextNode(correctedText));
          }
        }
        console.log("Text inserted in Slack message composer");
        return true;
      } catch (error) {
        console.error("Error inserting text in Slack message composer:", error);
      }
    }
  }
  
  // Fall back to standard text replacement
  if (selection.rangeCount > 0) {
    try {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(correctedText));
      console.log("Text replaced successfully!");
      return true;
    } catch (error) {
      console.error("Replacement error:", error);
    }
  }
  
  return false;
}

// Update the message listener to use the new replacement function
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "ping") {
    return true;
  }
  
  if (request.action === "startProcessing") {
    const selection = window.getSelection();
    let selectionRect = null;
    
    if (selection.rangeCount > 0) {
      selectionRect = selection.getRangeAt(0).getBoundingClientRect();
    }
    
    showLoadingIndicator(selectionRect);
  }
  else if (request.action === "replaceText") {
    console.log("Received corrected text");
    removeLoadingIndicator();
    
    if (!replaceTextInEditor(request.correctedText)) {
      // Show error message if replacement failed
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
      
      errorMessage.textContent = "Could not replace text. Please try selecting text again.";
      
      document.body.appendChild(errorMessage);
      
      setTimeout(() => {
        if (errorMessage.parentNode) {
          errorMessage.parentNode.removeChild(errorMessage);
        }
      }, 5000);
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

// Initialize Gmail, Outlook, and Slack integrations
setupGmailIntegration();
setupOutlookIntegration();
setupSlackIntegration();

// This ensures the content script is loaded even in Gmail's dynamic environment
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded - Grammar Fixer initializing");
  });
}

console.log("Grammar Fixer content script loaded successfully");