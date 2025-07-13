function showLoadingIndicator(selectionRect) {
  removeLoadingIndicator();
  
  const loadingDiv = document.createElement('div');
  loadingDiv.id = 'grammar-fix-loading';
  loadingDiv.style.position = 'fixed';
  loadingDiv.style.zIndex = '9999';
  loadingDiv.style.backgroundColor = 'rgba(17, 17, 17, 0.95)';
  loadingDiv.style.color = '#ffffff';
  loadingDiv.style.borderRadius = '8px';
  loadingDiv.style.padding = '8px 12px';
  loadingDiv.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
  loadingDiv.style.display = 'flex';
  loadingDiv.style.alignItems = 'center';
  loadingDiv.style.justifyContent = 'center';
  loadingDiv.style.fontSize = '13px';
  loadingDiv.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", Roboto, sans-serif';
  loadingDiv.style.border = '1px solid #3f3f46';
  loadingDiv.style.backdropFilter = 'blur(10px)';
  
  const spinner = document.createElement('div');
  spinner.style.width = '16px';
  spinner.style.height = '16px';
  spinner.style.marginRight = '8px';
  spinner.style.border = '2px solid #3f3f46';
  spinner.style.borderTop = '2px solid #3b82f6';
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
    loadingDiv.style.top = '20px';
    loadingDiv.style.left = '50%';
    loadingDiv.style.transform = 'translateX(-50%)';
  }
  
  document.body.appendChild(loadingDiv);
}

function removeLoadingIndicator() {
  const existingIndicator = document.getElementById('grammar-fix-loading');
  if (existingIndicator && existingIndicator.parentNode) {
    existingIndicator.parentNode.removeChild(existingIndicator);
  }
}

function showInlineNotification(message, isSuccess = true, selectionRect = null) {
  // Remove any existing notifications
  const existingNotifications = document.querySelectorAll('.grammar-fix-notification');
  existingNotifications.forEach(notification => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification);
    }
  });
  
  const notification = document.createElement('div');
  notification.className = 'grammar-fix-notification';
  notification.style.position = 'fixed';
  notification.style.zIndex = '9999';
  notification.style.backgroundColor = 'rgba(17, 17, 17, 0.95)';
  notification.style.color = isSuccess ? '#10b981' : '#ef4444';
  notification.style.padding = '6px 10px';
  notification.style.borderRadius = '6px';
  notification.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
  notification.style.fontSize = '12px';
  notification.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", "Inter", Roboto, sans-serif';
  notification.style.border = `1px solid ${isSuccess ? '#10b981' : '#ef4444'}`;
  notification.style.backdropFilter = 'blur(10px)';
  notification.style.opacity = '0';
  notification.style.transform = 'translateY(-10px)';
  notification.style.transition = 'all 0.3s ease';
  
  notification.textContent = message;
  
  // Position the notification
  if (selectionRect) {
    notification.style.top = `${selectionRect.bottom + window.scrollY + 5}px`;
    notification.style.left = `${selectionRect.left + window.scrollX}px`;
  } else {
    notification.style.top = '20px';
    notification.style.left = '50%';
    notification.style.transform = 'translateX(-50%) translateY(-10px)';
  }
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = selectionRect ? 'translateY(0)' : 'translateX(-50%) translateY(0)';
  }, 10);
  
  // Remove after delay
  setTimeout(() => {
    if (notification.parentNode) {
      notification.style.opacity = '0';
      notification.style.transform = selectionRect ? 'translateY(-10px)' : 'translateX(-50%) translateY(-10px)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }
  }, 2000);
}

function replaceTextInLinkedIn(correctedText) {
  console.log("Attempting LinkedIn-specific text replacement");
  
  const selection = window.getSelection();
  
  const messageComposers = document.querySelectorAll([
    'div[data-placeholder*="message"]',
    'div[data-placeholder*="Message"]',
    'div[role="textbox"]',
    'div[contenteditable="true"]',
    'div[data-test-id="compose-message-input"]',
    'div[data-test-id="message-composer-input"]',
    'div[data-test-id="messaging-compose-input"]',
    'div[data-test-id="compose-input"]',
    'div[aria-label*="message"]',
    'div[aria-label*="Message"]',
    'div[data-control-name="compose_message"]',
    'div[data-control-name="messaging_compose"]',
    'div[data-placeholder*="Write a message"]',
    'div[data-placeholder*="write a message"]'
  ].join(','));
  
  if (messageComposers.length === 0) {
    console.log("No LinkedIn message composer found");
    return false;
  }
  
  let activeComposer = null;
  for (const composer of messageComposers) {
    if (composer === document.activeElement || composer.contains(document.activeElement)) {
      activeComposer = composer;
      break;
    }
  }
  
  if (!activeComposer && messageComposers.length > 0) {
    activeComposer = messageComposers[0];
  }
  
  if (!activeComposer) {
    console.log("No active LinkedIn composer found");
    return false;
  }
  
  console.log("Found LinkedIn composer:", activeComposer);
  
  return tryLinkedInReplacementMethods(activeComposer, correctedText, selection);
}

