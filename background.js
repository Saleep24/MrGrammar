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
      console.log("Text selected:", info.selectionText); // Debug log
  
      try {
        const correctedText = await fixGrammarWithOpenAI(info.selectionText);
        console.log("Corrected text:", correctedText); // Debug log
  
        // Send corrected text to the webpage
        chrome.tabs.sendMessage(tab.id, {
          action: "replaceText",
          originalText: info.selectionText,
          correctedText: correctedText
        });
      } catch (error) {
        console.error("Error in background.js:", error); // Debug log
        
        // Alert the user if there's an API key issue
        if (error.message.includes("API key")) {
          chrome.tabs.sendMessage(tab.id, {
            action: "showError",
            message: "Please set your OpenAI API key in the extension options."
          });
        }
      }
    }
  });
  
  // OpenAI API call
  async function fixGrammarWithOpenAI(text) {
    // Get API key and model from storage
    const { openaiApiKey, openaiModel } = await chrome.storage.sync.get(['openaiApiKey', 'openaiModel']);
    
    if (!openaiApiKey) {
      throw new Error("API key not found. Please set up your OpenAI API key in the extension options.");
    }
    
    const model = openaiModel || "gpt-3.5-turbo";
    
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
              content: "You are a helpful assistant that corrects grammar, spelling, and improves text. Keep the same meaning and tone, just fix errors and improve readability. Only return the corrected text without any explanations or additional comments."
            },
            {
              role: "user",
              content: text
            }
          ],
          temperature: 0.3,
          max_tokens: 1000
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