function showLoadingIndicator(selectionRect) {

}

function removeLoadingIndicator() {

}

function showInlineNotification(message, isSuccess = true, selectionRect = null) {

}

function replaceTextInLinkedIn(correctedText) {
  console.log("Attempting LinkedIn-specific text replacement");
  
  const selection = window.getSelection();
  
  let activeComposer = null;
  

  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    const selectionContainer = range.commonAncestorContainer;
    

    let element = selectionContainer.nodeType === Node.TEXT_NODE ? selectionContainer.parentElement : selectionContainer;
    while (element && element !== document.body) {
      if (element.contentEditable === 'true' || element.getAttribute('contenteditable') === 'true') {

        const isLinkedInEditor = element.matches([
          'div[data-placeholder*="message"]',
          'div[data-placeholder*="Message"]',
          'div[role="textbox"]',
          'div[data-test-id*="compose"]',
          'div[data-test-id*="message"]',
          'div[aria-label*="message"]',
          'div[aria-label*="Message"]',
          'div[data-placeholder*="What do you want to talk about?"]',
          'div[data-placeholder*="Share your thoughts"]',
          'div[data-placeholder*="Start a post"]',
          'div[aria-label*="Text editor for creating content"]',
          'div[aria-label*="Rich text editor"]',
          'div[class*="ql-editor"]'
        ].join(','));
        
        if (isLinkedInEditor) {
          activeComposer = element;
          break;
        }
      }
      element = element.parentElement;
    }
  }
  

  if (!activeComposer) {
    const allComposers = document.querySelectorAll([
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
      'div[data-placeholder*="write a message"]',
      'div[data-placeholder*="What do you want to talk about?"]',
      'div[data-placeholder*="Share your thoughts"]',
      'div[data-placeholder*="Start a post"]',
      'div[aria-label*="Text editor for creating content"]',
      'div[aria-label*="Rich text editor"]',
      'div[data-test-id="post-composer-input"]',
      'div[data-test-id="feed-composer-input"]',
      'div[data-test-id="share-box-input"]',
      'div[class*="ql-editor"]',
      'div[class*="share-creation-state"]'
    ].join(','));
    
    for (const composer of allComposers) {
      if (composer === document.activeElement || composer.contains(document.activeElement)) {
        activeComposer = composer;
        break;
      }
    }
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
    console.log("LinkedIn replacement successful with Method 1");
    return true;
  }
  

  if (tryMethod2_ProgrammaticInsertion(composer, correctedText)) {
    console.log("LinkedIn replacement successful with Method 2");
    return true;
  }
  

  if (tryMethod3_ClipboardReplacement(composer, correctedText)) {
    console.log("LinkedIn replacement successful with Method 3");
    return true;
  }
  

  if (tryMethod4_SimulateTyping(composer, correctedText)) {
    console.log("LinkedIn replacement successful with Method 4");
    return true;
  }
  
  console.log("All LinkedIn replacement methods failed");
  return false;
}

function tryMethod1_DirectManipulation(composer, correctedText, selection) {
  try {
    const originalText = composer.textContent || composer.innerText || '';
    composer.focus();
    
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(correctedText));
    } else {
      composer.textContent = correctedText;
    }
    
    triggerLinkedInEvents(composer, correctedText);
    
    // Give the DOM time to update
    setTimeout(() => {}, 10);
    
    const newText = composer.textContent || composer.innerText || '';
    // Check if the corrected text appears in the composer
    const success = newText.includes(correctedText);
    console.log(`Method 1 success check: "${correctedText}" found in "${newText}"? ${success}`);
    return success;
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
    
    // Give the DOM time to update
    setTimeout(() => {}, 10);
    
    // Check if the corrected text appears in the composer
    const newText = composer.textContent || composer.innerText || '';
    const success = newText.includes(correctedText);
    console.log(`Method 2 success check: "${correctedText}" found in "${newText}"? ${success}`);
    return success;
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
      return false;
    }
  }
  
  // If we get here, no replacement method worked
  console.log("No suitable text replacement method found");
  return false;
}

