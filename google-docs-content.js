// Google Docs integration
console.log("Grammar Fixer: Google Docs content script loaded");

// Basic ping handler for background script communication
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "ping") {
    sendResponse({status: "ok"});
    return true;
  }
});