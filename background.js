// Create right-click menu
chrome.contextMenus.create({
    id: "fixGrammar",
    title: "Fix Grammar with LanguageTool",
    contexts: ["selection"]
  });
  
  // Handle right-click action
  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === "fixGrammar" && info.selectionText) {
      const originalText = info.selectionText;
      
      // Send text to LanguageTool API
      const correctedText = await fixGrammarFree(originalText);
      
      // Send corrected text to the webpage
      chrome.tabs.sendMessage(tab.id, {
        action: "replaceText",
        originalText: originalText,
        correctedText: correctedText
      });
    }
  });
  
  // Fix grammar using LanguageTool (FREE tier)
  async function fixGrammarFree(text) {
    try {
      const response = await fetch("https://api.languagetool.org/v2/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `text=${encodeURIComponent(text)}&language=en-US`
      });
  
      const data = await response.json();
      let correctedText = text;
  
      // Apply grammar fixes from LanguageTool's response
      if (data.matches && data.matches.length > 0) {
        // Sort matches in reverse order to avoid offset issues
        data.matches.sort((a, b) => b.offset - a.offset);
        
        data.matches.forEach((match) => {
          if (match.replacements && match.replacements.length > 0) {
            const start = match.offset;
            const end = start + match.length;
            correctedText = correctedText.slice(0, start) + 
                           match.replacements[0].value + 
                           correctedText.slice(end);
          }
        });
      }
  
      return correctedText;
    } catch (error) {
      console.error("Error:", error);
      return text; // Return original text if API fails
    }
  }