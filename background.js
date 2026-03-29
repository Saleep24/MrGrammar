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
      try {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tabs.length === 0) return;
        const activeTab = tabs[0];
        let selectedText = '';
        try {
          const results = await chrome.scripting.executeScript({
            target: { tabId: activeTab.id },
            function: () => window.getSelection().toString()
          });
          selectedText = (results && results[0] && results[0].result) || '';
        } catch (e) {
          console.error("Failed to get selection via executeScript:", e);
        }
        if (!selectedText) {
          try {
            await chrome.tabs.sendMessage(activeTab.id, {
              action: "showError",
              message: "Please select some text before using the keyboard shortcut."
            });
          } catch (e) {
            console.log("Could not show error message - content script not available");
          }
          return;
        }
        processSelectedText(selectedText, activeTab.id);
      } catch (e) {
        console.error("Keyboard shortcut handler error:", e);
      }
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
        const correctedText = await fixGrammarWithGemini(text);
        console.log("Corrected text:", correctedText);
        await trackGrammarCorrection(text, correctedText, true);

        if (isLinkedIn) {
          console.log("Using direct injection for LinkedIn");
          let directSuccess = false;
          try {
            const results = await chrome.scripting.executeScript({
              target: { tabId: tabId },
              world: 'MAIN',
              func: (newText, oldText) => {
                try {
                  // Remove loading indicator
                  const indicator = document.getElementById('mr-grammar-loading');
                  if (indicator) indicator.remove();

                  const sel = window.getSelection();

                  // Helper: find contenteditable ancestor of a node
                  function findEditor(node) {
                    if (!node) return null;
                    if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
                    while (node && node !== document.body) {
                      if (node.isContentEditable || node.getAttribute('contenteditable') === 'true') return node;
                      node = node.parentElement;
                    }
                    return null;
                  }

                  // Helper: walk text nodes and select a substring
                  function selectText(container, text) {
                    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
                    let concat = '';
                    const nodes = [];
                    while (walker.nextNode()) {
                      nodes.push({ n: walker.currentNode, s: concat.length });
                      concat += walker.currentNode.textContent;
                    }
                    const idx = concat.indexOf(text);
                    if (idx === -1) return false;
                    const endIdx = idx + text.length;
                    let sn, so, en, eo;
                    for (const t of nodes) {
                      const ne = t.s + t.n.textContent.length;
                      if (!sn && ne > idx) { sn = t.n; so = idx - t.s; }
                      if (ne >= endIdx) { en = t.n; eo = endIdx - t.s; break; }
                    }
                    if (!sn || !en) return false;
                    const range = document.createRange();
                    range.setStart(sn, so);
                    range.setEnd(en, eo);
                    sel.removeAllRanges();
                    sel.addRange(range);
                    return true;
                  }

                  // Helper: check if editor contains the new text
                  function hasNewText(editor) {
                    const content = (editor.textContent || '');
                    const sample = newText.substring(0, Math.min(40, newText.length));
                    return content.includes(sample);
                  }

                  // Step 1: Find the editor
                  let editor = null;
                  let hasSelection = sel && sel.rangeCount > 0 && !sel.isCollapsed;

                  if (hasSelection) {
                    editor = findEditor(sel.getRangeAt(0).commonAncestorContainer);
                  }

                  if (!editor) {
                    const candidates = document.querySelectorAll(
                      'div[contenteditable="true"], .ql-editor, div[role="textbox"]'
                    );
                    for (const c of candidates) {
                      const r = c.getBoundingClientRect();
                      if (r.width === 0 || r.height === 0) continue;
                      if ((c.textContent || '').includes(oldText)) {
                        editor = c;
                        break;
                      }
                    }
                  }

                  if (!editor) return { success: false, error: 'No editor found' };
                  console.log('MrGrammar: Found editor', editor.className, editor.tagName);

                  // Step 2: Focus and ensure selection
                  editor.focus();
                  if (!hasSelection) {
                    hasSelection = selectText(editor, oldText);
                  }
                  if (!hasSelection) return { success: false, error: 'Could not select text' };

                  // Step 3: Try multiple replacement methods

                  // Method A: execCommand insertText (works with Quill, basic contenteditable)
                  {
                    const ok = document.execCommand('insertText', false, newText);
                    if (ok && hasNewText(editor)) {
                      return { success: true, method: 'execCommand-insertText' };
                    }
                    // If execCommand claimed success but text isn't there, re-select for next attempt
                    if (!hasNewText(editor) && (editor.textContent || '').includes(oldText)) {
                      selectText(editor, oldText);
                    }
                  }

                  // Method B: Synthetic paste via ClipboardEvent (works with many modern editors)
                  {
                    if (sel.isCollapsed && (editor.textContent || '').includes(oldText)) {
                      selectText(editor, oldText);
                    }
                    if (sel.rangeCount > 0 && !sel.isCollapsed) {
                      const dt = new DataTransfer();
                      dt.setData('text/plain', newText);
                      dt.setData('text/html', newText.replace(/\n/g, '<br>'));
                      editor.dispatchEvent(new ClipboardEvent('paste', {
                        clipboardData: dt, bubbles: true, cancelable: true
                      }));
                      if (hasNewText(editor)) {
                        return { success: true, method: 'paste-event' };
                      }
                    }
                  }

                  // Method C: beforeinput with insertText (works with Lexical/ProseMirror editors)
                  {
                    if (sel.isCollapsed && (editor.textContent || '').includes(oldText)) {
                      selectText(editor, oldText);
                    }
                    if (sel.rangeCount > 0 && !sel.isCollapsed) {
                      editor.dispatchEvent(new InputEvent('beforeinput', {
                        inputType: 'insertText', data: newText,
                        bubbles: true, cancelable: true, composed: true
                      }));
                      editor.dispatchEvent(new InputEvent('input', {
                        inputType: 'insertText', data: newText, bubbles: true
                      }));
                      if (hasNewText(editor)) {
                        return { success: true, method: 'beforeinput-insertText' };
                      }
                    }
                  }

                  // Method D: beforeinput with insertFromPaste (another modern editor pattern)
                  {
                    if (sel.isCollapsed && (editor.textContent || '').includes(oldText)) {
                      selectText(editor, oldText);
                    }
                    if (sel.rangeCount > 0 && !sel.isCollapsed) {
                      const dt = new DataTransfer();
                      dt.setData('text/plain', newText);
                      editor.dispatchEvent(new InputEvent('beforeinput', {
                        inputType: 'insertFromPaste', data: null, dataTransfer: dt,
                        bubbles: true, cancelable: true, composed: true
                      }));
                      editor.dispatchEvent(new InputEvent('input', {
                        inputType: 'insertFromPaste', bubbles: true
                      }));
                      if (hasNewText(editor)) {
                        return { success: true, method: 'beforeinput-paste' };
                      }
                    }
                  }

                  // Method E: Direct DOM replacement (last resort — may desync editor state)
                  {
                    if (sel.isCollapsed && (editor.textContent || '').includes(oldText)) {
                      selectText(editor, oldText);
                    }
                    if (sel.rangeCount > 0 && !sel.isCollapsed) {
                      const range = sel.getRangeAt(0);
                      range.deleteContents();
                      range.insertNode(document.createTextNode(newText));
                      // Collapse selection to end of inserted text
                      sel.collapseToEnd();

                      // Trigger events so editor frameworks pick up the change
                      editor.dispatchEvent(new InputEvent('input', {
                        inputType: 'insertText', data: newText, bubbles: true
                      }));
                      editor.dispatchEvent(new Event('change', { bubbles: true }));
                      editor.dispatchEvent(new CompositionEvent('compositionend', {
                        bubbles: true, data: newText
                      }));

                      if (hasNewText(editor)) {
                        return { success: true, method: 'direct-dom' };
                      }
                    }
                  }

                  return { success: false, error: 'All 5 methods failed' };
                } catch (e) {
                  return { success: false, error: e.message };
                }
              },
              args: [correctedText, text]
            });
            directSuccess = results && results[0] && results[0].result && results[0].result.success;
            console.log("LinkedIn direct injection result:", results && results[0] && results[0].result);
          } catch (e) {
            console.error("LinkedIn direct injection failed:", e);
          }

          // Fallback to content script message passing
          if (!directSuccess) {
            console.log("Direct injection failed, falling back to content script");
            try {
              chrome.tabs.sendMessage(tabId, {
                action: "replaceText",
                originalText: text,
                correctedText: correctedText
              });
            } catch (error) {
              console.log("Content script fallback also failed:", error);
            }
          }
        } else {
          try {
            chrome.tabs.sendMessage(tabId, {
              action: "replaceText",
              originalText: text,
              correctedText: correctedText
            });
          } catch (error) {
            console.log("Error sending correction to page:", error);
          }
        }
      } catch (error) {
        console.error("Error in background.js:", error);
        await trackGrammarCorrection(text, null, false);
        try {
          await chrome.tabs.sendMessage(tabId, {
              action: "showError",
              message: `Error: ${error.message || "Failed to process text. Please try again."}`
            }).catch(() => {});
        } catch (msgError) {
          console.log("Could not show error message to user");
        }
      }
    } catch (error) {
      console.error("Error in processSelectedText:", error);
    }
  }
  const PROXY_URL = "https://proxy-khaki-eight-20.vercel.app/api/grammar";

  async function fixGrammarWithGemini(text) {
    try {
      const response = await fetch(PROXY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ text })
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || `Server error: ${response.status}`);
      }
      const data = await response.json();
      console.log("Gemini response:", data);
      return data.correctedText || text;
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
      stats.apiTotalCount++;
      if (success && correctedText) {
        stats.apiSuccessCount++;
        stats.totalCorrections++;
        const wordCount = originalText.trim().split(/\s+/).filter(word => word.length > 0).length;
        stats.wordsCorrected += wordCount;
      }
      const apiSuccessRate = stats.apiTotalCount > 0 
        ? Math.round((stats.apiSuccessCount / stats.apiTotalCount) * 100)
        : 0;
      if (stats.replacementTotalCount > 0) {
        const replacementSuccessRate = Math.round((stats.replacementSuccessCount / stats.replacementTotalCount) * 100);
        stats.accuracyRate = Math.round((apiSuccessRate * replacementSuccessRate) / 100);
      } else {
        stats.accuracyRate = apiSuccessRate;
      }
      await chrome.storage.local.set({ grammarStats: stats });
      console.log('API statistics updated:', stats);
      console.log(`API Success: ${stats.apiSuccessCount}/${stats.apiTotalCount}`);
      console.log(`Replacement Success: ${stats.replacementSuccessCount}/${stats.replacementTotalCount}`);
      console.log(`Current Accuracy Rate: ${stats.accuracyRate}%`);
    } catch (error) {
      console.error('Error updating API statistics:', error);
    }
  }
