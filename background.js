// Create the right-click menu on extension install
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
      id: "fixGrammar",
      title: "Fix Grammar with LanguageTool",
      contexts: ["selection"]
    });
    console.log("Context menu created!"); // Debug log
  });
  
  // Handle right-click action
  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "fixGrammar" && info.selectionText) {
      console.log("Text selected:", info.selectionText); // Debug log
  
      try {
        const correctedText = await fixGrammarFree(info.selectionText);
        console.log("Corrected text:", correctedText); // Debug log
  
        // Send corrected text to the webpage
        chrome.tabs.sendMessage(tab.id, {
          action: "replaceText",
          originalText: info.selectionText,
          correctedText: correctedText
        });
      } catch (error) {
        console.error("Error in background.js:", error); // Debug log
      }
    }
  });
  
  // LanguageTool API call
  async function fixGrammarFree(text) {
    try {
      const response = await fetch(
        "https://api.languagetool.org/v2/check",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: `text=${encodeURIComponent(text)}&language=en-US`
        }
      );
  
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      console.log("LanguageTool response:", data); // Debug log
  
      let correctedText = text;
      if (data.matches) {
        // Apply corrections in reverse order to avoid offset issues
        data.matches.sort((a, b) => b.offset - a.offset).forEach((match) => {
          if (match.replacements?.[0]?.value) {
            correctedText = correctedText.slice(0, match.offset) +
                           match.replacements[0].value +
                           correctedText.slice(match.offset + match.length);
          }
        });
      }
  
      return correctedText;
    } catch (error) {
      console.error("API Error:", error);
      return text; // Fallback to original text
    }
  }