function tryLinkedInReplacementMethods(composer, correctedText, selection) {
  // Try Method 1: Direct DOM manipulation
  if (tryMethod1_DirectManipulation(composer, correctedText, selection)) {
    console.log("LinkedIn replacement successful with Method 1");
    return true;
  }
  
  // Try Method 2: Programmatic insertion
  if (tryMethod2_ProgrammaticInsertion(composer, correctedText)) {
    console.log("LinkedIn replacement successful with Method 2");
    return true;
  }
  
  // Try Method 3: Clipboard replacement (synchronous version)
  if (tryMethod3_ClipboardReplacement(composer, correctedText)) {
    console.log("LinkedIn replacement successful with Method 3");
    return true;
  }
  
  // Try Method 4: Simulate typing
  if (tryMethod4_SimulateTyping(composer, correctedText)) {
    console.log("LinkedIn replacement successful with Method 4");
    return true;
  }
  
  console.log("All LinkedIn replacement methods failed");
  return false;
}

function tryMethod1_DirectManipulation(composer, correctedText, selection) {
  try {
    composer.focus();
    
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(correctedText));
    } else {
      composer.textContent = correctedText;
    }
    
    triggerLinkedInEvents(composer, correctedText);
    return true;
  } catch (error) {
    console.log("Method 1 failed:", error);
    return false;
  }
}

function tryMethod2_ProgrammaticInsertion(composer, correctedText) {
  try {
    composer.focus();
    
    const range = document.createRange();
    range.selectNodeContents(composer);
    range.collapse(false);
    
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    
    range.insertNode(document.createTextNode(correctedText));
    
    triggerLinkedInEvents(composer, correctedText);
    return true;
  } catch (error) {
    console.log("Method 2 failed:", error);
    return false;
  }
}