// Simple message listener
chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "ping") {
    return true; 
  }
  
  if (request.action === "startProcessing") {
    // Do nothing - silent operation
  }
  else if (request.action === "replaceText") {
    console.log("Received corrected text");
    const success = replaceTextInEditor(request.correctedText);
    
    // Track actual text replacement success/failure
    if (request.originalText) {
      trackTextReplacement(request.originalText, request.correctedText, success);
    }
  } 
  else if (request.action === "showError") {
    // Do nothing - silent operation
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
      'div[data-placeholder*="write a message"]',
      // LinkedIn post editor selectors
      'div[data-placeholder*="What do you want to talk about?"]',
      'div[data-placeholder*="Share your thoughts"]',
      'div[data-placeholder*="Start a post"]',
      'div[aria-label*="Text editor for creating content"]',
      'div[aria-label*="Rich text editor"]',
      'div[data-test-id="post-composer-input"]',
      'div[data-test-id="feed-composer-input"]',
      'div[data-test-id="share-box-input"]',
      'div[class*="ql-editor"]',
      'div[class*="share-creation-state"]'
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

// Statistics tracking for actual text replacement
async function trackTextReplacement(originalText, correctedText, success) {
  try {
    const { grammarStats } = await chrome.storage.local.get(['grammarStats']);
    const stats = grammarStats || {
      totalCorrections: 0,
      wordsCorrected: 0,
      accuracyRate: 0,
      apiSuccessCount: 0,
      apiTotalCount: 0,
      replacementSuccessCount: 0,
      replacementTotalCount: 0
    };

    // Track replacement attempt
    stats.replacementTotalCount++;

    if (success) {
      stats.replacementSuccessCount++;
    }

    // Calculate success rates
    const apiSuccessRate = stats.apiTotalCount > 0 
      ? Math.round((stats.apiSuccessCount / stats.apiTotalCount) * 100)
      : 0;
      
    const replacementSuccessRate = stats.replacementTotalCount > 0 
      ? Math.round((stats.replacementSuccessCount / stats.replacementTotalCount) * 100)
      : 0;

    // Calculate overall accuracy rate (API success × Replacement success)
    if (stats.apiTotalCount > 0 && stats.replacementTotalCount > 0) {
      // Both API and replacement data available - calculate combined accuracy
      stats.accuracyRate = Math.round((apiSuccessRate * replacementSuccessRate) / 100);
    } else if (stats.apiTotalCount > 0) {
      // Only API data available
      stats.accuracyRate = apiSuccessRate;
    } else {
      stats.accuracyRate = 0;
    }

    // Save updated stats
    await chrome.storage.local.set({ grammarStats: stats });
    console.log('Text replacement statistics updated:', stats);
    console.log(`API Success: ${stats.apiSuccessCount}/${stats.apiTotalCount} (${apiSuccessRate}%)`);
    console.log(`Replacement Success: ${stats.replacementSuccessCount}/${stats.replacementTotalCount} (${replacementSuccessRate}%)`);
    console.log(`Overall Accuracy: ${stats.accuracyRate}%`);
  } catch (error) {
    console.error('Error updating replacement statistics:', error);
  }
}

// Debug function to check current statistics
window.debugGrammarStats = async function() {
  try {
    const { grammarStats } = await chrome.storage.local.get(['grammarStats']);
    const stats = grammarStats || {
      totalCorrections: 0,
      wordsCorrected: 0,
      accuracyRate: 0,
      apiSuccessCount: 0,
      apiTotalCount: 0,
      replacementSuccessCount: 0,
      replacementTotalCount: 0
    };
    
    console.log('=== GRAMMAR STATISTICS DEBUG ===');
    console.log('Total Corrections:', stats.totalCorrections);
    console.log('Words Corrected:', stats.wordsCorrected);
    console.log('Accuracy Rate:', stats.accuracyRate + '%');
    console.log('API Success:', stats.apiSuccessCount, '/', stats.apiTotalCount);
    console.log('Replacement Success:', stats.replacementSuccessCount, '/', stats.replacementTotalCount);
    
    if (stats.apiTotalCount > 0) {
      const apiRate = Math.round((stats.apiSuccessCount / stats.apiTotalCount) * 100);
      console.log('API Success Rate:', apiRate + '%');
    }
    
    if (stats.replacementTotalCount > 0) {
      const replacementRate = Math.round((stats.replacementSuccessCount / stats.replacementTotalCount) * 100);
      console.log('Replacement Success Rate:', replacementRate + '%');
    }
    
    console.log('=== END DEBUG ===');
    return stats;
  } catch (error) {
    console.error('Error debugging statistics:', error);
  }
};