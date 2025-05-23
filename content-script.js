function showLoadingIndicator(selectionRect) {
  removeLoadingIndicator();
  
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
  
  const spinner = document.createElement('div');
  spinner.style.width = '20px';
  spinner.style.height = '20px';
  spinner.style.marginBottom = '8px';
  spinner.style.border = '3px solid #f3f3f3';
  spinner.style.borderTop = '3px solid #3498db';
  spinner.style.borderRadius = '50%';
  spinner.style.animation = 'grammar-fix-spin 1s linear infinite';
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes grammar-fix-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
  
  const message = document.createElement('span');
  message.textContent = 'Fixing grammar...';
  
  loadingDiv.appendChild(spinner);
  loadingDiv.appendChild(message);
  
  if (selectionRect) {
    loadingDiv.style.top = `${selectionRect.bottom + window.scrollY + 10}px`;
    loadingDiv.style.left = `${selectionRect.left + window.scrollX}px`;
  } else {
    loadingDiv.style.top = '50%';
    loadingDiv.style.left = '50%';
    loadingDiv.style.transform = 'translate(-50%, -50%)';
  }
  
  document.body.appendChild(loadingDiv);
}

function removeLoadingIndicator() {
  const existingIndicator = document.getElementById('grammar-fix-loading');
  if (existingIndicator && existingIndicator.parentNode) {
    existingIndicator.parentNode.removeChild(existingIndicator);
  }
}

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

    const selection = window.getSelection();
    
    const isGmailCompose = window.location.hostname === 'mail.google.com' && 
                          document.querySelector('div[role="textbox"][aria-label*="compose"]');
    
    if (selection.rangeCount === 0 && isGmailCompose) {
      const composeArea = document.querySelector('div[role="textbox"][aria-label*="compose"]');
      if (composeArea) {
        console.log("Using Gmail compose area for text replacement");
        
        try {
          composeArea.focus();
          
          if (window.getSelection().rangeCount > 0) {
            const range = window.getSelection().getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(request.correctedText));
          } else {
            composeArea.innerHTML += request.correctedText;
          }
          console.log("Text inserted in Gmail compose area");
          return;
        } catch (error) {
          console.log("Error inserting text in Gmail compose:", error);
        }
      }
    }
    
    if (selection.rangeCount === 0) {
      console.log("No text selected - cannot replace text");
      
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
    removeLoadingIndicator();
    
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
    
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  }
});

function setupGmailIntegration() {
  if (window.location.hostname === 'mail.google.com') {
    console.log("Gmail detected, setting up integration");
    
    const observer = new MutationObserver(mutations => {
      const composeBoxes = document.querySelectorAll('div[role="textbox"][aria-label*="compose"]');
      if (composeBoxes.length > 0) {
        composeBoxes.forEach(box => {
          if (!box.dataset.grammarFixerInitialized) {
            box.dataset.grammarFixerInitialized = 'true';
            console.log("Gmail compose box found and initialized");
            
            box.addEventListener('focus', () => {
              console.log("Gmail compose box focused");
            });
          }
        });
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "ping") {
        console.log("Ping received in Gmail");
        sendResponse({status: "ok"});
        return true; 
      }
    });
  }
}

function setupOutlookIntegration() {
  if (window.location.hostname.includes('outlook.office.com') || 
      window.location.hostname.includes('outlook.live.com')) {
    console.log("Outlook detected, setting up integration");
    
    const observer = new MutationObserver(mutations => {
      const composeAreas = document.querySelectorAll([
        'div[role="textbox"][aria-label="Message body"]', 
        'div[role="textbox"][aria-label="Reply body"]',   
        'div[role="textbox"][aria-label="Forward body"]'  
      ].join(','));
      
      if (composeAreas.length > 0) {
        composeAreas.forEach(area => {
          if (!area.dataset.grammarFixerInitialized) {
            area.dataset.grammarFixerInitialized = 'true';
            console.log("Outlook compose area found and initialized");
            
            area.addEventListener('focus', () => {
              console.log("Outlook compose area focused");
            });
          }
        });
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

function setupSlackIntegration() {
  if (window.location.hostname === 'app.slack.com') {
    console.log("Slack detected, setting up integration");
    
    const observer = new MutationObserver(mutations => {
      const messageComposers = document.querySelectorAll([
        'div[data-qa="message_input"]', 
        'div[data-qa="message_input_reply"]', 
        'div[data-qa="message_edit_input"]' 
      ].join(','));
      
      if (messageComposers.length > 0) {
        messageComposers.forEach(composer => {

          if (!composer.dataset.grammarFixerInitialized) {
            composer.dataset.grammarFixerInitialized = 'true';
            console.log("Slack message composer found and initialized");

            composer.addEventListener('focus', () => {
              console.log("Slack message composer focused");
            });
          }
        });
      }
    });
    

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "ping") {
        console.log("Ping received in Slack");
        sendResponse({status: "ok"});
        return true; 
      }
    });
  }
}


function replaceTextInEditor(correctedText) {
  const selection = window.getSelection();
  
  const isOutlook = window.location.hostname.includes('outlook.office.com') || 
                   window.location.hostname.includes('outlook.live.com');
  
  const isSlack = window.location.hostname === 'app.slack.com';
  
  if (isOutlook) {
    const composeArea = document.querySelector([
      'div[role="textbox"][aria-label="Message body"]',
      'div[role="textbox"][aria-label="Reply body"]',
      'div[role="textbox"][aria-label="Forward body"]'
    ].join(','));
    
    if (composeArea) {
      try {
        composeArea.focus();
        
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