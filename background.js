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
  
  async function processSelectedText(text, tabId) {
    console.log("Text selected:", text);

    try {
  
      const tabs = await chrome.tabs.query({active: true, currentWindow: true});
      const isGmail = tabs.length > 0 && isGmailTab(tabs[0]);
      const isSlack = tabs.length > 0 && isSlackTab(tabs[0]);
      const isLinkedIn = tabs.length > 0 && isLinkedInTab(tabs[0]);
      
      if (isGmail) {
        console.log("Processing Gmail content");
      }
      
      if (isSlack) {
        console.log("Processing Slack content");
      }
      
      if (isLinkedIn) {
        console.log("Processing LinkedIn content");
      }
      
 
      if (isGmail) {
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
      
      if (isSlack) {
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
      
      if (isLinkedIn) {
        try {
          await chrome.scripting.executeScript({
            target: {tabId: tabId},
            files: ['content-script.js']
          });
          console.log("Content script injected into LinkedIn");
        } catch (e) {
          console.log("Content script already present or failed to inject", e);
        }
      }

      try {
        chrome.tabs.sendMessage(tabId, {
          action: "startProcessing"
        }, function(response) {
          if (chrome.runtime.lastError) {
            console.log("Note: Content script may not be ready yet, continuing anyway");
          }
        });
      } catch (error) {
        console.log("Could not show loading indicator, continuing anyway");
      }
    
      try {
        const correctedText = await fixGrammarWithOpenAI(text);
        console.log("Corrected text:", correctedText); 

        // Track successful grammar correction
        await trackGrammarCorrection(text, correctedText, true);
    
        try {
          chrome.tabs.sendMessage(tabId, {
            action: "replaceText",
            originalText: text,
            correctedText: correctedText
          }, function(response) {
            if (chrome.runtime.lastError) {
              console.log("Note: Message delivery to content script not confirmed, this is normal for some websites");
              
              if (isGmail) {
                console.log("Attempting alternative text insertion for Gmail");
              }
              
              if (isSlack) {
                console.log("Attempting alternative text insertion for Slack");
              }
              
              if (isLinkedIn) {
                console.log("Attempting alternative text insertion for LinkedIn");
              }
            }
          });
        } catch (error) {
          console.log("Error sending correction to page, user may need to copy manually:", error);
        }
      } catch (error) {
        console.error("Error in background.js:", error);
        
        // Track failed attempt
        await trackGrammarCorrection(text, null, false);
        
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
  
  async function fixGrammarWithOpenAI(text) {

    const { openaiApiKey, openaiModel } = await chrome.storage.sync.get(['openaiApiKey', 'openaiModel']);
    
    if (!openaiApiKey) {
      throw new Error("API key not found. Please set up your OpenAI API key in the extension options.");
    }
    
 
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
    } else { 
      maxTokens = Math.floor(Math.min(4000, inputTokenEstimate * 1.5));
      temperature = 0.2;
    }
    
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
  
  function isLinkedInTab(tab) {
    return tab && tab.url && tab.url.includes('www.linkedin.com');
  }

  // Statistics tracking functions
  async function trackGrammarCorrection(originalText, correctedText, success) {
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

      // Track API attempt
      stats.apiTotalCount++;

      if (success && correctedText) {
        // API was successful
        stats.apiSuccessCount++;
        stats.totalCorrections++;

        // Count words corrected (count words in the original text)
        const wordCount = originalText.trim().split(/\s+/).filter(word => word.length > 0).length;
        stats.wordsCorrected += wordCount;
      }

      // Calculate API success rate for reference
      const apiSuccessRate = stats.apiTotalCount > 0 
        ? Math.round((stats.apiSuccessCount / stats.apiTotalCount) * 100)
        : 0;

      // Accuracy rate will be calculated when replacement tracking data is available
      if (stats.replacementTotalCount > 0) {
        const replacementSuccessRate = Math.round((stats.replacementSuccessCount / stats.replacementTotalCount) * 100);
        stats.accuracyRate = Math.round((apiSuccessRate * replacementSuccessRate) / 100);
      } else {
        // No replacement data yet, use API success rate
        stats.accuracyRate = apiSuccessRate;
      }

      // Save updated stats
      await chrome.storage.local.set({ grammarStats: stats });
      console.log('API statistics updated:', stats);
      console.log(`API Success: ${stats.apiSuccessCount}/${stats.apiTotalCount}`);
      console.log(`Replacement Success: ${stats.replacementSuccessCount}/${stats.replacementTotalCount}`);
      console.log(`Current Accuracy Rate: ${stats.accuracyRate}%`);
    } catch (error) {
      console.error('Error updating API statistics:', error);
    }
  }