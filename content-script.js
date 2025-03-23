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
    } else if (request.action === "showError") {
      // Create and show error message
      const errorDiv = document.createElement('div');
      errorDiv.style.position = 'fixed';
      errorDiv.style.top = '20px';
      errorDiv.style.right = '20px';
      errorDiv.style.backgroundColor = '#f8d7da';
      errorDiv.style.color = '#721c24';
      errorDiv.style.padding = '10px 15px';
      errorDiv.style.borderRadius = '4px';
      errorDiv.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
      errorDiv.style.zIndex = '9999';
      errorDiv.style.maxWidth = '300px';
      errorDiv.style.fontSize = '14px';
      
      errorDiv.textContent = request.message;
      
      document.body.appendChild(errorDiv);
      
      // Remove the error message after 5 seconds
      setTimeout(() => {
        if (errorDiv.parentNode) {
          errorDiv.parentNode.removeChild(errorDiv);
        }
      }, 5000);
    }
  });