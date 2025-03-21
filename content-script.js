// Listen for corrected text from background.js
chrome.runtime.onMessage.addListener((request) => {
    if (request.action === "replaceText") {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        range.insertNode(document.createTextNode(request.correctedText));
      }
    }
  });