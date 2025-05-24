console.log("Grammar Fixer: Google Docs content script loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "ping") {
    sendResponse({status: "ok"});
    return true;
  }
});