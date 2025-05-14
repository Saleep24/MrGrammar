// Create the right-click menu on extension install
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "fixGrammar",
      title: "Fix Grammar with AI",
      contexts: ["selection"]
    });
    console.log("Context menu created!"); 
  });
  

  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "fixGrammar" && info.selectionText) {
      processSelectedText(info.selectionText, tab.id);
    }
  });

  // Listen for keyboard shortcuts
  chrome.commands.onCommand.addListener(async (command) => {
    if (command === "fix-grammar") {

      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs.length === 0) return;
      
      const activeTab = tabs[0];
      

      const results = await chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        function: () => window.getSelection().toString()
      });
      
      const selectedText = results[0].result;
      if (!selectedText) {
   
        chrome.tabs.sendMessage(activeTab.id, {
          action: "showError",
          message: "Please select some text before using the keyboard shortcut."
        });
        return;
      }
      

      processSelectedText(selectedText, activeTab.id);
    }
  });
  
  // Process selected text and send correction back to the content script
  async function processSelectedText(text, tabId) {
    console.log("Text selected:", text);

    try {
      // Get tab info
      const tabs = await chrome.tabs.query({active: true, currentWindow: true});
      const isGmail = tabs.length > 0 && isGmailTab(tabs[0]);
      const isSlack = tabs.length > 0 && isSlackTab(tabs[0]);
      
      if (isGmail) {
        console.log("Processing Gmail content");
      }
      
      if (isSlack) {
        console.log("Processing Slack content");
      }
      
      // Special handling for Gmail
      if (isGmail) {
        // Try to inject content script if needed
        try {
          await chrome.scripting.executeScript({
            target: {tabId: tabId},
            files: ['content-script.js']
          });
          console.log("Content script injected into Gmail");
        } catch (e) {
          console.log("Content script already present or failed to inject", e);
        }
      }
      
      // Special handling for Slack
      if (isSlack) {
        // Try to inject content script if needed
        try {
          await chrome.scripting.executeScript({
            target: {tabId: tabId},
            files: ['content-script.js']
          });
          console.log("Content script injected into Slack");
        } catch (e) {
          console.log("Content script already present or failed to inject", e);
        }
      }

      // Show loading indicator - with improved error handling
      try {
        chrome.tabs.sendMessage(tabId, {
          action: "startProcessing"
        }, function(response) {
          if (chrome.runtime.lastError) {
            // This is expected in some cases, don't treat as error
            console.log("Note: Content script may not be ready yet, continuing anyway");
          }
        });
      } catch (error) {
        console.log("Could not show loading indicator, continuing anyway");
      }
    
      try {
        const correctedText = await fixGrammarWithOpenAI(text);
        console.log("Corrected text:", correctedText); 
    
        // Send corrected text to the webpage - with improved error handling
        try {
          chrome.tabs.sendMessage(tabId, {
            action: "replaceText",
            originalText: text,
            correctedText: correctedText
          }, function(response) {
            if (chrome.runtime.lastError) {
              console.log("Note: Message delivery to content script not confirmed, this is normal for some websites");
              
              // For Gmail, we might need to retry or use a different approach
              if (isGmail) {
                console.log("Attempting alternative text insertion for Gmail");
                // If needed, implement alternative approach here
              }
              
              // For Slack, we might need to retry or use a different approach
              if (isSlack) {
                console.log("Attempting alternative text insertion for Slack");
                // If needed, implement alternative approach here
              }
            }
          });
        } catch (error) {
          console.log("Error sending correction to page, user may need to copy manually:", error);
        }
      } catch (error) {
        console.error("Error in background.js:", error);
        
        // Alert the user if there's an API key issue
        try {
          if (error.message.includes("API key")) {
            chrome.tabs.sendMessage(tabId, {
              action: "showError",
              message: "Please set your OpenAI API key in the extension options."
            });
          } else {
            chrome.tabs.sendMessage(tabId, {
              action: "showError",
              message: `Error: ${error.message || "Failed to process text"}`
            });
          }
        } catch (msgError) {
          console.log("Could not show error message to user");
        }
      }
    } catch (error) {
      console.error("Error in processSelectedText:", error);
    }
  }
  
  // OpenAI API call
  async function fixGrammarWithOpenAI(text) {

    const { openaiApiKey, openaiModel } = await chrome.storage.sync.get(['openaiApiKey', 'openaiModel']);
    
    if (!openaiApiKey) {
      throw new Error("API key not found. Please set up your OpenAI API key in the extension options.");
    }
    
    // Default to GPT-4o Mini if no model is selected
    const model = openaiModel || "gpt-4o-mini";
    
    
    const inputTokenEstimate = Math.ceil(text.length / 4); 
    

    let maxTokens;
    let temperature;
    
    if (model === "gpt-3.5-turbo") {
      maxTokens = Math.floor(Math.min(3000, inputTokenEstimate * 1.5));
      temperature = 0.3;
    } else if (model === "gpt-4o-mini") {
      maxTokens = Math.floor(Math.min(4000, inputTokenEstimate * 1.5));
      temperature = 0.2;
    } else if (model === "gpt-4o") {
      maxTokens = Math.floor(Math.min(4000, inputTokenEstimate * 1.5));
      temperature = 0.2;
    } else { // gpt-4
      maxTokens = Math.floor(Math.min(4000, inputTokenEstimate * 1.5));
      temperature = 0.2;
    }
    
    // Ensure maxTokens is definitely an integer
    maxTokens = Math.max(100, Math.floor(maxTokens));
    
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
      console.log("OpenAI response:", data); 
      
      const correctedText = data.choices?.[0]?.message?.content?.trim() || text;
      return correctedText;
    } catch (error) {
      console.error("API Error:", error);
      throw error; 
    }
  }

  function isGmailTab(tab) {
    return tab && tab.url && tab.url.includes('mail.google.com');
  }
  
  function isSlackTab(tab) {
    return tab && tab.url && tab.url.includes('app.slack.com');
  }