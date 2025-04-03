// Create the right-click menu on extension install
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "fixGrammar",
      title: "Fix Grammar with AI",
      contexts: ["selection"]
    });
    console.log("Context menu created!"); // Debug log
  });
  
  // Handle right-click action
  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "fixGrammar" && info.selectionText) {
      processSelectedText(info.selectionText, tab.id);
    }
  });

  // Listen for keyboard shortcuts
  chrome.commands.onCommand.addListener(async (command) => {
    if (command === "fix-grammar") {
      // Get the active tab
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs.length === 0) return;
      
      const activeTab = tabs[0];
      
      // Execute script to get selected text
      const results = await chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        function: () => window.getSelection().toString()
      });
      
      const selectedText = results[0].result;
      if (!selectedText) {
        // Show error if no text is selected
        chrome.tabs.sendMessage(activeTab.id, {
          action: "showError",
          message: "Please select some text before using the keyboard shortcut."
        });
        return;
      }
      
      // Process the selected text
      processSelectedText(selectedText, activeTab.id);
    }
  });
  
  // Process selected text and send correction back to the content script
  async function processSelectedText(text, tabId) {
    console.log("Text selected:", text); // Debug log
    
    // Show loading indicator
    chrome.tabs.sendMessage(tabId, {
      action: "startProcessing"
    });
  
    try {
      const correctedText = await fixGrammarWithOpenAI(text);
      console.log("Corrected text:", correctedText); // Debug log
  
      // Send corrected text to the webpage
      chrome.tabs.sendMessage(tabId, {
        action: "replaceText",
        originalText: text,
        correctedText: correctedText
      });
    } catch (error) {
      console.error("Error in background.js:", error); // Debug log
      
      // Alert the user if there's an API key issue
      if (error.message.includes("API key")) {
        chrome.tabs.sendMessage(tabId, {
          action: "showError",
          message: "Please set your OpenAI API key in the extension options."
        });
      } else {
        // Generic error message for other issues
        chrome.tabs.sendMessage(tabId, {
          action: "showError",
          message: `Error: ${error.message || "Failed to process text"}`
        });
      }
    }
  }
  
  // OpenAI API call
  async function fixGrammarWithOpenAI(text) {
    // Get API key and model from storage
    const { openaiApiKey, openaiModel } = await chrome.storage.sync.get(['openaiApiKey', 'openaiModel']);
    
    if (!openaiApiKey) {
      throw new Error("API key not found. Please set up your OpenAI API key in the extension options.");
    }
    
    // Default to GPT-4o Mini if no model is selected
    const model = openaiModel || "gpt-4o-mini";
    
    // Check text length and set appropriate max tokens based on model
    const inputTokenEstimate = Math.ceil(text.length / 4); // Rough estimate of tokens
    
    // Set max tokens based on model (allowing room for response)
    let maxTokens;
    let temperature;
    
    if (model === "gpt-3.5-turbo") {
      maxTokens = Math.min(3000, inputTokenEstimate * 1.5);
      temperature = 0.3;
    } else if (model === "gpt-4o-mini") {
      maxTokens = Math.min(4000, inputTokenEstimate * 1.5);
      temperature = 0.2;
    } else if (model === "gpt-4o") {
      maxTokens = Math.min(4000, inputTokenEstimate * 1.5);
      temperature = 0.2;
    } else { // gpt-4
      maxTokens = Math.min(4000, inputTokenEstimate * 1.5);
      temperature = 0.2;
    }
    
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
          model: model,
          messages: [
            {
              role: "system",
              content: "You are a professional grammar and writing expert. Your task is to correct grammar, spelling, punctuation, and improve text clarity and flow. Keep the same meaning, tone, and style of the original text. Only return the corrected version without explanations or comments."
            },
            {
              role: "user",
              content: text
            }
          ],
          temperature: temperature,
          max_tokens: maxTokens
        })
      });
  
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error?.message || response.status}`);
      }
      
      const data = await response.json();
      console.log("OpenAI response:", data); // Debug log
      
      // Extract and return the corrected text from the API response
      const correctedText = data.choices?.[0]?.message?.content?.trim() || text;
      return correctedText;
    } catch (error) {
      console.error("API Error:", error);
      throw error; // Propagate the error to the caller
    }
  }