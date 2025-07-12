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

function setupLinkedInIntegration() {
  if (window.location.hostname === 'www.linkedin.com') {
    console.log("LinkedIn detected, setting up integration");
    
    const observer = new MutationObserver(mutations => {
      const messageComposers = document.querySelectorAll([
        'div[data-placeholder*="message"]',
        'div[data-placeholder*="Message"]',
        'div[role="textbox"]',
        'div[contenteditable="true"]',
        'div[data-test-id="compose-message-input"]',
        'div[data-test-id="message-composer-input"]'
      ].join(','));
      
      if (messageComposers.length > 0) {
        messageComposers.forEach(composer => {
          if (!composer.dataset.grammarFixerInitialized) {
            composer.dataset.grammarFixerInitialized = 'true';
            console.log("LinkedIn message composer found and initialized:", composer);
            
            composer.addEventListener('focus', () => {
              console.log("LinkedIn message composer focused");
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
        console.log("Ping received in LinkedIn");
        sendResponse({status: "ok"});
        return true; 
      }
    });
  }
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
    'div[data-control-name="messaging_compose"]'
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
  if (tryMethod1_DirectManipulation(composer, correctedText, selection)) {
    return true;
  }
  
  if (tryMethod2_ProgrammaticInsertion(composer, correctedText)) {
    return true;
  }
  
  if (tryMethod3_ClipboardReplacement(composer, correctedText)) {
    return true;
  }
  
  if (tryMethod4_SimulateTyping(composer, correctedText)) {
    return true;
  }
  
  console.log("All LinkedIn replacement methods failed");
  return false;
}

function tryMethod1_DirectManipulation(composer, correctedText, selection) {
  try {
    console.log("Trying Method 1: Direct DOM manipulation");
    
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      if (composer.contains(range.commonAncestorContainer)) {
        console.log("Replacing selected text in LinkedIn composer");
        range.deleteContents();
        range.insertNode(document.createTextNode(correctedText));
        triggerLinkedInEvents(composer, correctedText);
        return true;
      }
    }
    
    composer.focus();
    composer.innerHTML = '';
    const textNode = document.createTextNode(correctedText);
    composer.appendChild(textNode);
    
    const range = document.createRange();
    range.selectNodeContents(composer);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    
    triggerLinkedInEvents(composer, correctedText);
    return true;
    
  } catch (error) {
    console.error("Method 1 failed:", error);
    return false;
  }
}

function tryMethod2_ProgrammaticInsertion(composer, correctedText) {
  try {
    console.log("Trying Method 2: Programmatic insertion");
    
    composer.focus();
    
    composer.textContent = '';
    
    let currentText = '';
    for (let i = 0; i < correctedText.length; i++) {
      currentText += correctedText[i];
      composer.textContent = currentText;
      
      const inputEvent = new Event('input', {
        bubbles: true,
        cancelable: true,
        composed: true
      });
      composer.dispatchEvent(inputEvent);
    }
    
    const range = document.createRange();
    range.selectNodeContents(composer);
    range.collapse(false);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    
    triggerLinkedInEvents(composer, correctedText);
    return true;
    
  } catch (error) {
    console.error("Method 2 failed:", error);
    return false;
  }
}

function tryMethod3_ClipboardReplacement(composer, correctedText) {
  try {
    console.log("Trying Method 3: Clipboard replacement");
    
    if (!navigator.clipboard) {
      console.log("Clipboard API not available");
      return false;
    }
    
    return new Promise((resolve) => {
      navigator.clipboard.writeText(correctedText).then(() => {
        composer.focus();
        
        composer.textContent = '';
        
        const selectAllEvent = new KeyboardEvent('keydown', {
          key: 'a',
          code: 'KeyA',
          ctrlKey: true,
          bubbles: true,
          cancelable: true
        });
        composer.dispatchEvent(selectAllEvent);
        
        setTimeout(() => {
          const pasteEvent = new KeyboardEvent('keydown', {
            key: 'v',
            code: 'KeyV',
            ctrlKey: true,
            bubbles: true,
            cancelable: true
          });
          composer.dispatchEvent(pasteEvent);
          
          triggerLinkedInEvents(composer, correctedText);
          resolve(true);
        }, 50);
      }).catch((error) => {
        console.error("Clipboard write failed:", error);
        resolve(false);
      });
    });
    
  } catch (error) {
    console.error("Method 3 failed:", error);
    return false;
  }
}

function tryMethod4_SimulateTyping(composer, correctedText) {
  try {
    console.log("Trying Method 4: Simulate typing");
    
    composer.focus();
    composer.textContent = '';
    
    let currentText = '';
    for (let i = 0; i < correctedText.length; i++) {
      const char = correctedText[i];
      currentText += char;
      
      composer.textContent = currentText;
      
      const keydownEvent = new KeyboardEvent('keydown', {
        key: char,
        code: `Key${char.toUpperCase()}`,
        bubbles: true,
        cancelable: true
      });
      composer.dispatchEvent(keydownEvent);
      
      const keypressEvent = new KeyboardEvent('keypress', {
        key: char,
        code: `Key${char.toUpperCase()}`,
        bubbles: true,
        cancelable: true
      });
      composer.dispatchEvent(keypressEvent);
      
      const inputEvent = new Event('input', {
        bubbles: true,
        cancelable: true,
        composed: true
      });
      composer.dispatchEvent(inputEvent);
      
      const keyupEvent = new KeyboardEvent('keyup', {
        key: char,
        code: `Key${char.toUpperCase()}`,
        bubbles: true,
        cancelable: true
      });
      composer.dispatchEvent(keyupEvent);
    }
    
    const range = document.createRange();
    range.selectNodeContents(composer);
    range.collapse(false);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    
    triggerLinkedInEvents(composer, correctedText);
    return true;
    
  } catch (error) {
    console.error("Method 4 failed:", error);
    return false;
  }
}

function triggerLinkedInEvents(element, text) {
  console.log("Triggering comprehensive LinkedIn events for state synchronization");
  
  const inputEvent = new Event('input', {
    bubbles: true,
    cancelable: true,
    composed: true
  });
  element.dispatchEvent(inputEvent);
  
  const changeEvent = new Event('change', {
    bubbles: true,
    cancelable: true
  });
  element.dispatchEvent(changeEvent);
  
  const compositionStartEvent = new CompositionEvent('compositionstart', {
    bubbles: true,
    cancelable: true,
    data: text
  });
  element.dispatchEvent(compositionStartEvent);
  
  const compositionEndEvent = new CompositionEvent('compositionend', {
    bubbles: true,
    cancelable: true,
    data: text
  });
  element.dispatchEvent(compositionEndEvent);
  
  const keyupEvent = new KeyboardEvent('keyup', {
    key: 'a',
    code: 'KeyA',
    bubbles: true,
    cancelable: true
  });
  element.dispatchEvent(keyupEvent);
  
  element.blur();
  setTimeout(() => {
    element.focus();
    
    const focusEvent = new Event('focus', {
      bubbles: true,
      cancelable: true
    });
    element.dispatchEvent(focusEvent);
    
    const finalInputEvent = new Event('input', {
      bubbles: true,
      cancelable: true,
      composed: true
    });
    element.dispatchEvent(finalInputEvent);
    
  }, 10);
  
  console.log("LinkedIn events triggered successfully");
}

function replaceTextInEditor(correctedText) {
  const selection = window.getSelection();
  
  const isOutlook = window.location.hostname.includes('outlook.office.com') || 
                   window.location.hostname.includes('outlook.live.com');
  
  const isSlack = window.location.hostname === 'app.slack.com';
  
  const isLinkedIn = window.location.hostname === 'www.linkedin.com';
  
  if (isLinkedIn) {
    return replaceTextInLinkedIn(correctedText);
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
      }
    }
  }
  
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