function tryMethod3_ClipboardReplacement(composer, correctedText) {
  try {
    composer.focus();
    
    // Select all content in the composer
    const range = document.createRange();
    range.selectNodeContents(composer);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    
    // Use synchronous execCommand instead of async clipboard API
    const textArea = document.createElement('textarea');
    textArea.value = correctedText;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    textArea.style.pointerEvents = 'none';
    document.body.appendChild(textArea);
    
    textArea.select();
    const copySuccess = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    if (copySuccess) {
      // Paste the content
      const pasteSuccess = document.execCommand('paste');
      if (pasteSuccess) {
        triggerLinkedInEvents(composer, correctedText);
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.log("Method 3 failed:", error);
    return false;
  }
}

function tryMethod4_SimulateTyping(composer, correctedText) {
  try {
    composer.focus();
    
    // Clear existing content
    composer.textContent = '';
    
    // Simulate typing each character
    for (let i = 0; i < correctedText.length; i++) {
      const char = correctedText[i];
      
      const keydownEvent = new KeyboardEvent('keydown', {
        key: char,
        code: `Key${char.toUpperCase()}`,
        bubbles: true,
        cancelable: true
      });
      
      const keypressEvent = new KeyboardEvent('keypress', {
        key: char,
        code: `Key${char.toUpperCase()}`,
        bubbles: true,
        cancelable: true
      });
      
      const inputEvent = new InputEvent('input', {
        data: char,
        inputType: 'insertText',
        bubbles: true,
        cancelable: true
      });
      
      const keyupEvent = new KeyboardEvent('keyup', {
        key: char,
        code: `Key${char.toUpperCase()}`,
        bubbles: true,
        cancelable: true
      });
      
      composer.dispatchEvent(keydownEvent);
      composer.dispatchEvent(keypressEvent);
      
      // Insert the character
      composer.textContent += char;
      
      composer.dispatchEvent(inputEvent);
      composer.dispatchEvent(keyupEvent);
    }
    
    triggerLinkedInEvents(composer, correctedText);
    return true;
  } catch (error) {
    console.log("Method 4 failed:", error);
    return false;
  }
}

function triggerLinkedInEvents(element, text) {
  const events = [
    new Event('input', { bubbles: true }),
    new Event('change', { bubbles: true }),
    new CompositionEvent('compositionstart', { bubbles: true }),
    new CompositionEvent('compositionend', { bubbles: true, data: text }),
    new KeyboardEvent('keyup', { bubbles: true }),
    new Event('blur', { bubbles: true }),
    new Event('focus', { bubbles: true })
  ];
  
  events.forEach(event => {
    try {
      element.dispatchEvent(event);
    } catch (error) {
      console.log("Error dispatching event:", error);
    }
  });
  
  // Force a focus cycle to ensure LinkedIn's state is updated
  element.blur();
  setTimeout(() => {
    element.focus();
  }, 50);
}

function replaceTextInEditor(correctedText) {
  const selection = window.getSelection();
  let selectionRect = null;
  
  if (selection.rangeCount > 0) {
    selectionRect = selection.getRangeAt(0).getBoundingClientRect();
  }
  
  const isOutlook = window.location.hostname.includes('outlook.office.com') || 
                   window.location.hostname.includes('outlook.live.com');
  
  const isSlack = window.location.hostname === 'app.slack.com';
  
  const isLinkedIn = window.location.hostname === 'www.linkedin.com';
  
  if (isLinkedIn) {
    const result = replaceTextInLinkedIn(correctedText);
    if (result) {
      console.log("LinkedIn text replacement successful");
      return true;
    } else {
      console.log("LinkedIn text replacement failed");
      showInlineNotification("✗ Failed to fix grammar", false, selectionRect);
      return false;
    }
  }
  
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
          const range = document.createRange();
          range.selectNodeContents(composeArea);
          range.collapse(false); 
          range.insertNode(document.createTextNode(correctedText));
        }
        console.log("Text inserted in Outlook compose area");
        return true;
      } catch (error) {
        console.error("Error inserting text in Outlook compose:", error);
        showInlineNotification("✗ Failed to fix grammar", false, selectionRect);
        return false;
      }
    }
  }
  
  if (isSlack) {
    const messageComposer = document.querySelector([
      'div[data-qa="message_input"]', 
      'div[data-qa="message_input_reply"]', 
      'div[data-qa="message_edit_input"]'
    ].join(','));
    
    if (messageComposer) {
      try {
        messageComposer.focus();
        
        if (selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(correctedText));
        } else {
          const richTextArea = messageComposer.querySelector('[data-slate-editor="true"]');
          if (richTextArea) {
            richTextArea.focus();
            
            if (selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              range.deleteContents();
              range.insertNode(document.createTextNode(correctedText));
            } else {
              const range = document.createRange();
              range.selectNodeContents(richTextArea);
              range.collapse(false);
              range.insertNode(document.createTextNode(correctedText));
            }
          } else {
            const range = document.createRange();
            range.selectNodeContents(messageComposer);
            range.collapse(false); 
            range.insertNode(document.createTextNode(correctedText));
          }
        }
        console.log("Text inserted in Slack message composer");
        return true;
      } catch (error) {
        console.error("Error inserting text in Slack message composer:", error);
        showInlineNotification("✗ Failed to fix grammar", false, selectionRect);
        return false;
      }
    }
  }
  
  // Gmail special handling
  const isGmailCompose = window.location.hostname === 'mail.google.com' && 
                        document.querySelector('div[role="textbox"][aria-label*="compose"]');
  
  if (selection.rangeCount === 0 && isGmailCompose) {
    const composeArea = document.querySelector('div[role="textbox"][aria-label*="compose"]');
    if (composeArea) {
      try {
        composeArea.focus();
        
        if (window.getSelection().rangeCount > 0) {
          const range = window.getSelection().getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(correctedText));
        } else {
          composeArea.innerHTML += correctedText;
        }
        console.log("Text inserted in Gmail compose area");
        return true;
      } catch (error) {
        console.log("Error inserting text in Gmail compose:", error);
        showInlineNotification("✗ Failed to fix grammar", false, selectionRect);
        return false;
      }
    }
  }
  
  // Generic text replacement for other sites
  if (selection.rangeCount > 0) {
    try {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(correctedText));
      console.log("Text replaced successfully!");
      return true;
    } catch (error) {
      console.error("Replacement error:", error);
      showInlineNotification("✗ Failed to fix grammar", false, selectionRect);
      return false;
    }
  }
  
  // If we get here, no replacement method worked
  console.log("No suitable text replacement method found");
  showInlineNotification("✗ No text selected for grammar fix", false, selectionRect);
  return false;
}

// Single message listener to handle all actions
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
    replaceTextInEditor(request.correctedText);
  } 
  else if (request.action === "showError") {
    removeLoadingIndicator();
    showInlineNotification(`✗ ${request.message}`, false);
  }
});

