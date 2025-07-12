(function() {
  console.log("=== LinkedIn Grammar Fixer Test ===");
  
  if (window.location.hostname !== 'www.linkedin.com') {
    console.log("❌ Not on LinkedIn - test cannot run");
    return;
  }
  
  console.log("✅ On LinkedIn domain");
  
  if (typeof window.debugLinkedInGrammarFixer === 'function') {
    console.log("✅ Debug function available");
    window.debugLinkedInGrammarFixer();
  } else {
    console.log("❌ Debug function not available - extension may not be loaded");
  }
  
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
  
  let foundComposers = 0;
  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    if (elements.length > 0) {
      foundComposers += elements.length;
      console.log(`✅ Found ${elements.length} composer(s) with selector: ${selector}`);
    }
  });
  
  if (foundComposers === 0) {
    console.log("❌ No message composers found - you may not be on a messaging page");
  } else {
    console.log(`✅ Total composers found: ${foundComposers}`);
  }
  
  if (document.activeElement) {
    console.log("✅ Active element found:", document.activeElement.tagName);
  } else {
    console.log("ℹ️ No active element");
  }
  

  const selection = window.getSelection();
  if (selection.rangeCount > 0) {
    console.log("✅ Text selection found:", selection.toString());
  } else {
    console.log("ℹ️ No text selection");
  }
  

  console.log("\n=== Testing Text Replacement ===");
  
  const testComposer = document.querySelector('div[contenteditable="true"], div[role="textbox"]');
  if (testComposer) {
    console.log("✅ Found test composer, attempting replacement...");
    
    const originalText = testComposer.textContent || "Test message";
    const testText = "This is a test message for grammar correction.";
    
    try {

      testComposer.focus();
      

      testComposer.textContent = testText;
      

      const inputEvent = new Event('input', { bubbles: true, cancelable: true });
      testComposer.dispatchEvent(inputEvent);
      
      console.log("✅ Test text replacement successful");
      console.log("Original text:", originalText);
      console.log("Test text:", testText);
      console.log("Current text:", testComposer.textContent);
      

      setTimeout(() => {
        testComposer.textContent = originalText;
        const restoreEvent = new Event('input', { bubbles: true, cancelable: true });
        testComposer.dispatchEvent(restoreEvent);
        console.log("✅ Original text restored");
      }, 2000);
      
    } catch (error) {
      console.log("❌ Test text replacement failed:", error);
    }
  } else {
    console.log("❌ No test composer found for replacement test");
  }
  
  console.log("\n=== Test Complete ===");
  console.log("If you see mostly ✅ marks, the integration should work properly.");
  console.log("If you see ❌ marks, there may be issues with the current page or extension loading.");
  
})(); 