// Listen for messages from background.js
chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "replaceText") {
      console.log("Received corrected text:", request.correctedText); // Debug log
  
      const selection = window.getSelection();
      if (selection.rangeCount === 0) {
        console.error("No text selected!");
        return;
      }
  
      try {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(request.correctedText));
        console.log("Text replaced successfully!"); // Debug log
      } catch (error) {
        console.error("Replacement error:", error); // Debug log
      }
    }
  });