function setupGmailIntegration() {
  if (window.location.hostname !== 'mail.google.com') return;
  
  const observer = new MutationObserver(() => {
    const composeAreas = document.querySelectorAll('div[role="textbox"][aria-label*="compose"]');
    composeAreas.forEach(area => {
      if (!area.hasAttribute('data-grammar-fix-setup')) {
        area.setAttribute('data-grammar-fix-setup', 'true');
        console.log("Gmail compose area detected and set up");
      }
    });
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
}

function setupOutlookIntegration() {
  if (!window.location.hostname.includes('outlook.office.com') && 
      !window.location.hostname.includes('outlook.live.com')) return;
  
  const observer = new MutationObserver(() => {
    const composeAreas = document.querySelectorAll([
      'div[role="textbox"][aria-label="Message body"]',
      'div[role="textbox"][aria-label="Reply body"]',
      'div[role="textbox"][aria-label="Forward body"]'
    ].join(','));
    
    composeAreas.forEach(area => {
      if (!area.hasAttribute('data-grammar-fix-setup')) {
        area.setAttribute('data-grammar-fix-setup', 'true');
        console.log("Outlook compose area detected and set up");
      }
    });
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
}

function setupSlackIntegration() {
  if (window.location.hostname !== 'app.slack.com') return;
  
  const observer = new MutationObserver(() => {
    const messageComposers = document.querySelectorAll([
      'div[data-qa="message_input"]', 
      'div[data-qa="message_input_reply"]', 
      'div[data-qa="message_edit_input"]'
    ].join(','));
    
    messageComposers.forEach(composer => {
      if (!composer.hasAttribute('data-grammar-fix-setup')) {
        composer.setAttribute('data-grammar-fix-setup', 'true');
        console.log("Slack message composer detected and set up");
      }
    });
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
}

function setupLinkedInIntegration() {
  if (window.location.hostname !== 'www.linkedin.com') return;
  
  const observer = new MutationObserver(() => {
    const messageComposers = document.querySelectorAll([
      'div[data-placeholder*="message"]',
      'div[data-placeholder*="Message"]',
      'div[role="textbox"]',
      'div[contenteditable="true"]',
      'div[data-test-id="compose-message-input"]',
      'div[data-test-id="message-composer-input"]',
      'div[data-test-id="messaging-compose-input"]',
      'div[data-test-id="compose-input"]',
      'div[aria-label*="message"]',
      'div[aria-label*="Message"]',
      'div[data-control-name="compose_message"]',
      'div[data-control-name="messaging_compose"]',
      'div[data-placeholder*="Write a message"]',
      'div[data-placeholder*="write a message"]'
    ].join(','));
    
    messageComposers.forEach(composer => {
      if (!composer.hasAttribute('data-grammar-fix-setup')) {
        composer.setAttribute('data-grammar-fix-setup', 'true');
        console.log("LinkedIn message composer detected and set up");
      }
    });
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
}

// Initialize integrations
setupGmailIntegration();
setupOutlookIntegration();
setupSlackIntegration();
setupLinkedInIntegration();

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded - Grammar Fixer initializing");
  });
}

console.log("Grammar Fixer content script loaded successfully");

function debugLinkedInIntegration() {
  if (window.location.hostname !== 'www.linkedin.com') {
    console.log("Not on LinkedIn, debugging not available");
    return;
  }
  
  console.log("=== LinkedIn Integration Debug ===");
  
  const selectors = [
    'div[data-placeholder*="message"]',
    'div[data-placeholder*="Message"]',
    'div[role="textbox"]',
    'div[contenteditable="true"]',
    'div[data-test-id="compose-message-input"]',
    'div[data-test-id="message-composer-input"]',
    'div[data-test-id="messaging-compose-input"]',
    'div[data-test-id="compose-input"]',
    'div[aria-label*="message"]',
    'div[aria-label*="Message"]',
    'div[data-control-name="compose_message"]',
    'div[data-control-name="messaging_compose"]'
  ];
  
  console.log("Searching for LinkedIn message composers...");
  
  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      console.log(`Found ${elements.length} elements with selector: ${selector}`);
      elements.forEach((el, index) => {
        console.log(`  Element ${index}:`, {
          tagName: el.tagName,
          className: el.className,
          id: el.id,
          attributes: Array.from(el.attributes).map(attr => `${attr.name}="${attr.value}"`).join(', '),
          isContentEditable: el.contentEditable,
          hasFocus: el === document.activeElement || el.contains(document.activeElement),
          textContent: el.textContent.substring(0, 50) + (el.textContent.length > 50 ? '...' : '')
        });
      });
    }
  });
  
  console.log("Active element:", document.activeElement);
  
  const selection = window.getSelection();
  console.log("Current selection:", {
    rangeCount: selection.rangeCount,
    toString: selection.toString(),
    anchorNode: selection.anchorNode,
    focusNode: selection.focusNode
  });
  
  console.log("=== End LinkedIn Debug ===");
}

window.debugLinkedInGrammarFixer = debugLinkedInIntegration;